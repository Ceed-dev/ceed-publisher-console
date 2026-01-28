# Ceed Publisher Console (CPC)

A media-side dashboard for publishers integrating the Ceed Ads SDK. Partners can self-serve onboarding, verify SDK integration, and monitor performance with 6 KPI metrics.

**Live URL:** https://ceed-publisher-console.vercel.app

---

## Table of Contents

1. [Current Implementation Status](#current-implementation-status)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Environment Variables](#environment-variables)
7. [Firestore Data Model](#firestore-data-model)
8. [API Endpoints](#api-endpoints)
9. [Default Settings](#default-settings)
10. [Known Limitations](#known-limitations)

---

## Current Implementation Status

| Feature | Status |
|---------|--------|
| Google Authentication | Implemented |
| Organization Management | Implemented |
| Team Management (invite, roles) | Implemented |
| App Creation & Management | Implemented |
| 6 KPI Analytics Dashboard | Implemented |
| Request/Event Logging | Implemented |
| Logs Explorer with Filtering | Implemented |
| CSV Export | Implemented |
| Integration Guide | Implemented |
| App Settings (cooldown, origins, languages, context mode) | Implemented |
| Light/Dark Mode | Implemented |
| SDK Request API (`/api/requests`) | Implemented |
| SDK Event API (`/api/events`) | Implemented |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Authentication (Google sign-in only)
- **Database:** Firestore
- **Validation:** Zod
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Deployment:** Vercel

---

## Features

### Authentication
- Google sign-in only
- Server-side session cookies (5-day expiry)
- Protected routes via Next.js middleware

### Organization Management
- Create organizations
- Switch between organizations (if user belongs to multiple)
- Organization-scoped data isolation

### Team Management
- **Roles:**
  - **Owner** - Full access (manage org, apps, settings, members)
  - **Developer** - Manage apps and settings, view analytics/logs
  - **Analyst** - View analytics and logs only
- Invite members by email
- Change member roles
- Remove members (with last-owner protection)

### App Management
- Create apps with name and platform selection (Web, iOS)
- View app list with status badges
- Configure app settings:
  - **Cooldown Seconds** (0-3600, default: 30)
  - **Allowed Origins** (CORS whitelist, default: empty = allow all)
  - **Supported Languages** (eng, jpn)
  - **Context Logging Mode** (none, truncated, hashed, full)

### Analytics Dashboard (6 KPIs)
1. **Total Requests** - All ad requests for the app
2. **Successful Requests** - Requests that returned an ad
3. **Fill Rate** - Successful requests / Total requests
4. **Total Impressions** - Ad impression events
5. **Total Clicks** - Ad click events
6. **Click-Through Rate (CTR)** - Clicks / Impressions

**Time Range Options:** Today, 7 Days, 30 Days, 90 Days

### Logs Explorer
- **Requests Tab:**
  - Columns: Request ID, Status, Platform, Language, Response Time, Created At
  - Filters: Status (All/Success/Error/No Fill), Platform (All/Web/iOS)
  - Link to related events
- **Events Tab:**
  - Columns: Event ID, Type, Request ID, Ad ID, Origin, Created At
  - Filters: Event Type (All/Impression/Click)
- CSV Export for both tabs

### Integration Guide
- Displays App ID for SDK initialization
- Platform-specific setup instructions (Web/iOS)
- API endpoint documentation

### Theme
- Light/Dark mode toggle
- Persisted via next-themes

### Performance Optimizations
- **Client-side caching** - API responses cached for 30-60 seconds
- **Stale-while-revalidate** - Shows cached data immediately while fetching fresh data
- **Smart loading states** - Only shows spinners on initial load, subtle "Updating..." indicator for refreshes
- **No full-page spinners** - Previous data remains visible during navigation and time range changes

---

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with:
  - Authentication enabled (Google provider)
  - Firestore database created
  - Admin SDK credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/Ceed-dev/ceed-publisher-console.git
cd ceed-publisher-console

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials

# Deploy Firestore indexes
firebase deploy --only firestore:indexes --project YOUR_PROJECT_ID

# Run development server
npm run dev
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Google Authentication provider
3. Create a Firestore database
4. Add your Vercel domain to authorized domains in Firebase Console
5. Generate Admin SDK credentials (Project Settings > Service Accounts)

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/login/             # Login page
│   ├── (dashboard)/              # Dashboard pages (with sidebar)
│   │   ├── apps/                 # Apps list and management
│   │   │   ├── [appId]/          # App detail pages
│   │   │   │   ├── logs/         # Logs explorer
│   │   │   │   ├── settings/     # App settings
│   │   │   │   └── integration/  # Integration guide
│   │   │   └── new/              # Create app
│   │   ├── members/              # Team management
│   │   └── organizations/new/    # Create organization
│   └── api/                      # API routes
│       ├── auth/                 # Session management
│       ├── dashboard/            # Dashboard APIs
│       ├── requests/             # SDK ad request endpoint
│       └── events/               # SDK event endpoint
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── layout/                   # Sidebar, header, etc.
│   ├── analytics/                # KPI cards and grid
│   ├── logs/                     # Log tables
│   └── apps/                     # App-related components
├── lib/                          # Utilities and helpers
│   ├── firebase/                 # Firebase SDK initialization
│   ├── db/                       # Firestore operations
│   ├── auth/                     # Auth middleware
│   ├── validations/              # Zod schemas
│   └── utils/                    # Helper functions
├── hooks/                        # React hooks
├── contexts/                     # React contexts
└── types/                        # TypeScript types
```

---

## Environment Variables

```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

---

## Firestore Data Model

### Collections

#### `organizations`
```typescript
{
  orgId: string;
  name: string;
  meta: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
}
```

#### `organizationMembers`
```typescript
{
  memberId: string;
  orgId: string;
  userId: string;
  email: string;
  displayName?: string;
  role: 'owner' | 'developer' | 'analyst';
  meta: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
}
```

#### `apps`
```typescript
{
  appId: string;
  orgId: string;
  appName: string;
  platforms: ('web' | 'ios')[];
  status: 'active' | 'suspended';
  settings: {
    cooldownSeconds: number;        // default: 30
    allowedOrigins: string[];       // default: []
    supportedLanguages: ('eng' | 'jpn')[];  // default: ['eng']
    contextLoggingMode: 'none' | 'truncated' | 'hashed' | 'full';  // default: 'none'
  };
  meta: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
}
```

#### `requests`
```typescript
{
  requestId: string;
  appId: string;
  status: 'success' | 'error' | 'no_fill';
  platform: 'web' | 'ios';
  language: 'eng' | 'jpn';
  userAgent?: string;
  origin?: string;
  contextText?: string;
  contextTextHash?: string;
  contextTextMode?: 'truncated' | 'hashed' | 'full';
  errorCode?: string;
  errorMessage?: string;
  responseTimeMs?: number;
  meta: {
    createdAt: Timestamp;
  };
}
```

#### `events`
```typescript
{
  eventId: string;
  appId: string;
  requestId: string;
  eventType: 'impression' | 'click';
  adId?: string;
  origin?: string;
  userAgent?: string;
  meta: {
    createdAt: Timestamp;
  };
}
```

#### `auditLogs`
```typescript
{
  auditId: string;
  orgId: string;
  appId?: string;
  userId: string;
  userEmail: string;
  action: string;
  changes: Record<string, unknown>;
  meta: {
    createdAt: Timestamp;
  };
}
```

---

## API Endpoints

### Dashboard APIs (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/session` | Create session from Firebase ID token |
| POST | `/api/auth/logout` | Clear session cookie |
| GET/POST | `/api/dashboard/organizations` | List/Create organizations |
| GET/POST | `/api/dashboard/apps` | List/Create apps |
| GET/PATCH | `/api/dashboard/apps/[appId]` | Get/Update app |
| GET | `/api/dashboard/apps/[appId]/analytics` | Get analytics metrics |
| GET | `/api/dashboard/apps/[appId]/logs/requests` | List request logs |
| GET | `/api/dashboard/apps/[appId]/logs/events` | List event logs |
| GET/POST | `/api/dashboard/members` | List/Invite members |
| PATCH/DELETE | `/api/dashboard/members/[memberId]` | Update/Remove member |

### SDK APIs (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/requests` | Ad request endpoint |
| POST | `/api/events` | Event tracking (impression/click) |

### SDK Request Format

```typescript
// POST /api/requests
{
  appId: string;
  platform: 'web' | 'ios';
  language: 'eng' | 'jpn';
  contextText?: string;
}

// Response
{
  requestId: string;
  ad: {
    adId: string;
    type: string;
    content: {
      title: string;
      description: string;
      imageUrl: string;
      clickUrl: string;
    };
  };
}
```

### SDK Event Format

```typescript
// POST /api/events
{
  appId: string;
  requestId: string;
  eventType: 'impression' | 'click';
}

// Response
{
  eventId: string;
}
```

---

## Default Settings

When a new app is created, the following defaults are applied:

| Setting | Default Value |
|---------|---------------|
| `cooldownSeconds` | 30 |
| `allowedOrigins` | [] (allows all origins) |
| `supportedLanguages` | ['eng'] |
| `contextLoggingMode` | 'none' |

---

## Known Limitations

### Not Yet Implemented

1. **Custom date range picker** - Only preset time ranges available
2. **Cooldown enforcement** - `cooldownSeconds` setting is stored but not enforced in `/api/requests`
3. **Event validation** - Events are accepted without validating requestId/adId match
4. **Additional log filters** - conversationId, messageId, sdkVersion filters not implemented
5. **Rate limiting** - No rate limiting on SDK endpoints
6. **Audit log viewer** - Audit logs are created but not viewable in UI

### Differences from Original Specification

| Spec | Current Implementation |
|------|------------------------|
| Request statuses: success, no_ad, error | success, error, no_fill |
| Default cooldownSeconds: 60 | 30 |
| Default supportedLanguages: ['eng', 'jpn'] | ['eng'] |
| Default contextLoggingMode: 'truncated' | 'none' |
| Default allowedOrigins: ['*'] | [] (same effect) |
| Members page: Owner only | All roles can view |

---

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Deploy Firestore indexes
firebase deploy --only firestore:indexes --project YOUR_PROJECT_ID
```

---

## License

Private - Ceed Dev
