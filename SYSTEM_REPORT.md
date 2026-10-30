# 🚀 NextGen College Hackathon Operations Engine (HackX) — Comprehensive System & Architectural Report

---

## 📌 Executive Summary

The **HackX Platform** is a full-stack, enterprise-grade, zero-cost operations engine and public web portal tailored specifically for collegiate hackathons, codefests, and developer summits. 

The system was engineered from the ground up according to the foundational specifications defined in `MASTER_PROMPT.md`. It eliminates the traditional fragmentation of hackathon management (Google Forms, static countdown slides, manual paper check-ins, unverified Excel sheets, and disconnected announcement channels) by consolidating the entire event lifecycle into a unified, serverless-ready web application.

### Key Achievements:
- **100% Zero-Cost Serverless Architecture**: Operates without monthly infrastructure costs on Vercel Hobby Tier, MongoDB Atlas M0 (512MB Sandbox), and native client/server media processing.
- **Production Build Verified**: 34 Next.js App Router routes and REST endpoints compiling cleanly with **0 errors and 0 type warnings** under strict TypeScript mode.
- **Two-Tier RBAC with Cryptographic 2FA**: Root Administrator secured with bcrypt and RFC 6238 TOTP (Google Authenticator/1Password); Volunteers and Coordinators managed via an approval pipeline featuring privacy-first data masking and instant session revocation.
- **Synchronized Drift-Free Countdown**: Real-time server-offset timer math feeding responsive public countdowns and a dedicated 4K/1080p `/live` auditorium projector display.
- **Hardware-Integrated Camera Desk**: In-browser QR code scanner powered by `html5-qrcode` with automated duplicate check-in warnings and member-by-member attendance tracking.

---

## 🏗️ High-Level System Architecture

```mermaid
graph TD
    subgraph Clients
        P[Public Visitors & Hackers]
        A[Root Administrator]
        O[Organizer Volunteers]
        Pr[Auditorium Projector / Screens]
    end

    subgraph Edge Layer [Next.js Edge Middleware]
        M[middleware.ts: Jose JWT Verification]
    end

    subgraph Application Layer [Next.js 14 App Router]
        PRP[Public Landing & Registration]
        ALP[/live Projector Display]
        CKD[/checkin Camera Desk]
        ADM[/admin Control Panel]
        ORG[/organizer Ops Portal]
    end

    subgraph Data & Persistence Layer
        DB[(MongoDB Atlas M0)]
        CACHE[Global Mongoose Connection Cache]
    end

    P -->|HTTPS / HTTP| PRP
    Pr -->|Realtime Polling / Drift Math| ALP
    O -->|Mobile Wi-Fi QR Scan| CKD
    O -->|Session Cookie| ORG
    A -->|TOTP 2FA + Session| ADM

    PRP --> M
    ALP --> M
    CKD --> M
    ADM --> M
    ORG --> M

    M --> CACHE
    CACHE --> DB
```

---

## 📦 Core Subsystems & How They Work

### 1. Multi-Edition CMS Engine (`/admin/editions`, `/admin/*`)

#### Problem Solved:
Most hackathon websites hardcode dates, track names, sponsor logos, and prize pools directly in JSX/HTML. When running the event the following year, developers must rewrite code, risking broken links and lost records.

#### Architectural Mechanism:
- **Zero Hardcoding**: All branding colors, logos, favicon, hero typing words, about text, rules markdown, tracks, schedule timeline, prizes, coordinators, sponsors, FAQs, and Google Map embeds are dynamically read from the **Active Edition Document** in MongoDB (`models/Event.ts`).
- **Single Active Event Invariant**: The database enforces that exactly one edition has `isActive: true` and `isArchived: false`. Activating a new edition atomically demotes the previous one.
- **1-Click Yearly Cloning**: Administrators can click **"Clone Edition"** on any existing event (e.g. `HackX 2026` $\rightarrow$ `HackX 2027`). The system duplicates all tracks, schedule items, prize structures, rules, and coordinator metadata, while initializing a fresh counter with zero registered teams.

---

### 2. Live Synchronized Timer & Projector Mode (`lib/timer.ts`, `/live`)

#### Problem Solved:
Standard client-side timers (`setInterval(..., 1000)`) drift by several minutes over 24 hours due to browser background throttling, OS sleep modes, and differing client system clocks.

#### Architectural Mechanism:
1. **Server Offset Math**:
   When the client connects to `/api/public/timer`, the server returns the timer state along with `serverNow = Date.now()`.
2. **Pure Functional Computation**:
   The client calculates client-server clock skew:
   $$\Delta_{\text{skew}} = \text{serverNow} - \text{clientTimeAtFetch}$$
   Using this offset, `computeTimerView(timer, adjustedNow)` returns the exact elapsed milliseconds, remaining milliseconds, progress percentage, and running phase (`idle`, `scheduled`, `running`, `paused`, `ended`).
3. **Resilience**: The timer re-syncs automatically on window focus and polls the server every 15 seconds.
4. **Auditorium Projector View (`/live`)**:
   - Designed for high-resolution hall screens with large 3D animated flip-card digits.
   - Includes real-time emergency announcement marquees and dynamic progress bars.

