# Ceed Publisher Console (CPC) — Media-Side Dashboard Specification

| | |
|---|---|
| **Document version** | 1.0 |
| **Status** | Final draft for implementation |
| **Applies to** | Existing media apps (publishers) that already operate chat products and integrate the Ceed Ads SDK (Web/iOS) |
| **Primary objective** | Let media partners self-serve onboarding + verify integration + monitor performance with minimal UI complexity |

---

## Table of Contents

1. [Best-practice product design summary](#best-practice-product-design-summary)
2. [Data visibility rules](#data-visibility-rules)
3. [Glossary](#glossary)
4. [Goals, non-goals, and scope](#goals-non-goals-and-scope)
5. [Users, roles, tenancy](#users-roles-tenancy)
6. [Information architecture](#information-architecture)
7. [Functional requirements](#functional-requirements)
   - [Auth and onboarding](#auth-and-onboarding)
   - [Apps and integration guide](#apps-and-integration-guide)
   - [Analytics](#analytics)
   - [Logs explorer](#logs-explorer)
   - [App settings](#app-settings)
   - [Team management](#team-management)
8. [Data model (Firestore)](#data-model-firestore)
9. [API specifications](#api-specifications)
   - [Dashboard APIs](#dashboard-apis)
   - [Required changes to existing SDK-facing APIs](#required-changes-to-existing-sdk-facing-apis)
10. [Security, privacy, and compliance](#security-privacy-and-compliance)
11. [Technical stack](#technical-stack)
12. [Concrete implementation plan](#concrete-implementation-plan)
13. [Firestore indexes](#firestore-indexes)
14. [Acceptance criteria checklist](#acceptance-criteria-checklist)

---

## Best-practice product design summary

This feature targets teams who already have a working chat app and are integrating Ceed Ads. The best-practice design is:

| Principle | Description |
|-----------|-------------|
| **Fast verification loop** | Show only the six KPI metrics needed to confirm "it's working," and provide logs to debug when it's not. |
| **Minimal cognitive load** | Avoid complex breakdowns in analytics UI; keep all deeper troubleshooting in Logs. |
| **Trustworthy, verifiable data** | Every KPI must be traceable back to underlying request/event logs (even if the KPI UI stays minimal). |
| **Privacy-first by default** | Do not expose or store full user chat messages unless explicitly configured. |
| **Safe multi-tenant isolation** | Organizations must never access other organizations' apps, logs, or metrics. |
| **Self-serve onboarding with predictable defaults** | New apps get sensible default settings aligned with the current SDK behavior. |

---

## Data visibility rules

- **[User-visible]** = stored and displayed somewhere in CPC so users can verify it
- **[Backend-only]** = stored but never directly displayed in CPC UI (used for UX/features, security, performance, or future expansion)

> **Rule:** Every requirement and every relevant data field must be labeled as `[User-visible]` or `[Backend-only]`.

---

## Glossary

| Term | Definition |
|------|------------|
| **CPC** | Ceed Publisher Console (this dashboard product) |
| **Media app / Publisher** | The chat app integrating Ceed Ads SDK and showing ads |
| **Organization** | Tenant boundary; owns apps and members |
| **App** | A unique integration instance identified by `appId` used by the SDK |
| **Request** | A call to `/api/requests` that may return an ad (or not) |
| **Event** | A call to `/api/events` (impression or click) |
| **Fill rate** | Successful requests / total requests |
| **CTR** | Clicks / impressions |

---

## Goals, non-goals, and scope

### Goals

- **[User-visible] FR-GOAL-1:** CPC must let media partners create/manage apps and obtain `appId` for SDK initialization.
- **[User-visible] FR-GOAL-2:** CPC must display only the six KPI metrics needed for integration verification and ongoing monitoring.
- **[User-visible] FR-GOAL-3:** CPC must provide request/event logs to debug integration issues.
- **[User-visible] FR-GOAL-4:** CPC must allow per-app settings that affect serving (cooldown, CORS origins, supported languages, context logging mode).
- **[Backend-only] FR-GOAL-5:** All data access must be tenant-isolated and enforced on the server.

### Non-goals

- **[Backend-only] FR-NONGOAL-1:** No advertiser-side campaign management (ads/advertisers creation, budgets, billing).
- **[Backend-only] FR-NONGOAL-2:** No A/B testing UI.
- **[Backend-only] FR-NONGOAL-3:** No additional ad formats beyond current `action_card`.
- **[Backend-only] FR-NONGOAL-4:** No payouts/revenue reporting unless data already exists elsewhere.

---

## Users, roles, tenancy

### Roles

| Role | Permissions |
|------|-------------|
| **Owner** | manage org/apps/settings/members |
| **Developer** | manage apps/settings, view analytics/logs |
| **Analyst** | view analytics/logs (optional restriction for logs) |

### Tenancy constraints

- **[Backend-only] FR-TEN-1:** All reads/writes must be scoped to the authenticated user's organizations.
- **[Backend-only] FR-TEN-2:** A user must never be able to enumerate or access apps outside their organizations.

### Permissions

- **[Backend-only] FR-PERM-1:** Permissions must be enforced server-side (not only by UI hiding).

---

## Information architecture

**[User-visible] FR-IA-1:** CPC must include:

- Login
- Organization switcher (if user belongs to multiple orgs)
- Apps list
- App detail:
  - Overview (KPIs only)
  - Logs (Requests / Events)
  - Settings
  - Integration guide (Web / iOS)
- Members (Owner only)

---

## Functional requirements

### Auth and onboarding

- **[User-visible] FR-AUTH-1:** CPC must support user sign-in using Firebase Authentication.
- **[Backend-only] FR-AUTH-2:** CPC must use server-verified auth (Firebase Admin verification) for all dashboard APIs.
- **[User-visible] FR-ONB-1:** A signed-in user can create an Organization.
- **[Backend-only] FR-ONB-2:** The creator of an Organization becomes an Owner member automatically.
- **[User-visible] FR-ONB-3:** A user can switch between organizations they belong to.

### Apps and integration guide

#### App creation

- **[User-visible] FR-APP-1:** An Owner/Developer can create a new App.
- **[Backend-only] FR-APP-2:** `appId` must be generated by the system (non-guessable; UUID recommended).
- **[User-visible] FR-APP-3:** App creation must capture:
  - `appName`
  - `platforms` (web, ios) (multi-select)
- **[Backend-only] FR-APP-4:** App defaults must be automatically applied at creation:
  - `cooldownSeconds` = 60
  - `allowedOrigins` = `["*"]`
  - `supportedLanguages` = `["eng","jpn"]`
  - `contextLoggingMode` = `"truncated"`

#### Apps list

- **[User-visible] FR-APP-5:** Apps list must show: `appName`, `platforms`, `status`, `createdAt` (optional), and allow navigation to App detail.
- **[Backend-only] FR-APP-6:** Apps list data must be filtered by org membership.

#### Integration guide

- **[User-visible] FR-INT-1:** App detail must show an Integration guide containing:
  - the `appId`
  - the SDK initialization parameter(s) required
  - the API base URL used by SDKs (prod and local/dev guidance)
  - required request parameters: `conversationId`, `messageId`, `contextText`
  - optional parameters: `userId`
- **[Backend-only] FR-INT-2:** Integration guide content must be generated from app data (no manual editing required).

### Analytics

#### KPI display (ONLY these)

- **[User-visible] FR-ANA-1:** App Overview must display exactly these metrics for a selectable time range:
  1. Total ad requests
  2. Successful requests (ad returned)
  3. Impressions
  4. Clicks
  5. CTR = clicks / impressions
  6. Fill rate = successful requests / total ad requests
- **[User-visible] FR-ANA-2:** Time range selector must support presets (Last 24h / 7d / 30d) and custom date range.
- **[User-visible] FR-ANA-3:** If charts are included, they must visualize only the six metrics above (no breakdown dimensions in analytics UI).

#### Metric definitions

- **[User-visible] FR-ANA-4:** Definitions:
  - **Total ad requests** = count of request logs for the app in the range (all statuses).
  - **Successful requests** = count of request logs where `status` = `success`.
  - **Impressions** = count of event logs where `type` = `impression`.
  - **Clicks** = count of event logs where `type` = `click`.

#### Edge cases

- **[User-visible] FR-ANA-5:** Division-by-zero handling:
  - If impressions = 0 → CTR displays as `0%` (or `—`, but must be consistent across UI and exports).
  - If total requests = 0 → fill rate displays as `0%` (or `—`, consistent across UI and exports).

#### Backend-only analytics data

- **[Backend-only] FR-ANA-6:** The system may store additional analytics-related fields or pre-aggregations, but CPC analytics UI must not display any additional metrics or breakdowns.

#### Analytics export

- **[User-visible] FR-ANA-7:** If CPC supports exporting analytics from the Overview page, export must include only the six metrics and the time range.

### Logs explorer

#### Requests log

- **[User-visible] FR-LOG-1:** CPC must show a Requests log for an App with:
  - `createdAt`
  - `status` (success/no_ad/error)
  - `conversationId`
  - `messageId`
  - `decidedAdId` (if any)
  - `reason` (if present)
  - `latencyMs` (if present)
  - `sdkVersion` (if present)
  - `language` (if present)
  - `userId` (if present)
- **[Backend-only] FR-LOG-2:** Requests log queries must be filtered by `appId` and constrained by the selected org/app authorization.
- **[User-visible] FR-LOG-3:** Requests log must support filtering by:
  - date range
  - status
  - conversationId
  - decidedAdId
  - sdkVersion
  - reason

#### Events log

- **[User-visible] FR-LOG-4:** CPC must show an Events log for an App with:
  - `createdAt`
  - `type` (impression/click)
  - `requestId`
  - `adId`
  - `advertiserId`
  - `conversationId` (if present)
  - `userId` (if present)
- **[User-visible] FR-LOG-5:** Events log must support filtering by:
  - date range
  - type
  - requestId
  - adId / advertiserId
  - conversationId

#### Linking

- **[User-visible] FR-LOG-6:** From a request row, CPC must allow navigating to "related events" filtered by `requestId`.

#### Privacy handling in logs

- **[Backend-only] FR-LOG-7:** `contextText` must not be displayed in CPC by default (regardless of storage mode).

#### Exports

- **[User-visible] FR-LOG-8:** CPC may export filtered Requests logs and Events logs to CSV.

### App settings

- **[User-visible] FR-SET-1:** CPC must allow setting per-app `cooldownSeconds` (integer):
  - default: 60
  - min: 0
  - max: 3600
- **[Backend-only] FR-SET-2:** `/api/requests` must use the app's `cooldownSeconds` (not a hardcoded constant) when the app exists.
- **[User-visible] FR-SET-3:** CPC must allow managing per-app `allowedOrigins`:
  - default: `["*"]`
  - if not `["*"]`, list must contain only valid origins (scheme + host + optional port)
- **[Backend-only] FR-SET-4:** For web SDK traffic, backend CORS must respect `allowedOrigins` (see API section).
- **[User-visible] FR-SET-5:** CPC must allow selecting `supportedLanguages` (subset of `["eng","jpn"]`).
- **[Backend-only] FR-SET-6:** If detected language is not in `supportedLanguages`, backend must return no ad with `reason` = `unsupported_language`.

#### Context logging mode

- **[User-visible] FR-SET-7:** CPC must expose `contextLoggingMode` with:
  - `none`
  - `truncated`
  - `hashed`
  - `full`
- **[Backend-only] FR-SET-8:** Backend must store request `contextText` according to `contextLoggingMode`:
  - **none:** store no `contextText` field
  - **truncated:** store first N characters (N fixed; recommended 64) and store `contextTextMode="truncated"`
  - **hashed:** store hash only (e.g., SHA-256) and store `contextTextMode="hashed"`
  - **full:** store full `contextText` and store `contextTextMode="full"`

### Team management

- **[User-visible] FR-TEAM-1:** Owner can invite a member by email and assign a role.
- **[User-visible] FR-TEAM-2:** Owner can change roles and remove members.
- **[Backend-only] FR-TEAM-3:** The system must prevent removing the last Owner of an Organization.
- **[Backend-only] FR-TEAM-4:** Membership enforcement must occur server-side for all dashboard APIs.

---

## Data model (Firestore)

### Entities and field visibility

#### Organizations (`organizations/{orgId}`)

| Field | Visibility |
|-------|------------|
| `orgId` | [Backend-only] |
| `name` | [User-visible] |
| `meta.createdAt` | [Backend-only] |
| `meta.updatedAt` | [Backend-only] |

#### Organization Members (`organizationMembers/{orgId}_{userId}` or subcollection)

| Field | Visibility |
|-------|------------|
| `orgId` | [Backend-only] |
| `userId` | [Backend-only] |
| `email` | [User-visible] (shown in Members UI) |
| `role` | [User-visible] |
| `meta.createdAt` | [Backend-only] |
| `meta.updatedAt` | [Backend-only] |

#### Apps (`apps/{appId}`)

| Field | Visibility |
|-------|------------|
| `appId` | [User-visible] (Integration guide) |
| `orgId` | [Backend-only] |
| `appName` | [User-visible] |
| `platforms` | [User-visible] |
| `status` ("active" \| "suspended") | [User-visible] |
| `settings.cooldownSeconds` | [User-visible] |
| `settings.allowedOrigins` | [User-visible] |
| `settings.supportedLanguages` | [User-visible] |
| `settings.contextLoggingMode` | [User-visible] |
| `settings.contextTruncateLength` | [Backend-only] (fixed system value; optional to store) |
| `meta.createdAt` | [Backend-only] |
| `meta.updatedAt` | [Backend-only] |

#### Requests (`requests/{requestId}`) — existing, with some rules

| Field | Visibility |
|-------|------------|
| `requestId` | [Backend-only] |
| `appId` | [Backend-only] (implicit in CPC by app context) |
| `conversationId` | [User-visible] (Logs) |
| `messageId` | [User-visible] (Logs) |
| `contextText` | [Backend-only] |
| `contextTextMode` | [Backend-only] |
| `contextTextHash` | [Backend-only] (only when hashed mode) |
| `language` | [User-visible] (Logs) |
| `decidedAdId` | [User-visible] (Logs) |
| `status` | [User-visible] (Logs) |
| `reason` | [User-visible] (Logs) |
| `latencyMs` | [User-visible] (Logs) |
| `sdkVersion` | [User-visible] (Logs) |
| `userId` | [User-visible] (Logs, if present) |
| `meta.createdAt` | [User-visible] (Logs) |
| `meta.updatedAt` | [Backend-only] |

**Optional request metadata (recommended):**

| Field | Visibility |
|-------|------------|
| `client.userAgent` | [Backend-only] |
| `client.origin` | [Backend-only] (web requests) |
| `client.ipHash` | [Backend-only] |

#### Events (`events/{eventId}`) — existing, tightened

| Field | Visibility |
|-------|------------|
| `eventId` | [Backend-only] |
| `type` | [User-visible] (Logs) |
| `adId` | [User-visible] (Logs) |
| `advertiserId` | [User-visible] (Logs) |
| `requestId` | [User-visible] (Logs) |
| `appId` | [Backend-only] (implicit; required for analytics computation) |
| `conversationId` | [User-visible] (Logs, if present) |
| `userId` | [User-visible] (Logs, if present) |
| `meta.createdAt` | [User-visible] (Logs) |
| `meta.updatedAt` | [Backend-only] |

#### Audit logs (recommended) — `auditLogs/{auditId}`

| Field | Visibility |
|-------|------------|
| `orgId` | [Backend-only] |
| `actorUserId` | [Backend-only] |
| `actorEmail` | [Backend-only] |
| `actionType` | [Backend-only] |
| `targetAppId` | [Backend-only] |
| `diff` | [Backend-only] |
| `meta.createdAt` | [Backend-only] |

---

## API specifications

### Dashboard APIs

All dashboard APIs are authenticated and tenant-scoped.

- **[Backend-only] FR-DAPI-1:** All dashboard endpoints must:
  - authenticate the user (Firebase ID token / session cookie)
  - authorize the user for the org/app being accessed
  - return only data for authorized org/app

#### Required dashboard endpoints (minimum)

##### Auth/session

- **[Backend-only] FR-DAPI-2:** Provide an endpoint to establish a server session from a Firebase ID token (session cookie pattern).
- **[Backend-only] FR-DAPI-3:** Provide an endpoint to clear the session.

##### Organizations

- **[User-visible] FR-DAPI-4:** Create org
- **[User-visible] FR-DAPI-5:** List orgs user belongs to

##### Apps

- **[User-visible] FR-DAPI-6:** Create app
- **[User-visible] FR-DAPI-7:** List apps by org
- **[User-visible] FR-DAPI-8:** Read app detail (includes settings)
- **[User-visible] FR-DAPI-9:** Update app settings (cooldown, origins, languages, context logging mode)
- **[Backend-only] FR-DAPI-10:** App update must create an audit log entry.

##### Analytics

- **[User-visible] FR-DAPI-11:** Read analytics summary for an app + time range, returning only:
  - `totalRequests`
  - `successfulRequests`
  - `impressions`
  - `clicks`
  - `ctr`
  - `fillRate`

##### Logs

- **[User-visible] FR-DAPI-12:** List requests for app with filters + pagination
- **[User-visible] FR-DAPI-13:** List events for app with filters + pagination

##### Members

- **[User-visible] FR-DAPI-14:** List members for org
- **[User-visible] FR-DAPI-15:** Invite member (Owner only)
- **[User-visible] FR-DAPI-16:** Update member role (Owner only)
- **[User-visible] FR-DAPI-17:** Remove member (Owner only, last-owner protection)

### Required changes to existing SDK-facing APIs

#### `/api/requests` (ad request)

- **[Backend-only] FR-REQ-1:** When `appId` exists in `apps/{appId}` and status is active:
  - apply per-app settings (`cooldownSeconds`, `supportedLanguages`, `allowedOrigins` (web), `contextLoggingMode`)
- **[Backend-only] FR-REQ-2:** When `appId` does not exist:
  - treat as legacy traffic with default settings (same as current behavior), but do not allow CPC to "claim" that `appId` later (since appIds are system-generated only).
- **[Backend-only] FR-REQ-3:** Request logging must store `contextText` according to the resolved `contextLoggingMode` (app-based if registered, default if legacy).
- **[Backend-only] FR-REQ-4:** Request log must store `status` and `reason` consistently:
  - `success`: ad returned
  - `no_ad`: no eligible ad OR cooldown OR unsupported_language
  - `error`: backend error
- **[Backend-only] FR-REQ-5:** For cooldown-based no-ad returns, `reason` must be `cooldown_active`.
- **[Backend-only] FR-REQ-6:** For unsupported language no-ad returns, `reason` must be `unsupported_language`.

#### CORS behavior (web)

- **[Backend-only] FR-CORS-1:** If `allowedOrigins` = `["*"]`, respond with `Access-Control-Allow-Origin: *`.
- **[Backend-only] FR-CORS-2:** If `allowedOrigins` is a list of specific origins, and request Origin matches one of them:
  - respond with `Access-Control-Allow-Origin: <request origin>`
  - respond with `Vary: Origin`
- **[Backend-only] FR-CORS-3:** If `allowedOrigins` is specific and request Origin does not match:
  - respond with an error (recommended 403) OR respond without CORS headers (must be consistent; choose one and implement consistently).

#### `/api/events` (impression/click)

- **[Backend-only] FR-EVT-1:** Event ingestion must verify the `requestId` exists in requests.
- **[Backend-only] FR-EVT-2:** Event ingestion must verify that the event matches the request:
  - `request.status` must be `success`
  - `request.decidedAdId` must match `payload.adId`
  - `advertiserId` must match the resolved ad's `advertiserId` if available (or match request-derived `advertiserId` if stored)
- **[Backend-only] FR-EVT-3:** Event ingestion must store `appId` on the event (derived from the request, even if client omits `appId`).
- **[Backend-only] FR-EVT-4:** If validation fails, the endpoint must reject the event (recommended 400) and must not write an event log.

> **Note:** This improves data trustworthiness for CPC metrics without requiring any new SDK auth secrets.

---

## Security, privacy, and compliance

- **[Backend-only] FR-SEC-1:** Multi-tenant isolation must be enforced server-side for all dashboard APIs.
- **[Backend-only] FR-SEC-2:** Firestore security rules must deny direct client access to org/app membership data unless explicitly required. (Recommended: keep reads/writes through server APIs only.)
- **[Backend-only] FR-SEC-3:** Requests/events collections should not be writable directly by clients (recommended: only server Admin writes).
- **[Backend-only] FR-SEC-4:** Default `contextLoggingMode` must be `truncated` (not `full`).
- **[Backend-only] FR-SEC-5:** CPC must not display `contextText` in UI by default.
- **[Backend-only] FR-SEC-6:** Store only the minimum necessary PII (`userId` is optional and treated as opaque string).

---

## Technical stack

To minimize risk and align with the current Ceed Ads codebase, CPC must use:

### Frontend

- **Next.js** (App Router) + React + TypeScript
- **UI styling:** Tailwind CSS (recommended for speed and consistency)
- **Charts (optional):** Recharts (simple time-series for the six metrics)

### Backend (within the same Next.js app)

- **Next.js Route Handlers** for:
  - existing SDK APIs (`/api/requests`, `/api/events`)
  - CPC dashboard APIs (`/api/dashboard/*`)
- **Validation:** Zod (recommended) for request/response schema safety

### Auth

- Firebase Authentication (client)
- Firebase Admin SDK (server token verification + optional session cookies)

### Database

- Firestore (Firebase)
- Admin SDK reads/writes from server route handlers

### Deployment

- Vercel for Next.js hosting (consistent with existing ceed-ads.vercel.app)
- Firebase project for Auth + Firestore

### Configuration (environment variables)

- Firebase client config (`apiKey`, `authDomain`, `projectId`, etc.) — [Backend-only]
- Firebase Admin credentials — [Backend-only]
- Any existing Google Translation credentials remain for ad decision engine — [Backend-only]

---

## Concrete implementation plan

> This section is written to be directly usable by an automated coding agent.

### Phase 1 — Data model + initialization

- Create Firestore collections and documents:
  - `organizations`
  - `organizationMembers`
  - `apps`
  - `auditLogs`
- Decide and enforce server timestamp usage:
  - **[Backend-only]** use Firestore server timestamps for `meta.createdAt`/`meta.updatedAt` on all new docs.

### Phase 2 — Authentication/session foundation

- Implement Firebase Auth sign-in UI.
- Implement server verification of user identity for dashboard APIs:
  - recommended: session cookie flow (ID token → session cookie)
- Implement route protection for CPC pages:
  - unauthenticated users redirected to login.

### Phase 3 — Organization + membership

- **Organization creation endpoint:**
  - creates org doc
  - creates membership doc for creator as Owner
- **Organization listing endpoint:**
  - returns orgs user belongs to
- **Member management:**
  - list members
  - invite member (email + role)
  - update role
  - remove member with last-owner protection

### Phase 4 — Apps + settings

- **App creation:**
  - generate `appId` server-side
  - store default settings
- Apps list + app detail endpoints
- **Settings update endpoint:**
  - validates constraints (cooldown range, origin format, language subset)
  - writes audit log entry capturing before/after settings

### Phase 5 — Logs APIs (requests/events)

- **Requests listing endpoint:**
  - filters: date range, status, conversationId, decidedAdId, sdkVersion, reason
  - pagination: stable sort by `meta.createdAt` desc, then docId desc
- **Events listing endpoint:**
  - filters: date range, type, requestId, adId, advertiserId, conversationId
  - pagination: stable sort by `meta.createdAt` desc, then docId desc

### Phase 6 — Analytics API (six metrics only)

- Implement analytics summary endpoint that:
  - takes `appId` + time range
  - computes counts:
    - `totalRequests`
    - `successfulRequests`
    - `impressions`
    - `clicks`
  - computes:
    - `ctr`
    - `fillRate`
- **Implementation guidance:**
  - Use Firestore aggregation count queries (recommended) to avoid downloading documents.
  - Always filter by `appId` + `createdAt` range.

### Phase 7 — Required changes to `/api/requests`

- On request:
  - fetch app by `appId` (if exists)
  - apply `cooldownSeconds` + `supportedLanguages`
  - apply `contextLoggingMode` when persisting request logs
- If app not found:
  - apply legacy defaults
  - still log request (with default context logging mode)
- Ensure consistent reason strings:
  - `cooldown_active`
  - `unsupported_language`
  - (others as currently used)

### Phase 8 — Required changes to `/api/events`

- Validate `requestId` exists and is successful.
- Validate `adId` matches `request.decidedAdId`.
- Store `appId` on event derived from the request.
- Reject invalid events and do not store them.

### Phase 9 — CPC UI pages

- Apps list page
- App detail:
  - **Overview:** show only the six metrics (+ optional charts limited to the same six)
  - **Logs:** requests/events with filtering + pagination + CSV export
  - **Settings:** cooldown, origins, languages, context logging mode
  - **Integration guide:** `appId` and parameter explanations
- Members page for Owners

### Phase 10 — Hardening + operational readiness (minimum)

- Add Firestore composite indexes needed for queries (see below).
- Add basic rate limiting at the API edge (recommended; backend-only):
  - **[Backend-only] FR-OPS-1:** rate limit `/api/requests` and `/api/events` by IP and/or `appId` to reduce abuse.

---

## Firestore indexes

These indexes are required for efficient queries (names are illustrative):

### Requests (`requests`)

| Fields |
|--------|
| `appId` + `meta.createdAt` (range queries) |
| `appId` + `status` + `meta.createdAt` |
| `appId` + `conversationId` + `meta.createdAt` |
| `appId` + `decidedAdId` + `meta.createdAt` |
| `appId` + `sdkVersion` + `meta.createdAt` |
| `appId` + `reason` + `meta.createdAt` |

### Events (`events`)

| Fields |
|--------|
| `appId` + `meta.createdAt` |
| `appId` + `type` + `meta.createdAt` |
| `appId` + `requestId` + `meta.createdAt` |
| `appId` + `adId` + `meta.createdAt` |
| `appId` + `advertiserId` + `meta.createdAt` |
| `appId` + `conversationId` + `meta.createdAt` |

---

## Acceptance criteria checklist

### Onboarding + app creation

- **[User-visible] AC-1:** A new user can sign in, create an org, and create an app.
- **[User-visible] AC-2:** CPC shows the `appId` in the integration guide.
- **[Backend-only] AC-3:** Users cannot access apps outside their org.

### Analytics

- **[User-visible] AC-4:** App Overview displays exactly six metrics and nothing else.
- **[User-visible] AC-5:** CTR and fill rate handle zero denominators consistently.

### Logs

- **[User-visible] AC-6:** Requests log supports filtering and pagination.
- **[User-visible] AC-7:** Events log supports filtering and pagination.
- **[Backend-only] AC-8:** `contextText` is not displayed in CPC by default.

### Serving settings enforcement

- **[Backend-only] AC-9:** `cooldownSeconds` changes affect `/api/requests` behavior for that app.
- **[Backend-only] AC-10:** `supportedLanguages` changes affect `/api/requests` behavior with reason `unsupported_language`.
- **[Backend-only] AC-11:** events are rejected if `requestId`/`adId` validation fails.

### Team management

- **[User-visible] AC-12:** Owner can invite, change roles, and remove members.
- **[Backend-only] AC-13:** The system prevents removing the last owner.
