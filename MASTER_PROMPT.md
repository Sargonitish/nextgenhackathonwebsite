# MASTER PROMPT: College Hackathon Website (for Google Antigravity)

> **How to use:** Copy everything below the line into Google Antigravity as the first task. Open the empty folder `F:\clg hackathon` as the workspace. Let the agent work through the phases in order, and check each checkpoint before telling it to continue.

---

## 0. Your role and how to work

You are a senior full-stack engineer. Build a **production-ready, reusable hackathon website** in this empty workspace, following this specification exactly.

**Working rules:**
1. Work **phase by phase** (Section 12). At the end of each phase:
   - run `npm run build`
   - fix all errors
   - summarise what you built
   - list how I can test it
2. **Never hard-code event content.** Every visible text, image, date, list and colour on the public site must come from the database and be editable in the admin panel. Seed data is allowed only through the seed script.
3. Use **TypeScript** everywhere with strict mode. No `any` unless unavoidable.
4. Never commit secrets. Read all keys from `.env.local`. Create `.env.example` with placeholder values.
5. Validate **every** API input with **zod** on the server, even when the client already validated it.
6. There are **two staff roles**: `admin` (the main admin, full access) and `organizer` (limited access; see Section 9A).
   - Every protected API route must check the session **and the role** on the server with `requireRole()`. Middleware alone is not enough.
   - Organizers must never receive data they are not allowed to see. **Filter fields on the server, not only in the UI.**
7. Mobile-first and responsive. The site must look great at 360px width, with no horizontal scroll.
8. Keep components small and reusable. Put shared logic in `lib/`.
9. If something in this spec is ambiguous, choose the simplest secure option and note it in `README.md` under "Decisions".
10. At the end, write a complete `README.md` covering setup, the free accounts needed, environment variables, how to run, how to deploy to Vercel, and how to do the first admin setup.

---

## 1. Project summary

A website for a college hackathon with these parts:

| Part | URL | Users |
|---|---|---|
| Public event website | `/` | Students and visitors |
| Team registration form | `/register` | Students |
| Admin panel | `/admin` | **Main admin only.** Full access. Password + TOTP 2FA. |
| Organizer sign-up | `/organizer/signup` | People who want to be organizers. They request access, and the admin must approve them. |
| Organizer portal | `/organizer` | **Approved organizers only.** Limited access: team counts and registration desk details. |
| Check-in desk | `/checkin` | Admin and approved organizers. Camera QR scanner to verify teams. |

**Key goals:**
- **Role-based access:** organizers see only what they need at the registration desk. All other details (full contact info, exports, site settings) stay with the main admin.
- **Everything editable from admin:** text, photos, coordinators, timer, schedule and so on.
- **Live event timer:** the admin can start, pause, resume, extend and reset it. All screens stay in sync.
- **Reusable every year** through an **Editions** system: clone last year's event, edit it, set it active.
- **QR-code-based team check-in** on event day.
- **₹0 running cost:** Vercel Hobby, MongoDB Atlas M0, Cloudinary free tier.

---

## 2. Tech stack (use exactly this)

| Purpose | Package |
|---|---|
| Framework | `next@14.2.x` (App Router, TypeScript, `src/` NOT used) |
| Styling | `tailwindcss@3.4.x`, `postcss`, `autoprefixer` |
| Animation | `framer-motion@11.x` |
| Database | `mongoose@8.x` (MongoDB Atlas) |
| Validation | `zod@3.x`, `react-hook-form@7.x`, `@hookform/resolvers` |
| Password hashing | `bcryptjs@2.4.3` |
| TOTP 2FA | `otplib@12.0.1` (use `authenticator`) |
| QR generation | `qrcode@1.5.x` |
| QR scanning | `html5-qrcode@2.3.8` |
| Session JWT | `jose@5.x` (Edge-compatible, used in middleware) |
| Images | `cloudinary@2.x` (server-side signed upload) |
| Charts | `recharts@2.x` |
| Icons | `lucide-react` |
| Toasts | `sonner` |
| Drag-to-reorder | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Email notifications (optional) | `nodemailer@6.x` (Gmail SMTP) |

**Hosting:** Vercel. **Node:** 18+ (20 recommended).

