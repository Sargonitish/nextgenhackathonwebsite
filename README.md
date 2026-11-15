# ⚡ HackX — Full-Stack College Hackathon Operations Engine

A production-ready, reusable **College Hackathon Website, Event CMS & Operations Platform** built with **Next.js 14 (App Router)**, **TypeScript 5**, **Tailwind CSS**, **GSAP 3 + Framer Motion**, and **MongoDB (Mongoose 8)**.

Engineered with a high-craft **Architectural Blueprint UI** (`#0B1F3A` Navy, `#FFD23F` Drafting Yellow, `#F2EFE6` Off-White, sharp `0px` edges, `48px` graph-paper canvas, and hard offset block shadows) and built to run on a **100% Zero-Cost Serverless Stack**:
- **Hosting**: Vercel Hobby Tier
- **Database**: MongoDB Atlas M0 (512 MB free tier)
- **Asset Storage**: Cloudinary Free Tier (sponsor logos, coordinator/organizer portraits, gallery images)
- **Authentication**: Native Edge JWT sessions (`jose`) + RFC 6238 TOTP 2FA (`otplib`) + Google identity verification for students

---

## 🌟 Key Capabilities

### 1. Multi-Edition CMS & Dynamic Landing Page (`/`)
- **Zero-Hardcode Editions**: Create, edit, clone, and activate yearly editions (`HackX 2026`, `HackX 2027`, etc.) from `/admin/editions` while enforcing a single active edition invariant.
- **Section Visibility Controls**: Toggle landing sections (`Hero`, `About`, `Tracks`, `Schedule`, `Prizes`, `Rules`, `Coordinators`, `Organizers`, `Sponsors`, `Gallery`, `FAQs`, `Venue`, `Footer`) dynamically from Admin Branding.
- **Split People Directories**:
  - **Coordinators (`Section 05`)**: Faculty directors & lead student coordinators with category filters (`All`, `Faculty`, `Student`) and monochrome-to-color portrait hover transitions.
  - **Operations & Desk Leads (`Section 06`)**: Live API-backed organizer roster (`/api/public/organizers`) filterable by duty assignment.
- **Field Moments Gallery & Sponsor Showcase**: Interactive keyboard-accessible photo contact sheet with Escape-dismissible lightbox modal and configurable sponsor tier grid.

### 2. Blueprint Motion, Scroll Choreography & Accessibility
- **Central SSR-Safe GSAP Registry (`lib/gsap.ts`)**: Client-only modular registration for `useGSAP`, `ScrollTrigger`, `ScrollToPlugin`, `SplitText`, `ScrambleTextPlugin`, `Flip`, and `DrawSVGPlugin` (omits `ScrollSmoother` so native sticky headings remain intact).
- **2px Top Scroll Progress Gauge (`Navbar.tsx` + `globals.css`)**: Driven natively by CSS `animation-timeline: scroll(root block)` on supported browsers with a GSAP `ScrollTrigger` fallback and smooth `ScrollToPlugin` anchor scrolling (`Sections ▾` dropdown menu + mobile drawer).
- **Hero & Manifesto Choreography**:
  - `Hero.tsx`: `ScrambleTextPlugin` spec readout (with hover replay), `SplitText` character entrance across solid title + `.text-outline` year, dimension caliper scaling, and staggered telemetry feed.
  - `About.tsx`: Word-by-word scrubbed `SplitText` headline illumination paired with a `2×2` CAD Spec Bento grid (`DURATION`, `DOMAINS`, `PRIZE POOL`, `CAPACITY`).
- **Scroll-Drawn Runbook & Pinned-Free Rhythm**:
  - `Schedule.tsx`: Continuous scrubbed yellow vertical timeline spine illuminating milestone nodes sequentially on scroll.
  - `Prizes.tsx`, `Venue.tsx`, `Coordinators.tsx`, & `Organizers.tsx`: Staggered podium reveal, `DrawSVGPlugin` CAD arena targeting reticle, and GSAP `Flip` filter layout transitions with `ScrollTrigger.refresh()` sync on async fetches, filters, and `Faq.tsx` accordion toggles.
- **Interactive UI Micro-Components**: `ScrambleText` (track cards), morphing `DynamicButton` (registration submit state transitions), `HoldToConfirmButton` (`1100ms` destructive team delete hold in Admin), magnetic drag-and-drop `ImageUpload`, and dynamic gradient `ScrollFadeList`.
- **WCAG & Reduced-Motion Support**: Visible `Pause` / `Play` control on `AnnouncementTicker.tsx` (WCAG 2.2.2), accessible focus outlines, `overflow-x: clip` layout hygiene, and full `prefers-reduced-motion` static fallbacks.