---

### 3. Student Registration & Cryptographic QR Passports (`/register`)

#### Problem Solved:
Preventing duplicate registrations, managing variable team sizes without messy forms, and eliminating fraudulent badge collection at the entrance.

#### Architectural Mechanism:
- **Atomic Sequential Team IDs**:
  Uses a dedicated MongoDB `Counter` collection with atomic increment (`findOneAndUpdate({ _id: "team:<eventId>" }, { $inc: { seq: 1 } })`). This guarantees zero collision sequential IDs like `HACKX-0001`, `HACKX-0002`.
- **Dynamic Team Composition**:
  Supports 1 to 4 members using dynamic form arrays. Validates 10-digit Indian mobile numbers, emails, college affiliation, department, and academic year.
- **Cryptographic Check-in Token**:
  Upon submission, the server generates a cryptographically secure random token:
  $$\text{checkinToken} = \text{"hx\_chk\_"} + \text{randomBytes}(16)$$
  This token is embedded in an RFC-compliant QR code and displayed on the Participant Passport page (`/register/success/[teamId]`), with one-click PNG download for attendees.

---

### 4. Camera QR Check-In Desk (`/checkin`)

#### Problem Solved:
Long entry queues and manual name lookup in giant spreadsheets cause chaos during the first hours of an event.

#### Architectural Mechanism:
- **Hardware Integration**:
  Built on `html5-qrcode` with rear/front camera selection and torch toggle for mobile phone cameras and laptops.
- **Instant Duplicate Warning**:
  When a QR code is scanned, the server executes a lookup. If the team is already checked in, it triggers an audible warning tone, haptic vibration, and displays a prominent red warning banner showing the exact arrival timestamp and staff member who performed the initial check-in.
- **Attendance Verification**:
  Staff can check off individual members present, flag missing teammates, and mark physical badge issuance.
- **Fallback Search**: Includes instant team ID search (e.g. `HACKX-0042`) and participant name search for attendees whose phone batteries died.

---

### 5. Two-Tier RBAC & Security Hardening

#### A. Root Administrator (`/admin`)
- **Initial Enrollment Lock**: When the application is launched for the first time, `/admin/setup` allows creating the root administrator and displays an RFC 6238 TOTP QR code for Google Authenticator, Aegis, or 1Password. Once written to MongoDB, `/admin/setup` permanently disables itself.
- **2-Step Login**: Step 1 validates the master password; Step 2 presents 6 auto-advancing OTP digit boxes with paste support.
- **Rate-Limiting & Lockout**: 5 failed login attempts trigger an automatic 15-minute account lock.
- **Security Terminal (`/admin/security`)**: Master password rotation, 2FA secret regeneration, and full login audit logging (`LoginLog`).

#### B. Organizer Staff (`/organizer`)
- **Application Workflow (`/organizer/signup`)**: Volunteers apply with duty preference (Registration Desk, Tech Support, Hospitality, Logistics) and an optional admin passcode.
- **Admin Review Queue (`/admin/organizers`)**: Root admin can approve, reject (with custom reason shown to applicant), assign duty roles, or revoke access.
- **Privacy Data-Masking**: To protect student privacy, organizer desk endpoints pass participant records through `toOrganizerTeamView()`:
  - Phone numbers are masked: `98******10`
  - Student emails are stripped from the response payload unless `permissions.viewContacts` is explicitly granted by the root admin.
- **Instant Session Revocation**: Every organizer document carries a `sessionVersion` integer. If an organizer is suspended or their password reset, `sessionVersion` is incremented, immediately invalidating all active JWT sessions across all their devices.

---

### 6. Media Pipeline & Storage Resilience (`lib/cloudinary.ts`, `lib/compressImage.ts`)

#### Problem Solved:
Third-party image upload services often fail due to invalid signatures, quota limits, or missing API keys, breaking logo uploads.

#### Architectural Mechanism:
- **Smart Cloudinary Fallback**: If real Cloudinary credentials are provided, images stream to Cloudinary CDN. If credentials are missing or default demo keys are used, the engine seamlessly converts the image to base64 Data URIs stored directly in MongoDB.
- **Client-Side Canvas Compression**: High-resolution DSLR or mobile camera uploads (often 5MB–15MB) are automatically intercepted in the browser, downscaled to a max dimension of 1200px, and compressed into WebP (~80KB–150KB) before transmission. This ensures rapid uploads and keeps MongoDB documents well under the 16MB BSON limit.

---

## 🗄️ Database Schemas Overview

The platform uses 7 Mongoose schemas in `models/`:

