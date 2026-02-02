# Ceed Publisher Console - Project Context

> **Last Updated**: 2026-02-02 15:45 JST

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

### 2026-02-02: Email Sending Test - Extension Trigger Not Working ⚠️

#### Test Result
Attempted to send an invitation email via Publisher Console. **Email was NOT delivered.**

#### Investigation Findings

1. **Mail document created correctly in Firestore**:
   - Collection: `mail`
   - Document ID: `F17i6zuC6lAOEjHnL5Kc`
   - Fields: `to`, `message.subject`, `message.html`, `message.text` all present
   - Recipient: `kimura.shungo@gmail.com`
   - Invite URL: `https://ceed-publisher-console.vercel.app/invite/accept?token=...` ✅

2. **`delivery` field is MISSING**:
   - This indicates the Firebase Extension is **NOT processing** the document
   - The Cloud Function is not being triggered by Firestore document creation

3. **Extension Configuration Verified**:
   - Email documents collection: `mail` ✅
   - SMTP connection URI: `smtps://resend:<API_KEY>@smtp.resend.com:465` ✅
   - Cloud Functions logs: **Empty** (no activity)

#### Root Cause
The "Unknown trigger" issue noted in the previous session was not just a display bug. The Firestore trigger for the Cloud Function (`ext-firestore-send-email-processqueue`) is **not properly configured**, meaning the function never fires when documents are created in the `mail` collection.

#### Resolution In Progress
Attempting to reinstall the Firebase Extension to fix the trigger configuration:
1. Uninstall current extension
2. Reinstall with correct settings:
   - Cloud Functions location: `asia-northeast1`
   - SMTP connection URI: `smtps://resend:<NEW_API_KEY>@smtp.resend.com:465`
   - Email documents collection: `mail`
   - Default FROM address: `noreply@0xqube.xyz`

#### Security Note
⚠️ **Resend API Key was exposed** during debugging. The key needs to be rotated in Resend dashboard after fixing the extension.

#### Next Steps
1. Complete extension reinstallation
2. Rotate Resend API key
3. Test email sending again
4. Verify `delivery.state: "SUCCESS"` appears in mail document

---

### 2026-02-02 (Earlier): Firebase Extension Installation - Root Cause Found and Fixed ✅

#### Summary
Identified and resolved the root cause of the Firebase Trigger Email Extension installation failure. Extension is now successfully installed.

#### Root Cause Identified
By examining Cloud Build logs via `gcloud builds describe`, found the actual error:

```
Access to bucket gcf-v2-sources-741640952617-asia-northeast1 denied.
You must grant Storage Object Viewer permission to 741640952617-compute@developer.gserviceaccount.com.
```

The Cloud Build process was failing because the compute service account couldn't read the source code from the GCS bucket.

#### Permissions Added

1. **Storage Object Viewer** on bucket `gcf-v2-sources-741640952617-asia-northeast1`:
   ```bash
   gcloud storage buckets add-iam-policy-binding gs://gcf-v2-sources-741640952617-asia-northeast1 \
     --member="serviceAccount:741640952617-compute@developer.gserviceaccount.com" \
     --role="roles/storage.objectViewer"
   ```

2. **Logs Writer** for Cloud Logging (recommended in build warnings):
   ```bash
   gcloud projects add-iam-policy-binding ceed-ads \
     --member="serviceAccount:741640952617-compute@developer.gserviceaccount.com" \
     --role="roles/logging.logWriter"
   ```

#### Installation Result
- ✅ **Extension installed successfully** (firebase/firestore-send-email@0.2.4)
- Firebase Console shows "Extension is up to date"
- Cloud Function `ext-firestore-send-email-processqueue` deployed to asia-northeast1

#### Note: Functions Tab Shows "Unknown trigger"
- The Firebase Functions dashboard shows "Unknown trigger" for the deployed function
- This may be a Firebase Console display issue
- Actual functionality needs to be verified by sending a test invitation email

#### Next Step: Functional Testing
To verify the extension works correctly:
1. Send an invitation email via Publisher Console (Members → Invite Member)
2. Check Firestore `mail` collection for the new document
3. Verify `delivery` field is added by the extension:
   - `delivery.state: "SUCCESS"` → Email sent successfully
   - `delivery.state: "ERROR"` → Check error details
4. Confirm email arrives at the recipient's inbox

#### Debugging Commands Used
```bash
# List Firebase extensions
firebase ext:list --project ceed-ads

# List recent Cloud Build failures
gcloud builds list --region=asia-northeast1 --limit=10

# Get detailed build info (includes base64-encoded error messages)
gcloud builds describe <BUILD_ID> --region=asia-northeast1 --format="yaml"

# Decode base64 error message
echo "<BASE64_STRING>" | base64 -d

# Check Cloud Function details (if trigger issues persist)
gcloud functions describe ext-firestore-send-email-processqueue --region=asia-northeast1 --project=ceed-ads
```

---

### 2026-02-01: Email Invitation System - Custom Domain Setup

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

#### Extension Configuration
- Cloud Functions location: Tokyo (asia-northeast1)
- Firestore Instance Location: asia-northeast1
- SMTP connection URI: `smtps://resend:<RESEND_API_KEY>@smtp.resend.com:465`
- Email documents collection: `mail`
- Default FROM address: `noreply@0xqube.xyz`

#### Files Involved
- `src/lib/db/mail.ts` - Email sending function (creates documents in `mail` collection)
- `src/app/api/dashboard/members/route.ts` - Invitation API (calls sendInviteEmail)
- `src/app/api/dashboard/members/[memberId]/resend/route.ts` - Resend invitation API
- `src/app/invite/accept/page.tsx` - Invitation acceptance page

#### Firestore Data
- Documents are correctly being created in `mail` collection when invitations are sent
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