### 3. Student Registration & Thermal Receipt Printer QR Pass (`/register`)
- **Google Identity Verification & Lookup**: Google sign-in token verification (`/api/auth/google/verify`) and participant lookup at `/find-registration`.
- **Dynamic Team Builder**: Configurable team size constraints (min/max members) capturing member college, department, and **Register Number**, backed by transactional sequential Team IDs (`HACKX-0001`, etc.).
- **Hardware Receipt Printer Ticket (`/register/success/[teamId]`)**: Stepped 20-keyframe thermal receipt feed over custom grain & paper SVG textures (`public/textures/plastic-noise.svg`, `public/textures/receipt-paper.svg`) with high-contrast QR badge (`hx_chk_...`), member roster, checksum barcode, `Reprint` trigger, PNG badge export, and print support.

### 4. Live Timer, Camera QR Check-In Desk & Two-Tier RBAC
- **Synchronized Auditorium Display (`/live`)**: Pure server-offset client countdown (`lib/timer.ts`), giant 3D flip clock (`FlipCountdown.tsx`), and live broadcast marquee (`AnnouncementTicker.tsx`).
- **Check-In Scanner (`/checkin`)**: Dedicated `html5-qrcode` camera scanner (`CheckinScanner.tsx`) with front/rear camera switching, member-by-member attendance check-in, and role-aware exit routing back to `/organizer` or `/admin`.
- **Two-Tier RBAC**:
  - **Root Admin (`/admin/*`)**: Master `bcryptjs` password + 6-digit `otplib` TOTP 2FA, full event CMS, CSV team export, organizer approval pipeline, announcements, and login security logs.
  - **Organizer Staff (`/organizer/*`)**: Self-signup, admin-managed duty permissions (`checkin`, `viewTeams`, `viewContacts`), automatic phone/email masking (`lib/permissions.ts`), and instant `sessionVersion` session revocation.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 14.2 (`^14.2.20` App Router, Server Components, Route Handlers)
- **Language**: TypeScript 5 (`^5.7.2`, strict mode)
- **Styling & Textures**: Tailwind CSS (`^3.4.16`) with Architectural Blueprint palette + SVG grain textures (`public/textures/`)
- **Animation Engines**:
  - `gsap` (`^3.15.1`) & `@gsap/react` (`^2.1.2`) for landing choreography and scroll progress
  - `framer-motion` (`^11.15.0`) for stateful receipt printer hardware, morphing buttons, and drag-and-drop spring feedback
- **Database & Validation**: MongoDB via `mongoose` (`^8.8.4`) + `zod` (`^3.24.1`) + `react-hook-form` (`^7.54.0`)
- **Security & Auth**: `jose` Edge JWTs, `bcryptjs`, `otplib`, `qrcode`, Node `crypto.timingSafeEqual`
- **Admin Utilities**: `@dnd-kit` drag-to-reorder editors, `recharts` analytics, `sonner` toasts, `nodemailer` SMTP alerts

---

## 📁 Project Structure

