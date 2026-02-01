# Ceed Publisher Console - Project Context

> **Last Updated**: 2026-01-31

## Purpose and Role

The **Ceed Publisher Console (CPC)** is a self-service dashboard designed for **media publishers** (external partners) who integrate the Ceed Ads SDK into their applications. It enables publishers to:

- **Onboard independently**: Create organizations and register apps without Ceed staff involvement
- **Verify SDK integration**: Access integration guides and test their setup
- **Monitor performance**: Track 6 key performance indicators (KPIs) for their ad inventory
- **Analyze traffic**: Explore detailed logs of ad requests and events
- **Manage teams**: Invite team members with role-based access control

This is a **B2B SaaS tool** that gives media partners visibility and control over their participation in the Ceed Ads network.

---

## Ceed Ads System Architecture

### Two-Dashboard Model

The Ceed Ads platform operates with **two separate dashboards** serving different stakeholders:

| Dashboard | Audience | Primary Function |
|-----------|----------|------------------|
| **Ads Admin Dashboard** | Ceed internal staff | Create and manage ad content (advertisers, ads) |
| **Publisher Console** (this repo) | External media partners | Monitor SDK performance, manage apps |

### Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CEED ADS ECOSYSTEM                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   [Internal]                              [External]                     │
│                                                                          │
│   ┌─────────────────────┐                 ┌─────────────────────┐       │
│   │ Ads Admin Dashboard │                 │ Publisher Console   │       │
│   │ (Internal Staff)    │                 │ (Media Partners)    │       │
│   └──────────┬──────────┘                 └──────────┬──────────┘       │
│              │                                       │                   │
│              │ CRUD                                  │ Read-only         │
│              ▼                                       ▼                   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      Firestore Database                          │   │
│   │  advertisers │ ads │ requests │ events │ apps │ organizations   │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                       │
│                                  │ Ad Serving                            │
│                                  ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    SDK Endpoints                                 │   │
│   │              POST /api/requests (ad fetch)                       │   │
│   │              POST /api/events (impression/click)                 │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                Publisher Apps (Web/iOS)                          │   │
│   │               with Ceed Ads SDK integrated                       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key Distinction

| Aspect | Ads Admin Dashboard | Publisher Console |
|--------|---------------------|-------------------|
| **Users** | Ceed Biz/Ops/Engineering staff | External media partners |
| **Access Model** | Internal allowlist (`adminUsers`) | Self-service registration |
| **Primary Actions** | Create/edit advertisers and ads | Monitor SDK performance |
| **Data Access** | Read/Write ad content | Read-only analytics |
| **Authentication** | Internal Google accounts only | Any Google account |
| **Organization Scope** | N/A (single internal org) | Multi-tenant (many orgs) |

---

## Publisher Console Features

### Organization & Team Management
- Create organizations for companies/teams
- Invite members with role-based access:
  - **Owner**: Full control
  - **Developer**: Manage apps and settings
  - **Analyst**: View-only access to analytics

### App Management
- Register apps (Web, iOS platforms)
- Configure per-app settings:
  - Cooldown between ad requests
  - Allowed origins (CORS whitelist)
  - Supported languages (English, Japanese)
  - Context logging mode (privacy control)

### Analytics Dashboard (6 KPIs)
1. **Total Requests** - All ad requests from the app
2. **Successful Requests** - Requests that returned an ad
3. **Fill Rate** - Success rate percentage
4. **Total Impressions** - Ad views
5. **Total Clicks** - User interactions
6. **CTR (Click-Through Rate)** - Engagement rate

### Logs Explorer
- View detailed request/event logs
- Filter by status, platform, event type
- CSV export for external analysis

### Integration Support
- SDK setup documentation
- Platform-specific instructions (Web/iOS)
- API endpoint reference

---

## Current Ad Format

The Ceed Ads platform currently supports a single ad format:

### Action Card
- **Title**: Short headline (localized EN/JP)
- **Description**: Body text (localized EN/JP)
- **CTA Button**: Call-to-action with click URL
- **Context-based targeting**: Ads matched by keyword tags to content context

---

## Future Roadmap

### Planned Ad Formats
The system is designed to support additional ad formats in the future:

1. **Banner Ads** - Standard display formats (300x250, 728x90, etc.)
2. **Native Ads** - Content-integrated ad units
3. **Video Ads** - Pre-roll, mid-roll, outstream
4. **Interstitial Ads** - Full-screen formats

### Platform Expansion
- **Android SDK** - Native Android support
- **React Native SDK** - Cross-platform mobile support

### Enhanced Features
- Custom date range picker for analytics
- Real-time cooldown enforcement
- Advanced rate limiting
- Audit log viewer in UI

---

## Technical Context for AI Sessions

### Key Files and Directories

| Path | Purpose |
|------|---------|
| `src/app/(dashboard)/` | Protected dashboard pages |
| `src/app/api/dashboard/` | Authenticated API routes |
| `src/app/api/requests/` | Public SDK request endpoint |
| `src/app/api/events/` | Public SDK event endpoint |
| `src/lib/firebase/` | Firebase SDK initialization |
| `src/lib/db/` | Firestore operations |
| `src/contexts/` | React context providers |
| `src/hooks/` | Custom React hooks with TanStack Query |

### Authentication Flow
1. User signs in with Google (Firebase Auth)
2. Frontend exchanges Firebase ID token for session cookie
3. Middleware validates session cookie on protected routes
4. API routes verify session and check organization membership

### Data Fetching Pattern
- All Firestore access through API routes (no direct client access)
- TanStack Query for caching and state management
- 30-minute stale time for most queries
- Cache invalidation on mutations

