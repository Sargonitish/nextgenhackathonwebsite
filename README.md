# ⚡ HackX — Full-Stack College Hackathon Operations Engine

A complete, production-ready, reusable College Hackathon website and operations platform built with **Next.js 14 (App Router)**, **TypeScript**, **TailwindCSS**, and **MongoDB (Mongoose 8)**.

Engineered to operate on a **100% Zero-Cost Serverless Stack**:
- **Hosting**: Vercel Hobby Tier
- **Database**: MongoDB Atlas M0 (512MB free tier)
- **Asset Storage**: Cloudinary Free Tier (images & logos)
- **Authentication**: Native Jose Edge JWT sessions with Otplib TOTP 2FA (No external paid auth services needed)

---

## 🌟 Key Capabilities

1. **Multi-Edition CMS Engine**:
   - Create, edit, and clone hackathon editions (`HackX 2026`, `HackX 2027`, etc.) with zero hardcoding.
   - 1-click cloning copies branding, tracks, prizes, coordinators, schedule, and FAQs with fresh blank registration counts.
   - Enforces a single active edition invariant across the entire system.

2. **Student Registration & QR Passports**:
   - Atomic sequential Team IDs (`HACKX-0001`, `HACKX-0002`) guaranteed by MongoDB transactional counters.
   - Dynamic team members (1 to 4) with college, department, and leader contact details.
   - Secure verification token embedded in downloadable QR codes (`hx_chk_...`).

3. **Live Synchronized Timer & Projector Mode**:
   - Pure server-offset client calculations (`lib/timer.ts`) drift-free across thousands of connected devices.
   - `/live` full-screen projector display for event hall projectors with a giant animated 3D digit countdown and live scrolling announcement ticker.
   - Controls to start, pause, resume, extend duration, or schedule future countdowns.

4. **Camera QR Check-In Desk**:
   - Dedicated `/checkin` camera scanner using `html5-qrcode` with rear/front camera flip.
   - Instant duplicate scan warnings and sound/haptic feedback.
   - Interactive member-by-member attendance checklist and physical badge tracker.

5. **Two-Tier Role-Based Access Control (RBAC)**:
   - **Root Administrator**:
     - Secured with bcrypt master password + Time-based One-Time Password (TOTP 2FA).
     - Full CMS control, edition cloning, organizer access review, and security audit logs.
   - **Organizer Staff**:
     - Public sign-up workflow (`/organizer/signup`) with duty preferences and optional access passcode.
     - Admin approval pipeline (`/admin/organizers`) with duty assignment and granular permissions (`checkin`, `viewTeams`, `viewContacts`).
     - **Privacy Data-Masking**: Phone numbers are automatically masked (`98******10`) and student emails omitted unless explicitly authorized.
     - **Instant Session Revocation**: Any suspension or password reset increments `sessionVersion`, immediately kicking the organizer out from all active sessions.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 14.2 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript 5 (Strict Mode enabled)
- **Styling**: Tailwind CSS with custom cyberpunk/terminal theme and glassmorphism
- **Database**: MongoDB via Mongoose 8 (cached global connection for serverless cold-start efficiency)
- **Security & Cryptography**:
  - `jose` for Edge-compatible JWT verification in Next.js Middleware
  - `bcryptjs` for secure salted password hashing
  - `otplib` & `qrcode` for RFC 6238 TOTP two-factor authentication
  - Node.js `crypto.timingSafeEqual` for secret and token comparisons
- **Drag-and-Drop CMS**: `@dnd-kit` for drag-to-reorder list management

---

## 📁 Project Structure