| Model | File | Primary Responsibility |
| :--- | :--- | :--- |
| **`Event`** | `models/Event.ts` | Complete hackathon configuration (branding, tracks, schedule, prizes, coordinators, rules, sponsors, FAQs, venue, and timer state). |
| **`Team`** | `models/Team.ts` | Sequential Team ID, name, track, member roster array (leader, present flags), cryptographic `checkinToken`, and check-in audit timestamps. |
| **`Organizer`** | `models/Organizer.ts` | Volunteer credentials, status (`pending`, `approved`, `rejected`, `suspended`), duty, granular permissions, and `sessionVersion`. |
| **`Admin`** | `models/Admin.ts` | Root administrator password hash, TOTP secret base32, failed attempt tracker, and lockout timers. |
| **`Counter`** | `models/Counter.ts` | Atomic transactional sequence generator for collision-free sequential team IDs (`team:<eventId>`). |
| **`Announcement`** | `models/Announcement.ts` | Real-time urgent alerts and broadcast marquees displayed on the public landing page and live projector. |
| **`LoginLog`** | `models/LoginLog.ts` | Immutable security audit trail recording IP address, User-Agent, timestamp, role, and authentication outcome. |

---

## 🛣️ Route & API Topology

```
┌── / (Public Landing Page)
├── /register (Student Team Registration)
├── /register/success/[teamId] (Participant Passport & Downloadable QR)
├── /find-registration (Participant Pass Self-Lookup)
├── /live (Auditorium Projector Live Mode)
├── /checkin (Camera QR Scanner Desk)
│
├── /organizer (Volunteer Operations Portal)
│   ├── /organizer/signup (Volunteer Request Application)
│   ├── /organizer/login (Volunteer Session Login)
│   ├── /organizer/teams (Privacy-Masked Roster Lookup)
│   └── /organizer/profile (Account & Password Settings)
│
├── /admin (Root Administration)
│   ├── /admin/setup (First-Time Master Admin Enrollment)
│   ├── /admin/login (Master Password + 6-Digit TOTP 2FA)
│   ├── /admin (Real-time Analytics Dashboard & Quick Timer)
│   ├── /admin/editions (Multi-Edition Manager & Cloning)
│   ├── /admin/branding (Neon Theme Colors & Section Toggles)
│   ├── /admin/content (Hero Typing Words, Rules, About, Venue)
│   ├── /admin/tracks (Track Arenas & Icons)
│   ├── /admin/schedule (2-Day Agenda Timeline)
│   ├── /admin/prizes (Prize Pool Distribution)
│   ├── /admin/coordinators (Staff & Faculty Roster)
│   ├── /admin/sponsors (Sponsor Grid & Tiers)
│   ├── /admin/gallery (Photo Lightbox Grid)
│   ├── /admin/faqs (Accordion FAQs)
│   ├── /admin/registrations (Team Roster & Excel CSV Export)
│   ├── /admin/organizers (Volunteer Review & Duty Assignment)
│   ├── /admin/timer (Live Countdown Controls)
│   ├── /admin/announcements (Marquee Ticker Broadcast)
│   ├── /admin/settings (Deadlines, Team Limits, Passcodes)
│   └── /admin/security (Password Rotation & Audit Logs)
│
└── /api (Secure REST Endpoints)
    ├── /api/public/* (stats, site, timer, announcements, register, lookup)
    ├── /api/staff/* (checkin verification & attendance toggle)
    ├── /api/organizer/* (signup, login, logout, stats, teams, profile)
    └── /api/admin/* (auth, events, upload, teams, timer, security)
```

---

## 🔒 Security & Privacy Implementation Details

1. **Edge-Compatible JWT Verification**:
   The Next.js Edge Middleware (`middleware.ts`) runs on the Vercel Edge Runtime (without Node.js native crypto or Mongoose). It uses `jose` to verify session signatures and enforce route access boundaries before any serverless function is invoked.
2. **Timing-Safe Token Matching**:
   All sensitive secret and token evaluations (check-in QR tokens, access passcodes) utilize Node.js `crypto.timingSafeEqual` to eliminate side-channel timing attacks.
3. **Local Wi-Fi Network Session Handling**:
   Cookie issuance dynamically inspects `request.url.startsWith('https://')` to ensure cookies are marked `secure: true` in production while allowing local mobile connections over LAN HTTP (`http://10.94.136.17:3000`) without silent rejection by mobile browsers.
4. **Data Masking Invariant**:
   Volunteer access to student contact details is strictly controlled at the query level through `lib/permissions.ts`, guaranteeing that bulk export or unmasked contact exposure can only be executed by authenticated root administrators.

---

## 🚀 Deployment & Operations Runbook

### Prerequisites
- Node.js 18+ LTS
- A free **MongoDB Atlas M0 Cluster**
- (Optional) Free **Cloudinary account**

### Local Setup
```bash
# 1. Clone repository
git clone https://github.com/Sargonitish/nextgenhackathonwebsite.git
cd nextgenhackathonwebsite

# 2. Install dependencies
npm install

# 3. Configure environment variables in .env.local
cp .env.example .env.local
# (Populate MONGODB_URI and JWT_SECRET)

# 4. Seed demo dataset (HackX 2026)
npm run seed

# 5. Start development or production server
npm run dev     # Development
npm run build   # Production compile
npm start       # Production serve
```

### 1-Click Vercel Production Deployment
1. Import repository into **[Vercel](https://vercel.com/new)**.
2. Add the environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-domain.vercel.app`)
3. Deploy!
4. Navigate to `https://your-domain.vercel.app/admin/setup` to enroll your root administrator.

---

*Report generated for HackX Platform codebase `d:\TEC\college\hackathon`.*