### Multi-tenancy Model
- Users belong to organizations via `organizationMembers`
- Apps are scoped to organizations
- All queries filtered by `orgId`
- Role-based permissions within each organization

---

## Session History

### 2026-02-01: Email Invitation System - Custom Domain Setup (IN PROGRESS)

#### Background
The team invitation feature sends emails via Firebase Trigger Email from Firestore extension using Resend as the SMTP provider. Previously, emails were sent from `onboarding@resend.dev` (Resend's default domain). The goal was to set up a custom domain `0xqube.xyz` so emails come from `noreply@0xqube.xyz` for better branding and deliverability.

#### What Was Completed

1. **Resend Domain Verification** ✅
   - Added custom domain `0xqube.xyz` in Resend dashboard
   - Configured all required DNS records in Vercel:
     - **DKIM**: `resend._domainkey` TXT record → Verified
     - **MX**: `send` MX record (feedback-smtp.ap-northeast-1.amazonses.com, priority 10) → Verified
     - **SPF**: `send` TXT record (v=spf1 include:amazonses.com ~all) → Verified
     - **DMARC**: `_dmarc` TXT record (v=DMARC1; p=none;) → Verified
   - Domain status in Resend: **Verified** ✅
   - Region: Tokyo (ap-northeast-1)

2. **Vercel Environment Variable** ✅
   - Added `NEXT_PUBLIC_BASE_URL` = `https://ceed-publisher-console.vercel.app`
   - Redeployed application (deployment ID: AqYAp63cn)
   - This ensures invitation emails contain correct production URLs instead of `localhost:3000`

3. **IAM Permissions Added** ✅
   - Added roles to `741640952617-compute@developer.gserviceaccount.com`:
     - Cloud Functions Developer
     - Eventarc Event Receiver
     - Service Account User
   - Added roles to `741640952617@cloudbuild.gserviceaccount.com`:
     - Cloud Build Service Account
     - Cloud Functions Developer
     - Service Account User

#### Current Problem: Firebase Extension Installation Fails

**Error Message:**
```
RESOURCE_ERROR at /deployments/firebase-ext-firestore-send-email/resources/processQueue:
{
  "ResourceType": "gcp-types/cloudfunctions-v2beta:projects.locations.functions",
  "ResourceErrorCode": "400",
  "ResourceErrorMessage": "Build failed with status: FAILURE. Could not build the function due to a missing permission on the build service account."
}
```

**Root Cause Analysis:**
- The Firebase Trigger Email Extension fails to deploy its Cloud Function
- Even after adding IAM permissions, the Cloud Build process cannot complete
- The function shows "Unknown trigger" in Firebase Console, indicating Eventarc trigger was not properly created
- Possible causes:
  1. IAM permission propagation delay (can take up to 7 minutes)
  2. Different service account used for asia-northeast1 region builds
  3. Organization-level policy restrictions

**Extension Configuration Used:**
- Cloud Functions location: Tokyo (asia-northeast1)
- Firestore Instance Location: asia-northeast1
- SMTP connection URI: `smtps://resend:re_4wcS5SY1_LZKT9xRun9gLpxenAYUBoryg@smtp.resend.com:465`
- Email documents collection: `mail`
- Default FROM address: `noreply@0xqube.xyz`

#### What Needs to Be Done Next

1. **Option A: Wait and Retry**
   - IAM changes can take time to propagate
   - Wait 10-15 minutes then click "Retry installing" in Firebase Console

2. **Option B: Try us-central1 Region**
   - Uninstall the current extension
   - Reinstall with Cloud Functions location set to `us-central1` instead of `asia-northeast1`
   - This may use different service accounts that already have proper permissions

3. **Option C: Add More IAM Permissions**
   - Check Google Cloud Console → Cloud Build → Settings
   - Ensure all required APIs are enabled:
     - Cloud Build API
     - Cloud Functions API
     - Eventarc API
     - Artifact Registry API
   - Grant `roles/cloudbuild.builds.builder` to the Cloud Build service account

4. **Option D: Manual Investigation**
   - View Cloud Build logs at: https://console.cloud.google.com/cloud-build/builds;region=asia-northeast1?project=741640952617
   - Check for specific permission errors
   - May need to grant permissions to additional service accounts

#### Files Involved
- `src/lib/db/mail.ts` - Email sending function (creates documents in `mail` collection)
- `src/app/api/dashboard/members/route.ts` - Invitation API (calls sendInviteEmail)
- `src/app/api/dashboard/members/[memberId]/resend/route.ts` - Resend invitation API
- `src/app/invite/accept/page.tsx` - Invitation acceptance page

#### Firestore Data
- Documents are correctly being created in `mail` collection when invitations are sent
- The issue is that Firebase Extension is not processing these documents
- Example document structure:
  ```json
  {
    "to": "kimura.shungo@gmail.com",
    "message": {
      "subject": "You've been invited to join Ceed Dev on Ceed Publisher Console",
      "html": "...",
      "text": "..."
    }
  }
  ```

---

### 2026-01-31
- Initial CONTEXT.md created
- Documented system architecture and two-dashboard model
- Described Publisher Console's role vs Ads Admin Dashboard
- Outlined current features and future roadmap

---

## Related Repositories

- **ceed-ads-dashboard**: Internal admin dashboard for managing advertisers and ads
- **ceed-ads-web-sdk**: Web SDK for integrating Ceed Ads
- **ceed-ads-ios-sdk**: iOS SDK for integrating Ceed Ads