```
├── app/
│   ├── (public)/                 # Landing page, details, matrix rain, countdown
│   ├── live/                     # Projector display mode for auditorium screens
│   ├── register/                 # Multi-step student registration & QR download
│   ├── checkin/                  # Camera QR scanner & manual check-in desk
│   ├── find-registration/        # Participant registration lookup
│   ├── organizer/                # Organizer login, signup & mobile ops portal
│   │   ├── (portal)/             # Organizer dashboard, roster & profile
│   │   ├── login/
│   │   └── signup/
│   ├── admin/                    # Master admin root terminal
│   │   ├── (panel)/              # CMS, timer, teams, organizers, security
│   │   ├── login/                # Password + 6-digit TOTP terminal
│   │   └── setup/                # 1-time root admin enrollment (auto-locks)
│   └── api/                      # REST endpoints for public, staff, and admin
├── components/
│   ├── admin/                    # CMS editors, image uploaders, list reordering
│   ├── public/                   # Hero, MatrixBackground, FlipCountdown, Navbar
│   └── shared/                   # CheckinScanner, badges, modals
├── lib/
│   ├── activeEvent.ts            # Active edition cache & resolver
│   ├── auth.ts                   # Jose JWT, bcrypt, pre_auth & setup tokens
│   ├── cloudinary.ts             # Direct buffer upload to Cloudinary CDN
│   ├── db.ts                     # Cached global Mongoose connection
│   ├── mailer.ts                 # Notification dispatch (optional SMTP)
│   ├── permissions.ts            # Organizer data masking (maskPhone, toOrganizerTeamView)
│   ├── rateLimit.ts              # In-memory sliding window rate limiter
│   ├── timer.ts                  # Pure drift-free countdown math
│   └── totp.ts                   # Authenticator QR & RFC 6238 TOTP verification
├── models/                       # Mongoose schemas (Admin, Organizer, Event, Team, Counter, Announcement, LoginLog)
└── scripts/
    └── seed.ts                   # Demo dataset generator (HackX 2026)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (LTS recommended)
- MongoDB Connection String (Atlas M0 Free Tier or local MongoDB)
- Cloudinary Account (Free tier cloud name, API key & API secret)

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```

Configure your `.env.local`:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/hackathon?retryWrites=true&w=majority

# JWT Session Secret (Random 32+ character string)
JWT_SECRET=super-secret-key-change-this-in-production-min-32-chars

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudinary (Free tier)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Email Notifications (e.g., Gmail App Password or Resend)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
NOTIFICATION_EMAIL=admin@college.edu
```

### 3. Seed Demo Data
To immediately populate the database with a fully configured hackathon edition (`HackX 2026`), tracks, prizes, schedule, coordinators, and FAQs:
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Administrator Setup Runbook

### Step 1: Initial Enrollment
1. Navigate to [http://localhost:3000/admin/setup](http://localhost:3000/admin/setup).
2. Choose your root administrator username and a strong master password.
3. Open your Authenticator app (**Google Authenticator**, **Aegis**, or **1Password**) and scan the displayed QR code.
4. Enter the 6-digit TOTP code generated by the app to verify and lock enrollment.
> **Note**: Once an admin document is written to the database, `/admin/setup` permanently disables itself and redirects to `/admin/login`.

### Step 2: Logging into Admin Panel
1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Enter your master username and password.
3. On verification, enter the 6-digit TOTP code.
4. You are granted an encrypted 8-hour HTTP-only session cookie.

---

## 🔄 Multi-Edition Yearly Lifecycle Guide

When preparing for next year's hackathon:
1. Go to **Admin Panel &rarr; Editions** (`/admin/editions`).
2. Click **Clone Edition** next to `HackX 2026`.
3. Provide the new name (e.g. `HackX 2027`) and slug (`hackx-2027`).
4. The system copies all tracks, sponsors, coordinators, rules, and FAQs.
5. Click **Activate** on the new edition.
6. The entire public landing page, registration form, and desk scanner instantly transition to `HackX 2027` without modifying a single line of code!

---

## ☁️ Zero-Cost Production Deployment (Vercel & Atlas)

### 1. MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (M0 Sandbox).
2. Under **Network Access**, add IP address `0.0.0.0/0` (Allow access from anywhere, required for Vercel Serverless Functions).
3. Under **Database Access**, create a user with read/write privileges.
4. Copy the connection string into your environment variables.

### 2. Cloudinary Setup
1. Sign up for a free [Cloudinary](https://cloudinary.com) account.
2. In the dashboard, copy your `Cloud Name`, `API Key`, and `API Secret`.

### 3. Deploy to Vercel
1. Push your repository to GitHub or GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. Add the environment variables from your `.env.local` in the Vercel project settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (set to your Vercel deployment URL, e.g. `https://hackx.vercel.app`)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Click **Deploy**. Vercel will automatically build and deploy the Next.js App Router application.
5. Once deployed, visit `https://your-domain.vercel.app/admin/setup` to enroll your root administrator.

---

## 📄 License
MIT License. Built for collegiate student hackathons and developer festivals.