### Environment variables (`.env.example`)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hackathon
JWT_SECRET=change-me-to-a-long-random-string-min-32-chars
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: email the admin when a new organizer requests access (skip silently if empty)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=                 # Gmail App Password
ADMIN_NOTIFY_EMAIL=
```

---

## 3. Folder structure

```
app/
  layout.tsx                         # loads active event branding → CSS variables, fonts, metadata
  page.tsx                           # public landing (server component)
  register/page.tsx                  # registration form
  register/success/[teamId]/page.tsx # Team ID + QR
  find-registration/page.tsx         # recover QR by leader email + phone
  checkin/page.tsx                   # shared QR check-in desk (admin + organizer)
  organizer/
    signup/page.tsx                  # request-access form (public)
    login/page.tsx                   # shows pending / rejected / suspended messages
    (portal)/layout.tsx              # limited sidebar, server-side role check
    (portal)/page.tsx                # organizer home (counts only + Open Scanner)
    (portal)/teams/page.tsx          # desk lookup list (limited fields)
    (portal)/profile/page.tsx        # edit own basic details + password
  admin/
    setup/page.tsx                   # first-time admin creation (only when 0 admins)
    login/page.tsx                   # step 1 password, step 2 TOTP
    (panel)/layout.tsx               # sidebar + topbar, server-side session check
    (panel)/page.tsx                 # dashboard
    (panel)/editions/page.tsx
    (panel)/timer/page.tsx
    (panel)/branding/page.tsx
    (panel)/content/page.tsx
    (panel)/coordinators/page.tsx
    (panel)/tracks/page.tsx
    (panel)/schedule/page.tsx
    (panel)/prizes/page.tsx
    (panel)/sponsors/page.tsx
    (panel)/gallery/page.tsx
    (panel)/faqs/page.tsx
    (panel)/announcements/page.tsx
    (panel)/registrations/page.tsx
    (panel)/registrations/[id]/page.tsx
    (panel)/organizers/page.tsx      # requests (pending/approved/rejected/suspended)
    (panel)/organizers/[id]/page.tsx # full details, edit, permissions, actions
    (panel)/settings/page.tsx
    (panel)/security/page.tsx
  api/
    public/site/route.ts             # GET active event (public-safe fields only)
    public/timer/route.ts            # GET timer state + serverNow
    public/announcements/route.ts    # GET latest announcements
    public/stats/route.ts            # GET registered team count
    public/register/route.ts         # POST registration
    public/find-registration/route.ts
    admin/auth/setup/route.ts        # GET (status/QR) + POST (create admin)
    admin/auth/login/route.ts        # POST username+password → pre-auth cookie
    admin/auth/verify-totp/route.ts  # POST code → session cookie
    admin/auth/logout/route.ts
    admin/events/route.ts            # GET list, POST create (blank/clone)
    admin/events/[id]/route.ts       # GET, PATCH (any section), DELETE (archived only)
    admin/events/[id]/activate/route.ts
    admin/timer/route.ts             # POST {action: start|pause|resume|extend|reset|schedule}
    admin/upload/route.ts            # POST image → Cloudinary → returns {url, publicId}
    admin/announcements/route.ts     # GET, POST, DELETE
    admin/teams/route.ts             # GET (search/filter/paginate)
    admin/teams/[id]/route.ts        # GET, DELETE
    admin/teams/export/route.ts      # GET CSV
    admin/stats/route.ts             # dashboard numbers + chart data
    admin/organizers/route.ts        # GET list (filter by status, search)
    admin/organizers/[id]/route.ts   # GET, PATCH (edit details/permissions), DELETE
    admin/organizers/[id]/decision/route.ts  # POST {action: approve|reject|suspend|reactivate|reset-password}
    staff/checkin/route.ts           # POST lookup + confirm (admin OR organizer)
    organizer/auth/signup/route.ts   # POST request access
    organizer/auth/login/route.ts
    organizer/auth/logout/route.ts
    organizer/stats/route.ts         # counts only
    organizer/teams/route.ts         # limited-field search for the desk
    organizer/profile/route.ts       # GET, PATCH own profile
    organizer/upload/route.ts        # own profile photo only
    admin/security/password/route.ts
    admin/security/reset-2fa/route.ts
    admin/security/logs/route.ts
components/
  public/  (Hero, FlipCountdown, FlipDigit, AnnouncementTicker, About, Tracks,
            Timeline, Prizes, Rules, Coordinators, Sponsors, Gallery, Faq, Venue,
            Footer, MatrixBackground, ThemeToggle, RegCounter)
  admin/   (Sidebar, ListEditor, ImageUpload, SortableList, ConfirmDialog, StatCard, DataTable,
            PendingBadge, OrganizerRequestCard)
  organizer/ (OrganizerSidebar, BigCounter, DeskTeamCard)
  shared/  (CheckinScanner, CheckinResultCard)
  ui/      (Button, Input, Textarea, Select, Card, Modal, Switch, Badge)
lib/
  db.ts            # cached mongoose connection (global cache for serverless)
  auth.ts          # hashPassword, verifyPassword, signSession, verifySession,
                   # requireRole("admin" | "organizer" | "staff")  (staff = either)
  permissions.ts   # toOrganizerTeamView(team, permissions), maskPhone("9876543210") → "98******10"
  mailer.ts        # optional nodemailer; no-op if SMTP env vars missing
  totp.ts          # generateSecret, keyuri, verifyCode (window: 1)
  cloudinary.ts
  validators.ts    # all zod schemas shared by client + server
  timer.ts         # computeTimerView(timer, now) – pure function, unit-testable
  activeEvent.ts   # getActiveEvent() helper
  rateLimit.ts     # simple Mongo-based attempt counter
  csv.ts
models/
  Admin.ts  Organizer.ts  Event.ts  Team.ts  Announcement.ts  LoginLog.ts  Counter.ts