```text
├── app/
│   ├── page.tsx                  # SSR dynamic public landing page (13 configurable sections)
│   ├── globals.css               # Blueprint CSS variables, reduced-motion rules, native scroll progress
│   ├── live/                     # Auditorium projector countdown & broadcast display
│   ├── register/                 # Student registration & /success/[teamId] Thermal Receipt Printer pass
│   ├── checkin/                  # Camera QR scanner & manual desk check-in
│   ├── find-registration/        # Participant Team ID / email pass lookup
│   ├── organizer/                # Organizer login, signup, dashboard, teams & profile
│   ├── admin/                    # Master admin portal (CMS, timer, teams, organizers, security, setup)
│   └── api/                      # Public, Auth, Staff Check-In, Organizer & Admin REST endpoints
├── components/
│   ├── admin/                    # Drag-and-drop ImageUpload & ListEditor
│   ├── public/                   # Navbar, Hero, About, Tracks, Schedule, Prizes, Rules,
│   │                             # Coordinators, Organizers, Sponsors, Gallery, Faq, Venue, Footer,
│   │                             # AnnouncementTicker, BlueprintBackground, CustomCursor, FlipCountdown, GoogleSignInButton
│   └── shared/                   # ReceiptPrinter, DynamicButton, HoldToConfirmButton,
│                                 # ScrambleText, ScrollFadeList, CheckinScanner, withSuspense
├── helpers/
│   └── classname-helper.ts       # clsx + tailwind-merge (cn helper)
├── lib/
│   ├── gsap.ts                   # SSR-safe GSAP plugin registry & prefersReducedMotion() helper
│   ├── activeEvent.ts            # Active edition resolver
│   ├── auth.ts                   # Jose JWT, bcrypt & TOTP pre-auth/setup tokens
│   ├── cloudinary.ts             # Cloudinary CDN upload integration
│   ├── compressImage.ts          # Client-side image compression before upload
│   ├── csv.ts                    # Admin team CSV export helpers
│   ├── db.ts                     # Cached global Mongoose connection
│   ├── mailer.ts                 # Optional SMTP admin alerts
│   ├── permissions.ts            # Organizer RBAC & contact masking
│   ├── rateLimit.ts              # In-memory sliding-window rate limiter
│   ├── timer.ts                  # Server-offset drift-free countdown math
│   ├── totp.ts                   # RFC 6238 authenticator setup & verification
│   └── validators.ts             # Shared Zod request schemas
├── models/                       # Admin, Announcement, Counter, Event, LoginLog, Organizer, Team
├── public/
│   └── textures/                 # plastic-noise.svg & receipt-paper.svg
└── scripts/
    └── seed.ts                   # Demo dataset generator (HackX 2026)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (LTS recommended) and `pnpm` (`pnpm-lock.yaml` / `pnpm-workspace.yaml` included)
- MongoDB Connection String (Atlas M0 Free Tier or local MongoDB)
- Cloudinary Account (Free tier cloud name, API key & API secret)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure `.env.local`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/hackathon?retryWrites=true&w=majority
JWT_SECRET=change-me-to-a-long-random-string-min-32-chars
NEXT_PUBLIC_SITE_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: SMTP notification alerts for organizer requests
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_NOTIFY_EMAIL=admin@college.edu
```

### 4. Seed Demo Data
Populate MongoDB with a complete `HackX 2026` edition (tracks, prizes, schedule, coordinators, FAQs):
```bash
pnpm run seed
```

### 5. Development & Production Commands
```bash
pnpm run dev      # Start Next.js dev server at http://localhost:3000
pnpm run build    # Compile production build & static/dynamic routes
pnpm run start    # Serve production build locally
pnpm run lint     # Run Next.js ESLint checks
```

---

## 🔐 Administrator Setup Runbook

### Step 1: Initial Enrollment
1. Navigate to [http://localhost:3000/admin/setup](http://localhost:3000/admin/setup).
2. Choose your root administrator username and master password.
3. Scan the Authenticator QR code (**Google Authenticator**, **Aegis**, or **1Password**).
4. Enter the 6-digit TOTP code to verify and lock enrollment.
> **Note**: Once an admin document exists in MongoDB, `/admin/setup` permanently locks and redirects to `/admin/login`.

### Step 2: Logging into Admin Panel
1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Enter master username, password, and 6-digit TOTP code for an 8-hour HTTP-only session.

---

## 🔄 Multi-Edition Yearly Lifecycle Guide

1. Open **Admin Panel → Editions** (`/admin/editions`).
2. Click **Clone Edition** next to `HackX 2026` and enter the new name/slug (e.g. `HackX 2027`).
3. Click **Activate** on the cloned edition—the public landing page, Thermal Receipt Printer pass, and `/checkin` desk immediately switch over with clean registration counters.

---

## ☁️ Zero-Cost Production Deployment (Vercel & Atlas)

1. **MongoDB Atlas**: Create an M0 Sandbox cluster, configure Network Access (`0.0.0.0/0` for Vercel serverless), and create a database user.
2. **Cloudinary**: Copy your `Cloud Name`, `API Key`, and `API Secret`.
3. **Vercel**: Import the GitHub repository, configure all environment variables from `.env.local` (setting `NEXT_PUBLIC_SITE_URL` to your deployed URL), deploy, and visit `https://your-domain.vercel.app/admin/setup` for initial enrollment.

---

## 📄 License
MIT License. Built for collegiate student hackathons and developer festivals.
created by Nitish-fro the welfare of students-mainted by me