middleware.ts      # role-based route protection (see Section 7 → Protection)
scripts/seed.ts    # creates a demo active event with sample content
```

---

## 4. Database models (Mongoose)

### `Admin`
```
username: string (unique, lowercase)
passwordHash: string
totpSecret: string            // base32
totpEnabled: boolean
failedAttempts: number (default 0)
lockUntil: Date | null
createdAt, updatedAt
```

### `Organizer`
Organizers are **global**, not tied to one edition, so they can be reused each year. The admin suspends the ones who are no longer needed.
```
name: string
email: string (unique, lowercase)
phone: string
college: string
department: string
yearOrDesignation: string
type: "faculty" | "student"
duty: "registration_desk" | "tech_support" | "hospitality" | "logistics" | "other"
note: string                  // "who assigned you / why" (optional)
photoUrl: string | null
username: string (unique, lowercase)
passwordHash: string
status: "pending" | "approved" | "rejected" | "suspended"   // default "pending"
rejectReason: string | null
permissions: {
  checkin: boolean            // default true  – can use the QR scanner
  viewTeams: boolean          // default true  – can use the desk team list
  viewContacts: boolean       // default false – can see full phone/email
}
showOnWebsite: boolean        // default false – appears in public "Organizing Team"
sessionVersion: number        // default 0 – bump to force logout instantly
failedAttempts: number, lockUntil: Date | null
submittedIp: string
approvedAt: Date | null, approvedBy: string | null
lastLoginAt: Date | null
checkinsDone: number          // incremented on each check-in confirm
createdAt, updatedAt
```

### `Event` (one document per hackathon edition)
```
name: string                  // "HackX 2026"
slug: string (unique)
isActive: boolean             // exactly ONE true at a time (enforce in activate route)
isArchived: boolean
teamIdPrefix: string          // "HACKX"

branding: {
  logoUrl, faviconUrl, primaryColor (#00ff9d), accentColor (#7c3aed),
  sections: { hero, about, tracks, schedule, prizes, rules, coordinators,
              organizers, sponsors, gallery, faq, venue, contact } : boolean   // show/hide
}

content: {
  heroTitle, heroTagline, typingWords: string[],
  aboutTitle, aboutText (markdown allowed),
  rulesText (markdown),
  venueName, venueAddress, mapEmbedUrl,
  contactEmail, contactPhone,
  socials: { instagram, linkedin, twitter, website, whatsapp }
}

timer: {
  scheduledStart: Date | null,  // shown as countdown before start
  durationMs: number,            // e.g. 24h = 86400000
  status: "not_started" | "running" | "paused" | "ended",
  startedAt: Date | null,
  pausedAt: Date | null,
  totalPausedMs: number (default 0)
}

settings: {
  registrationOpen: boolean,
  registrationDeadline: Date | null,
  maxTeams: number | null,
  minTeamSize: number (default 2),
  maxTeamSize: number (default 4),
  organizerSignupOpen: boolean (default true),
  organizerSignupCode: string | null   // if set, sign-up form requires this code
}

coordinators: [{ _id, name, role, type: "faculty"|"student", photoUrl, phone, email, linkedin, order }]
tracks:       [{ _id, title, description, icon (lucide name), order }]
schedule:     [{ _id, day, time, title, description, order }]
prizes:       [{ _id, position, title, amount, perks, order }]
sponsors:     [{ _id, name, logoUrl, website, tier, order }]
gallery:      [{ _id, imageUrl, caption, order }]
faqs:         [{ _id, question, answer, order }]
createdAt, updatedAt
```

### `Team`
```
eventId: ObjectId (ref Event, indexed)
teamId: string                // "HACKX-0042", unique per event
teamName: string              // unique per event (case-insensitive, store teamNameLower)
track: string
members: [{ name, email, phone, college, department, year, isLeader, present: boolean }]
leaderEmail: string (lowercase, unique per event)
checkinToken: string          // crypto.randomBytes(16).toString("hex")
checkedIn: boolean
checkedInAt: Date | null
checkedInBy: { id, name, role: "admin" | "organizer" } | null
createdAt
```
Compound unique indexes: `{eventId, teamNameLower}`, `{eventId, leaderEmail}`, `{eventId, teamId}`.

### `Counter`
`{ _id: "team:<eventId>", seq: number }`. Use `findOneAndUpdate({$inc:{seq:1}}, {upsert:true, new:true})` to generate Team IDs atomically → `${prefix}-${String(seq).padStart(4,"0")}`.

### `Announcement`
`{ eventId, message, createdAt }`

### `LoginLog`
`{ username, role: "admin" | "organizer", ip, userAgent, success: boolean, reason, createdAt }`

---

## 5. Public website: requirements

**Data loading:**
- `app/page.tsx` is a server component that calls `getActiveEvent()`.
- Use `export const revalidate = 0`, or `dynamic = "force-dynamic"`, so admin edits show up immediately.
- If no active event exists, show a friendly "Coming soon" page.

**Design theme: "Hacker terminal / neon"**
- Dark background `#0a0a0f`. Neon primary and accent colours come from `event.branding`, injected as CSS variables `--primary` and `--accent` in `layout.tsx`.
- Fonts: `JetBrains Mono` for headings and the timer, `Inter` for body text (both via `next/font/google`).
- An animated **matrix-rain or particle canvas** in the hero background. It must be lightweight, pause when the tab is hidden, and respect `prefers-reduced-motion`.
- Glassmorphism cards with a neon glow on hover; framer-motion scroll-reveal animations.
- A light/dark toggle, saved to localStorage, with dark as the default.
- Sticky navbar with anchor links. It collapses to a hamburger menu on mobile.

**Sections, in order. Render a section only if `branding.sections.<name>` is true:**
1. **Navbar:** logo, links, "Register" button.
2. **Announcement ticker:** a horizontal marquee of the latest 5 announcements. Poll `/api/public/announcements` every 20s. Hide it when there are none.
3. **Hero:**
   - `heroTitle`
   - typing animation cycling through `typingWords`
   - `heroTagline`
   - **FlipCountdown**
   - CTA buttons: "Register Now" (disabled with the text "Registrations Closed" when closed) and "View Schedule"
   - **RegCounter:** "🔥 {n} teams registered"
4. **About**
5. **Tracks:** a grid of cards with lucide icons.
6. **Schedule:** a vertical timeline grouped by day, animated on scroll.
7. **Prizes:** podium-style cards for 1st, 2nd and 3rd, then the other prizes.
8. **Rules:** markdown rendered safely, with no raw HTML.
9. **Coordinators:** two groups (Faculty, Student). Each card shows a circular photo, name, role, and phone, email and LinkedIn icons.
   - **Organizing Team** (a sub-section, toggled by `sections.organizers`): approved organizers with `showOnWebsite = true`. Show photo, name, duty and faculty/student only. **Never show organizer phone or email publicly.**
10. **Sponsors:** a logo grid that shows grayscale and switches to colour on hover.
11. **Gallery:** masonry grid plus a lightbox.
12. **FAQ:** an accordion.
13. **Venue:** address plus the embedded Google Map iframe from `mapEmbedUrl`.
14. **Footer:** contact details, social icons, "© {year} {event name}", plus a small link "Organizer? Request access" → `/organizer/signup`. This link appears only when `organizerSignupOpen` is true.

**FlipCountdown (most important UI component):**
- Shows DD : HH : MM : SS with flip-card animated digits.
- Modes, computed by `lib/timer.ts → computeTimerView()`:
  - `not_started` with `scheduledStart` in the future → label "Hackathon starts in", counting down to `scheduledStart`.
  - `not_started` with no future `scheduledStart` → label "Stay tuned", with static zeros.
  - `running` → label "Time remaining", showing `durationMs - (now - startedAt - totalPausedMs)`, plus a progress bar showing the % elapsed.
  - `paused` → label "⏸ Paused", frozen at the remaining time when paused, with a pulsing amber colour.
  - `ended`, or remaining ≤ 0 → "🎉 Hackathon Over".
- **Sync:**
  - The client fetches `/api/public/timer` and receives `{timer, serverNow}`.
  - It calculates `offset = serverNow - Date.now()` and uses `Date.now() + offset` as "now".
  - It ticks every 1s and re-fetches every 15s, and also on window focus.
- Also add a full-screen **`/live` page**: a huge timer plus the announcements, for projecting in the hall.

---

## 6. Registration form: requirements

**`/register` page:**
- Loads the active event's tracks and settings.
- If registration is closed, the deadline has passed, or `maxTeams` is reached, show a clear "Registrations closed" message instead of the form.
- **Fields:**
  - Team Name
  - Track (a select built from `event.tracks`)
  - Members: a dynamic list using `useFieldArray`, starting with `minTeamSize` rows and capped at `maxTeamSize`
    - Member 1 is labelled **Team Leader** and cannot be removed.
    - Each member has: Full name, Email, Phone (10-digit Indian mobile, regex `^[6-9]\d{9}$`), College, Department, Year (select 1–5).
  - A checkbox: "I agree to the rules".
- **Validation:**
  - Uses the shared zod schema from `lib/validators.ts`.
  - Inline error messages.
  - No duplicate emails within the same team.
- **Submit:**
  - Show a loading state, then call `POST /api/public/register`.

**`POST /api/public/register` (server):**
1. Validate the body with zod. Re-check team size against the event settings.
2. Re-check open, deadline and maxTeams on the server.
3. Check that the team name (case-insensitive) and leader email are unique within the event. If not, return 409 with a friendly message.
4. Generate the Team ID with the Counter and generate the `checkinToken`.
5. Save the team. Return `{ teamId }`.
6. Basic rate limit: at most 5 registrations per IP per 10 minutes.
7. Honeypot hidden field for spam.

**`/register/success/[teamId]`:**
- Look up the team by `teamId` in the active event.
- Show:
  - 🎉 animation
  - Team ID in large mono text
  - team name and track
  - a member list
  - a **QR code** encoding `${NEXT_PUBLIC_SITE_URL}/checkin?team=${teamId}&token=${checkinToken}`
- Buttons: **Download QR (PNG)** and **Copy Team ID**.
- A message: "Show this QR at the registration desk."
- Security: the success URL must also require the token: `/register/success/HACKX-0042?token=...`. That way other teams can't view a team's QR just by changing the ID. Redirect to this URL after submitting.

**`/find-registration`:**
- The student enters the leader email and phone.
- If both match a team in the active event, show the same success view.
- Rate limited.

---

## 7. Admin authentication (password + TOTP)

### First-time setup: `/admin/setup`
- `GET /api/admin/auth/setup`:
  - If any admin exists → return `{ setupDone: true }`, and the page redirects to `/admin/login`.
  - Otherwise → generate a TOTP secret, store it in a short-lived signed httpOnly cookie (10 min, signed with `jose`), and return `{ qrDataUrl, secretBase32 }`.
  - Use `authenticator.keyuri(username, "<Event Name> Admin", secret)` and the `qrcode` package to build the QR image.
- The page has 3 steps:
  1. Choose a username and password (min 10 chars, with a strength meter).
  2. Scan the QR code with Google Authenticator or Authy. Also show the secret text for manual entry.
  3. Enter the 6-digit code.
- `POST /api/admin/auth/setup` (username, password, code):
  - Verify that no admin exists, verify the code against the secret in the cookie, hash the password (bcrypt, 12 rounds), save the admin, then log them in.
  - **Once an admin exists, this endpoint must always refuse.**

### Login: `/admin/login` (two steps)
1. `POST /api/admin/auth/login` with `{username, password}`:
   - If `lockUntil > now` → 423 "Account locked, try again in X min".
   - If wrong → `failedAttempts++`. At 5 attempts, set `lockUntil = now + 15min`.
     - Return the generic message "Invalid credentials". Never reveal whether the username exists.
   - If correct → set the `pre_auth` cookie: a JWT with `{adminId, stage:"2fa"}`, valid for 5 min, httpOnly. Return `{ next: "totp" }`.
2. `POST /api/admin/auth/verify-totp` with `{code}`:
   - Requires a valid `pre_auth` cookie.
   - Check the code with `authenticator.verify` (window 1). Wrong codes also count toward the lockout.
   - On success: reset `failedAttempts`, delete `pre_auth`, and set the `session` cookie: a JWT `{adminId, username}`, valid for 8 h, httpOnly, `secure` in production, `sameSite: "lax"`, path `/`.
- Log every attempt in `LoginLog`, with IP from `x-forwarded-for`.
- **UI:** a terminal-styled card. The OTP step has 6 separate auto-advancing input boxes, and pasting a code works.

### Protection (role-based)
- Admins and organizers share one `session` cookie. Its JWT payload is `{ sub, role: "admin" | "organizer", name, ver }`.
- `middleware.ts` uses `jose` to verify the JWT and then routes by role:

  | Path | Allowed roles | If not allowed |
  |---|---|---|
  | `/admin/*`, `/api/admin/*` | `admin` | page → `/admin/login?next=…`, API → 401/403 JSON |
  | `/organizer/*` (portal), `/api/organizer/*` | `organizer` | page → `/organizer/login?next=…` |
  | `/checkin`, `/api/staff/*` | `admin` or `organizer` | page → `/organizer/login?next=…` (that page also has an "Admin login" link) |

  The middleware does **not** apply to these public pages and routes: `/admin/login`, `/admin/setup`, `/api/admin/auth/*`, `/organizer/login`, `/organizer/signup`, `/api/organizer/auth/*`.
- **Also**, every protected route handler calls `await requireRole(...)` from `lib/auth.ts` (defence in depth).
  - For organizers, `requireRole` loads the Organizer from the DB. It rejects the request and clears the cookie unless `status === "approved"` **and** `ver === sessionVersion`.
  - This makes suspending an organizer take effect instantly.
- **Do not use mongoose in middleware** (Edge runtime).
- The logout routes clear the cookie.

---

## 8. Admin panel: requirements

**Layout:**
- A sidebar with icons for all pages; on mobile it becomes a drawer.
  - The **Organizers** item shows a red badge with the number of pending requests.
- A topbar showing:
  - **edition switcher**: which event is being edited. Default is the active one; the selection is stored in the URL `?event=<id>` or in a cookie.
  - a "View site" link
  - Logout
- A clear badge shows whether the edited event is **LIVE** (active) or **Archived/Draft**.

**Common pattern for list sections** (coordinators, tracks, schedule, prizes, sponsors, gallery, faqs):
- Build ONE generic `ListEditor` component, configured with a field schema. It provides:
  - a table/card list
  - Add/Edit in a modal form
  - Delete with confirmation
  - drag-to-reorder (dnd-kit), which updates `order`
  - image fields use the `ImageUpload` component
- Saving calls `PATCH /api/admin/events/[id]` with `{ section: "coordinators", data: [...] }`. The server validates each section with its own zod schema.
- After every save: a toast "Saved ✓".

**Pages:**

| Page | Requirements |
|---|---|
| **Dashboard** | A "🔔 N new organizer requests → Review" banner at the top when requests are pending. Stat cards: Total teams, Today's registrations, Checked-in X/Y, Registration status. Bar chart of teams per track and line chart of registrations per day (recharts). Timer status card with a quick Start button. Latest 5 teams. |
| **Organizers** | See Section 9A: tabs, the full submitted details, approve/reject/suspend, edit, permissions. |
| **Editions** | Table of all events (name, status, team count, created). Buttons: **New (blank)**, **Clone** (copies branding, content, lists and settings; resets the timer; no teams; new name and prefix asked in a modal), **Set Active** (sets this one active, all others inactive, in a transaction or two-step update), **Archive**, **Delete** (only archived events with 0 teams, with a typed confirmation). |
| **Timer** | Shows the live FlipCountdown preview. Form: scheduled start (datetime-local, IST), duration (hours + minutes). Buttons: ▶ Start Now, ⏸ Pause, ⏯ Resume, ➕ Extend (+15m, +30m, +1h, custom), ⏹ End Now, 🔄 Reset. Each calls `POST /api/admin/timer {eventId, action, value?}` with a confirmation dialog for Start, End and Reset. Server logic: **start** → status running, `startedAt = now`, `totalPausedMs = 0`. **pause** → `pausedAt = now`. **resume** → `totalPausedMs += now - pausedAt`, `pausedAt = null`. **extend** → `durationMs += value`. **end** → status ended. **reset** → not_started with all fields cleared. Reject invalid transitions (for example, pause when not running). |
| **Branding** | Event name, Team ID prefix, logo and favicon upload, primary and accent colour pickers with live preview, and a toggle switch per section. |
| **Content** | Forms for the hero (title, tagline, typing words as a tag input), about, rules (markdown editor with preview), venue (name, address, map embed URL with a help tooltip), contact, socials. |
| **Coordinators** | ListEditor: photo, name, role, type (faculty/student), phone, email, LinkedIn. |
| **Tracks / Schedule / Prizes / Sponsors / Gallery / FAQs** | A ListEditor for each, with the fields from the Event model. |
| **Announcements** | Textarea plus a "Post" button. A list of recent announcements, each with Delete. They appear on the public ticker within 20 s. |
| **Registrations** | Server-side paginated table: Team ID, Team name, Track, Leader, Phone, Members count, Checked-in, Checked-in by, Registered at. Search by team name, Team ID, leader email or phone. Filter by track and checked-in. Row click opens the detail page with all members and a delete button. **Export CSV** (one row per member, with team columns repeated, including check-in time). |
| **Check-in** | See Section 9. |
| **Settings** | Registration open toggle, deadline (datetime), max teams, min and max team size, organizer sign-up open toggle, organizer sign-up code. |
| **Security** | Change password (needs the current password plus a TOTP code). Reset 2FA (needs a current TOTP code, then shows a new QR and verifies it). Login log table (last 100). |

---

## 9. QR check-in: requirements

**`/checkin` page (shared by the admin and approved organizers that have `permissions.checkin`):**
- **Scanner:**
  - A camera scanner using `html5-qrcode`, with the back camera by default and a camera switch button.
  - It works on mobile Chrome and Safari over HTTPS. Vercel provides HTTPS.
- **Opening the page from a QR link:**
  - The page also accepts URL params `?team=&token=`.
  - When an organizer scans the QR with the phone's normal camera, the link opens this page and the lookup happens automatically.
  - If they aren't logged in, the middleware sends them to `/organizer/login?next=…` and then back.
- **Manual mode:**
  - Type a Team ID, or search by team name or member name.
  - Manual mode doesn't need the token, because the user is logged-in staff.
- **What the result card shows depends on the role:**
  - Organizers see the output of `toOrganizerTeamView()`: Team ID, team name, track, and each member's name, college and year. Phones are masked unless `viewContacts` is on, and there is no email.
  - The admin sees everything.
- **Flow:**
  1. On scan, parse the URL, then call `POST /api/staff/checkin {action:"lookup", teamId, token?}`.
  2. The server validates:
     - the team exists in the **active** event
     - the token matches, if one was provided; compare with `crypto.timingSafeEqual`
  3. Show a result card:
     - ✅ green: team name, Team ID, track, members with a checkbox each (all ticked by default)
     - ⚠️ amber "Already checked in at 9:42 AM by {name}": shown if the team is already checked in, with an option to update member attendance
     - ❌ red "Invalid QR / team not found"
  4. "Confirm Check-in" calls `POST {action:"confirm", teamId, presentMemberIds[]}`.
     - The server sets `checkedIn`, `checkedInAt`, `checkedInBy {id, name, role}` and `members[].present`.
     - If the user is an organizer, it also increments their `checkinsDone`.
  5. After confirmation, play a success sound and vibration (`navigator.vibrate`), then return to the scanner automatically after 2 s, ready for the next team.
- A live counter at the top: "**45 / 87 teams checked in**".

---

## 9A. Organizer role (limited access + admin approval)

### What each role can do

| Feature | Admin (main admin) | Organizer |
|---|---|---|
| How they get access | First-time `/admin/setup` | Sign up at `/organizer/signup`, then the **admin approves** |
| Login | username + password + **TOTP** | username/email + password |
| Dashboard | Everything | **Counts only:** total teams, checked in X/Y, remaining, teams per track, registration open/closed |
| QR check-in camera (`/checkin`) | ✅ | ✅ if `permissions.checkin` |
| Team list | Full details, delete, CSV export | **Desk view only:** Team ID, team name, track, member names, college, year, check-in status. Phone masked `98******10`. No email. Needs `permissions.viewTeams`. |
| Full phone / email of students | ✅ | ❌, unless the admin enables `permissions.viewContacts` for that organizer |
| CSV export, delete teams | ✅ | ❌ |
| Edit site content, timer, branding, editions, settings, announcements | ✅ | ❌ |
| See other organizers, login logs | ✅ | ❌ |
| Edit own profile | ✅ | ✅ name, phone, photo and password only (not status or permissions) |

### Organizer sign-up: `/organizer/signup`
- A public page, linked from the footer and from `/organizer/login`. It is not in the main navbar.
- If `settings.organizerSignupOpen` is false, show "Organizer sign-ups are closed."
- **Fields:**
  - Full name
  - Email
  - Phone (10 digits)
  - College
  - Department
  - Year / designation
  - Organizer type: Faculty / Student volunteer
  - Preferred duty: Registration desk / Technical support / Hospitality / Logistics / Other
  - Username
  - Password (min 8) and Confirm password
  - Note: "Who assigned you / why?" (optional)
  - **Sign-up code.** Shown and required only if `settings.organizerSignupCode` is set. This stops random people from requesting access.
- **Server checks:**
  - zod validation
  - username and email must be unique
  - honeypot field
  - rate limit of 3 requests per IP per hour
  - the sign-up code is compared in constant time
- **On success:**
  - Save with `status: "pending"` and `submittedIp`.
  - Show "✅ Request submitted! You can log in once the admin approves your request."
  - If SMTP is configured, email `ADMIN_NOTIFY_EMAIL`: "New organizer request: {name} ({duty})", with a link to `/admin/organizers`.

### Admin approval: Admin → Organizers
- **How the admin is notified:**
  - the red badge on the sidebar
  - the dashboard banner
  - optional email
- **Tabs:** Pending | Approved | Rejected | Suspended, plus search by name/email/phone.
- **Request card:** shows **all submitted information**, plus the submitted date/time and IP.
- **Actions:**
  - **Approve.** A modal to confirm the duty, set the permissions and set `showOnWebsite`. Default permissions: checkin ✅, viewTeams ✅, viewContacts ❌. The server sets `approvedAt` and `approvedBy`.
  - **Reject.** Requires a reason. The organizer sees it when they try to log in.
  - **Edit details.** The admin can edit every organizer field, including the photo (`ImageUpload`).
  - **Suspend / Reactivate.** Suspend sets the status and increments `sessionVersion`, so the organizer is logged out instantly.
  - **Reset password.** Generates a random temporary password, shows it to the admin once, and increments `sessionVersion`.
  - **Delete**, with confirmation.
- The **Approved** tab shows each organizer's `checkinsDone` count and `lastLoginAt`.

### Organizer login: `/organizer/login`
- Username or email, plus password.
- Lockout after 5 failures for 15 minutes. Every attempt is logged in `LoginLog` with `role: "organizer"`.
- If the password is correct, the response depends on the status:
  - `pending` → "⏳ Your request is waiting for admin approval."
  - `rejected` → "❌ Your request was rejected: {reason}"
  - `suspended` → "🚫 Your access has been revoked. Please contact the admin."
  - `approved` → set the session cookie `{ sub, role: "organizer", name, ver: sessionVersion }` (12 h), update `lastLoginAt`, and redirect to `/organizer`.
- If the password is wrong, show only "Invalid credentials". Don't reveal the status.

### Organizer portal: `/organizer`
Mobile-first, with big buttons and big numbers, because it is used standing at a desk.

| Page | Contents |
|---|---|
| **Home** | Big counters: "🧑‍💻 87 teams registered", "✅ 45 checked in", "⏳ 42 remaining". Teams-per-track counts. A large **📷 Open Scanner** button → `/checkin`. Auto-refreshes every 30 s. |
| **Teams (desk lookup)** | Only shown if `viewTeams`. Search by Team ID, team name or member name. A filter for checked-in or not. Limited fields only, built with `toOrganizerTeamView()`. Tapping a team opens its check-in card. Paginated; **no export**. |
| **Check-in** | The shared `/checkin` page (Section 9). |
| **Profile** | Edit own name, phone and photo (via `/api/organizer/upload`, own photo only). Change password, which needs the current password. |

### Server-side enforcement (very important)
- `lib/permissions.ts → toOrganizerTeamView(team, permissions)`:
  - returns ONLY `teamId, teamName, track, checkedIn, checkedInAt, members[{name, college, year, present, phone?}]`
  - `phone` is masked unless `viewContacts`; email is included only if `viewContacts`
  - **never** returns `checkinToken`, `leaderEmail` or IDs of other records
- `/api/organizer/*` and `/api/staff/*` must use this function for organizers. Write a small unit test for it.
- `/api/organizer/stats` returns counts only, with no personal data.
- Every organizer API checks the specific permission (`checkin`, `viewTeams`) and returns 403 if it is off.

---

## 10. Image uploads (Cloudinary)

- `ImageUpload` component:
  - pick a file, preview it, and check client-side that it is an image under 5 MB
  - send it as multipart to `POST /api/admin/upload`
- The server:
  - checks the admin session
  - checks the MIME type (jpeg, png, webp, svg for logos)
  - uploads with `cloudinary.uploader.upload_stream` to folder `hackathon/<eventSlug>/`
  - returns `{url, publicId}`
- Use `next/image` with Cloudinary configured as a remote pattern (`res.cloudinary.com`) in `next.config.js`.
- When the URL is `res.cloudinary.com`, use Cloudinary transformation URLs: `w_400,h_400,c_fill,g_face` for coordinator photos.

---

## 11. Security and quality checklist (must all be true)

- [ ] Passwords hashed with bcrypt; the TOTP secret never sent to the client after setup.
- [ ] All cookies httpOnly; `secure` in production; `sameSite: lax`.
- [ ] Every admin API calls `requireRole("admin")`; public APIs never return `checkinToken`, admin data or other teams' personal details.
- [ ] An organizer session calling any `/api/admin/*` route gets 403. Test this explicitly.
- [ ] Organizer responses never contain student email or full phone unless `viewContacts` is on, and never `checkinToken`.
- [ ] Pending, rejected and suspended organizers can't get a session. A suspended organizer's existing session stops working immediately (`sessionVersion` check).
- [ ] The public "Organizing Team" section never shows organizer phone or email.
- [ ] Public `site` API strips nothing sensitive, because the Event holds no secrets, but it must return only the **active** event.
- [ ] zod validation on every route; consistent error JSON `{ error: string, fields?: {...} }`.
- [ ] Rate limiting on login, TOTP, register and find-registration.
- [ ] Markdown rendered with `react-markdown` without `rehype-raw` (no XSS).
- [ ] Setup endpoint permanently disabled once an admin exists.
- [ ] Mongoose connection cached for serverless (`global._mongoose`).
- [ ] No console errors; Lighthouse mobile performance ≥ 85 and accessibility ≥ 90 on `/`.
- [ ] All forms keyboard-accessible with visible focus states and proper labels.
- [ ] Loading skeletons and empty states for every list.
- [ ] Dates are stored in UTC and shown in **IST (Asia/Kolkata)**.

---

## 12. Build phases (work in this order; stop and report after each)

**Phase 1: Foundation**
- Init Next.js 14 + TS + Tailwind; install all packages; set up `lib/db.ts` and every model.
- Write `.env.example` and the seed script (`npm run seed` creates the demo event "HackX 2026", set active, with sample content for every section).
- ✅ Checkpoint: `npm run dev` runs, and the seed creates the event in Atlas.

**Phase 2: Admin auth**
- Setup page, login (two steps), TOTP, lockout, LoginLog, middleware, `requireRole`, logout, and the admin layout shell.
- ✅ Checkpoint:
  - set up an admin with Google Authenticator and log in
  - a wrong code fails
  - 5 failures lock the account
  - `/admin` redirects when logged out

**Phase 3: Editions + content editing**
- Editions page (create, clone, activate, archive), the edition switcher, the generic `ListEditor`, `ImageUpload` with Cloudinary, and the Branding, Content, Settings and list pages.
- ✅ Checkpoint: editing any field saves to the DB and survives a refresh.

**Phase 4: Timer**
- `lib/timer.ts`, the admin timer page and API, `FlipCountdown`, `/api/public/timer` with serverNow, and the `/live` page.
- ✅ Checkpoint:
  - Start, Pause, Resume, Extend, End and Reset all work
  - two browsers show the same time (±1 s)

**Phase 5: Public website**
- All sections, the theme, the matrix background, animations, navbar, light/dark mode, the announcement ticker and the reg counter; everything driven by the active event.
- ✅ Checkpoint:
  - toggling a section in admin hides it on the site
  - changing the colours re-themes the site
  - looks good at 360px

**Phase 6: Registration**
- Form, API, Team ID counter, success page with the QR code (token-protected), find-registration.
- ✅ Checkpoint:
  - teams of 2 and 4 members both register
  - duplicates get a 409
  - closed registration, a passed deadline and maxTeams are all enforced

**Phase 7: Registrations admin + check-in**
- Table, search, filters, detail page, delete, CSV export, the check-in scanner and manual mode, and the dashboard stats and charts.
- ✅ Checkpoint:
  - scanning the QR on a phone checks the team in
  - a second scan shows "already checked in"
  - the CSV opens correctly in Excel

**Phase 8: Organizer role**
- The Organizer model, `/organizer/signup`, `/organizer/login` with the status messages, and `requireRole` with the `sessionVersion` check.
- Role-based middleware, `lib/permissions.ts` plus its unit test, and the organizer portal (Home, Teams, Profile).
- `/checkin` shared with organizers.
- Admin → Organizers page (tabs, approve/reject/suspend/edit/reset password), the pending badge and dashboard banner, optional email notification, and the public "Organizing Team" section.
- ✅ Checkpoint:
  - an organizer signs up, can't log in while pending, and can log in after approval
  - the organizer sees counts and masked desk details only
  - the organizer can check a team in with the camera
  - the organizer gets 403 on `/api/admin/*`
  - suspending the organizer logs them out immediately

**Phase 9: Polish + deploy docs**
- Announcements admin, Security page (change password, reset 2FA, logs), loading and empty states, accessibility pass, metadata/OG tags (from branding), and the 404 page.
- Write the full `README.md`. Include step-by-step guides for:
  - creating a MongoDB Atlas M0 cluster (including network access 0.0.0.0/0 for Vercel)
  - Cloudinary keys
  - deploying to Vercel and setting the env vars
  - first admin setup
  - how to start a new edition next year
- ✅ Final checkpoint: `npm run build` passes with zero errors and zero type errors.

---

## 13. Acceptance test (I will run this at the end)

1. Fresh deploy → `/admin/setup` → create the admin → scan with Google Authenticator → log in with password + OTP.
2. Edit the hero title, add 2 coordinators with photos, change the theme colour → all of it shows on `/`.
3. Set a scheduled start 5 min ahead → the countdown shows. Press Start → `/` and `/live` on two devices show the same running timer. Pause, Extend +15m, Resume and End all work.
4. Post an announcement → it appears on the ticker within 20 s.
5. Register a team of 3 → the success page shows the Team ID and QR. A duplicate name is rejected. Closing registration in admin blocks the form.
6. On a phone, scan the team's QR at `/checkin` → it checks in. Scanning again shows "already checked in". The dashboard shows 1/1 checked in.
6a. Organizer flow:
   - Submit `/organizer/signup` → the admin sees the badge and the full request details.
   - Logging in before approval shows "waiting for approval".
   - The admin approves → the organizer logs in and sees only the counts and the masked desk list. There is no export and no admin pages.
   - The organizer scans a team's QR → the team is checked in, and the admin sees "Checked-in by {organizer name}".
   - The admin suspends the organizer → their next action fails and they are logged out.
   - Rejecting another request shows the reason on login.
7. Export CSV → the members and check-in time are correct.
8. Editions → Clone as "HackX 2027" → Set Active → the public site shows the 2027 event with 0 teams; the 2026 data is still viewable in the admin.
9. The site works on a 360px-wide phone without horizontal scroll.

**Start with Phase 1 now.**
