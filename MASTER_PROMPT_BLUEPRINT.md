# MASTER PROMPT: HACKX 2026 — Blueprint Landing Page

> **How to use:** Copy everything below the line into Google Antigravity as the first task. Open an empty folder as the workspace. Let the agent work through the phases in order, and check each checkpoint before telling it to continue.

---

## 0. Your role and how to work

You are a senior creative frontend developer and art director. Build a **complete, production-quality, single-page website** for a college hackathon in this empty workspace, following this specification exactly. It must NOT look like a typical AI-generated site. Every visual, typographic, and layout choice below is deliberate; do not substitute your own defaults.

**Working rules:**
1. Work **phase by phase** (Section 10). At the end of each phase:
   - run `npm run build`
   - fix all errors
   - summarise what you built
   - list how I can test it
2. Keep the code readable and commented where the logic is non-obvious (especially the canvas loop).
3. All event data lives in one `src/data/event.js` file so I can edit it easily. Never hard-code event details in components.
4. Mobile-first and responsive. The site must look great from 360px to 1920px, with no horizontal scroll.
5. Keep components small: one file per section plus a Background component.
6. Don't add unrequested features. Don't add libraries beyond what's listed in Section 1.
7. If something in this spec is ambiguous, choose the simplest option and note it in `README.md` under "Decisions".

---

## 1. Tech stack (use exactly this)

| Purpose | Package |
|---|---|
| Build tool | `vite@latest` (React template) |
| Framework | `react@18+`, `react-dom@18+` |
| Styling | `tailwindcss@3.4+`, `postcss`, `autoprefixer` |
| Animation | `framer-motion@11+` (scroll reveals ONLY) |
| Fonts | Google Fonts: **Bricolage Grotesque** (700, 800) and **JetBrains Mono** (400, 500, 700). Load via `<link>` in `index.html`. |

**Banned packages / fonts:** No animation library for the canvas (hand-write it). No Inter, Poppins, or Roboto. No GSAP, Three.js, particles.js, tsparticles, or any other canvas/animation library.

**Hosting:** Static — deploy anywhere (Vercel, Netlify, GitHub Pages). No backend.

---

## 2. Event data file — `src/data/event.js`

All event information is centralised here. Placeholders are marked with `[BRACKETS]` — I will fill them in before launch.

```js
const event = {
  // ─── Core ───
  name: "HACKX 2026",
  tagline: "Build Autonomous Agents",
  format: "24-hour, in-person hackathon",
  college: "[COLLEGE NAME]",
  city: "[CITY]",
  year: 2026,

  // ─── Dates (ISO 8601, IST = +05:30) ───
  startDate: "[START DATE & TIME ISO]",   // e.g. "2026-11-15T09:00:00+05:30"
  endDate: "[END DATE & TIME ISO]",       // e.g. "2026-11-16T09:00:00+05:30"
  timezone: "Asia/Kolkata",

  // ─── Venue ───
  venue: "[VENUE / BUILDING / ROOM]",
  venueAddress: "[FULL ADDRESS]",
  mapUrl: "[GOOGLE MAPS LINK]",

  // ─── Team ───
  teamSizeMin: "[MIN]",   // e.g. 2
  teamSizeMax: "[MAX]",   // e.g. 4

  // ─── Prizes ───
  prizePool: "[TOTAL AMOUNT]",  // e.g. "₹1,00,000"
  prizes: {
    first:   "[AMOUNT]",   // e.g. "₹50,000"
    second:  "[AMOUNT]",   // e.g. "₹30,000"
    third:   "[AMOUNT]",   // e.g. "₹15,000"
    special: "[SPECIAL PRIZES]", // e.g. "Best UI/UX ₹5,000"
  },

  // ─── Tracks ───
  tracks: [
    { id: "01", name: "[TRACK 1]", description: "[One-line description of track 1]" },
    { id: "02", name: "[TRACK 2]", description: "[One-line description of track 2]" },
    { id: "03", name: "[TRACK 3]", description: "[One-line description of track 3]" },
    { id: "04", name: "[TRACK 4]", description: "[One-line description of track 4]" },
  ],

  // ─── Schedule ───
  schedule: [
    { time: "08:00 AM", title: "Registration & check-in",    description: "Get your badges, find your desk, set up." },
    { time: "09:00 AM", title: "Opening ceremony",           description: "Welcome, rules, track reveals, and the starting signal." },
    { time: "09:30 AM", title: "Hacking begins",             description: "Keyboards out. Clock starts. Go." },
    { time: "01:00 PM", title: "Mentor rounds",              description: "Industry mentors visit each team for feedback." },
    { time: "12:00 AM", title: "Midnight snack break",       description: "Free food. Step away from the screen for ten minutes." },
    { time: "03:00 AM", title: "Mid-point check",            description: "Quick standup. Show what you've got so far." },
    { time: "08:00 AM", title: "Submissions close",          description: "Push your code. Upload the demo video. No exceptions." },
    { time: "09:00 AM", title: "Judging",                    description: "Judges review projects. Top teams do a live demo." },
    { time: "11:00 AM", title: "Closing & prizes",           description: "Winners announced. Trophies. Group photo. Go sleep." },
  ],

  // ─── Rules ───
  rules: [
    `Teams of [MIN]–[MAX] members. Solo entries are not allowed.`,
    "All code must be written during the hackathon. Pre-built projects will be disqualified.",
    "You may use open-source libraries and public APIs. Credit them in your README.",
    "Each team submits one project. One repo, one demo video (under 3 minutes).",
    "Submissions must be pushed to GitHub/GitLab before the deadline. Late pushes are ignored.",
    "Judging criteria: originality (25%), technical depth (25%), working demo (25%), presentation (25%).",
    "Be respectful. Harassment, plagiarism, or sabotage means instant disqualification.",
    "Organisers' decisions on all disputes are final.",
    "Participants must stay on the venue premises for the full 24 hours.",
    "By registering, you agree to appear in event photos and videos shared on social media.",
  ],

  // ─── Links ───
  registrationUrl: "[URL]",

  // ─── Contact ───
  contact: {
    email: "[EMAIL]",
    instagram: "[INSTAGRAM URL]",
    discord: "[DISCORD/WHATSAPP URL]",
  },

  // ─── Sponsors ───
  sponsors: [
    // { name: "Sponsor A", logoUrl: "/sponsors/sponsor-a.svg" },
    // Add sponsors here, or leave empty for placeholder slots
  ],
  sponsorContactEmail: "[SPONSOR CONTACT EMAIL]",

  // ─── Organizers / Team ───
  organizers: [
    // { name: "[NAME]", role: "[ROLE]", photo: "/team/name.jpg" },
    // Add team members here, or leave as placeholders
    { name: "Organizer 1", role: "Lead Organizer", photo: null },
    { name: "Organizer 2", role: "Tech Lead", photo: null },
    { name: "Organizer 3", role: "Design Lead", photo: null },
    { name: "Organizer 4", role: "Logistics", photo: null },
    { name: "Organizer 5", role: "Sponsorship", photo: null },
    { name: "Organizer 6", role: "Marketing", photo: null },
  ],

  // ─── FAQs ───
  faqs: [
    { q: "Who can participate?", a: "Any college student with a valid student ID. All years, all branches." },
    { q: "Is there a registration fee?", a: "No. It's completely free — food, swag, and WiFi included." },
    { q: "What should I bring?", a: "Your laptop, charger, student ID, and a mass of caffeine tolerance. We provide power strips and WiFi." },
    { q: "I don't have a team yet. Can I still register?", a: "Yes. Register solo and we'll match you with others at the team formation session before hacking begins." },
    { q: "Is food provided?", a: "Yes. Dinner, midnight snacks, and breakfast are covered. Mention dietary restrictions in the registration form." },
    { q: "Is there accommodation?", a: "The venue is open 24 hours. Bring a sleeping bag if you plan to nap, but let's be honest — you probably won't." },
    { q: "Do I get a certificate?", a: "All participants who submit a project get a certificate of participation. Winners get additional certificates." },
    { q: "Will there be mentors?", a: "Yes. Mentors from industry do rounds throughout the event. You can ask them anything — tech, product, pitch advice." },
  ],

  // ─── Footer ───
  madeBy: "Made by students at [COLLEGE NAME]",
};

export default event;
```

---

## 3. Folder structure

```
landing-site/
├── index.html                      # loads Google Fonts, meta/OG tags
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── README.md
├── public/
│   └── og-image.png                # placeholder Open Graph image
└── src/
    ├── main.jsx                    # React DOM root
    ├── App.jsx                     # assembles all sections
    ├── index.css                   # Tailwind directives + custom styles
    ├── data/
    │   └── event.js                # ← all event data (Section 2)
    └── components/
        ├── Background.jsx          # the full-screen <canvas>
        ├── CustomCursor.jsx        # crosshair cursor (desktop only)
        ├── Navbar.jsx
        ├── Hero.jsx
        ├── About.jsx
        ├── Tracks.jsx
        ├── Schedule.jsx
        ├── Prizes.jsx
        ├── Rules.jsx
        ├── Team.jsx
        ├── Sponsors.jsx
        ├── Faqs.jsx
        ├── Venue.jsx
        └── Footer.jsx
```

---

## 4. Visual identity: "BLUEPRINT"

### Colour palette
| Token | Hex | Usage |
|---|---|---|
| `navy` | `#0B1F3A` | Background (page, canvas, cards) |
| `offwhite` | `#F2EFE6` | All body text, headings |
| `line` | `#F2EFE6` at **15–30% opacity** | Lines, borders, dividers, hairlines |
| `yellow` | `#FFD23F` | **ONE accent only.** CTAs, highlights, active states, agent dots, hover states |

No other colours. No gradients, glows, glassmorphism, blurred blobs, neon green, or matrix rain.

### Typography
| Use | Font | Weight | Notes |
|---|---|---|---|
| Headlines, section titles | Bricolage Grotesque | 700–800 | Tight leading, large sizes |
| Labels, numbers, metadata, code | JetBrains Mono | 400–700 | Mono creates the "blueprint" feel |
| Body paragraphs | Bricolage Grotesque | 400 (if available) or JetBrains Mono 400 | Keep it readable |

Load both from Google Fonts via `<link>` tags in `index.html`. **Banned fonts:** Inter, Poppins, Roboto.

### Style rules
- **Square corners.** Border-radius: 0–2px maximum. No rounded pills, no fully rounded corners anywhere.
- **1px technical hairlines** for dividers and borders. Colour: offwhite at 15–30% opacity.
- **Hard offset shadows** on buttons and key elements: `6px 6px 0 #FFD23F` (or similar hard rectangular shadow). No soft box-shadows, no glows.
- **Crosshair "+" marks** at section corners — small decorative crosses rendered in CSS or inline SVG.
- **Dimension-line details** as decorative elements: e.g. `←—— 24 HRS ——→` rendered in mono.
- **Section numbering** in mono: `01 / TRACKS`, `02 / SCHEDULE`, etc.
- **Left-aligned, asymmetric layouts** with generous whitespace. NOT centered-everything.

### Banned elements
Gradients, glow effects, glassmorphism, blurred blobs, neon green, matrix rain, emoji icons, rounded pill badges, typing-cursor animation, three-identical-rounded-cards layouts, centered-everything layouts, stock-photo placeholders.

---

## 5. Moving background — `Background.jsx`

> This is the most important visual element. Build it as a **fixed full-screen `<canvas>`** behind all content, with `pointer-events: none`. **No animation library** — write all drawing and animation logic by hand using the Canvas 2D API.

### 5.1 Grid
- Faint square grid, **48px cells**.
- Regular lines at **~6% opacity** (offwhite).
- Every **5th line** slightly stronger at **~12% opacity**, like graph paper.

### 5.2 Agents
- **40 agents on desktop**, **18 on mobile** (viewport width < 768px).
- Each agent is a small **yellow square, 3×3 px**.
- Agents move **along grid lines only** at a slow, steady speed: **30–70 px/s** (randomised per agent).
- At random **grid intersections**, the agent has a **~25% chance** of turning 90°.
- Each agent leaves a **fading trail of 40–80px** that fades from yellow to transparent.
- When an agent **exits the screen**, it respawns at a **random edge** on a grid line.

### 5.3 Nodes
- Every **8–12 seconds**, a random grid intersection **pulses once**: a thin expanding square outline that fades out over ~1s. Like an agent just completed a task.

### 5.4 Cursor interaction
- Grid lines within **160px of the mouse** brighten smoothly to **~35% opacity** with a soft radial falloff.
- Agents within **100px of the cursor** steer gently away (push force, not teleport).
- On **touch devices**, skip the cursor effect entirely. Detect via `'ontouchstart' in window` or `navigator.maxTouchPoints > 0`.

### 5.5 Parallax
- Grid offset shifts **very slightly** (max 12px) with scroll position, so the grid feels like it has depth.
- Use `window.scrollY` and apply a small fraction (e.g. `scrollY * 0.03`) to the grid drawing offset.

### 5.6 Data packets
- Every **~6 seconds**, pick one random agent.
- That agent briefly **grows to 5×5 px** and its trail turns **brighter yellow** for **1.5 seconds**, then returns to normal.
- This simulates a "data packet" event.

### 5.7 Performance
- Use `requestAnimationFrame` with **delta-time** for frame-rate-independent movement.
- Cap `devicePixelRatio` at **2** to avoid GPU strain on high-DPI screens.
- Handle **window resize** — recalculate canvas dimensions and agent count.
- **Pause when the tab is hidden** using `document.visibilitychange`. Don't waste CPU on a background tab.
- **Clean up** all event listeners, intervals, and the animation frame on React unmount.
- Target a solid **60fps on a mid-range laptop**.

### 5.8 Accessibility
- If **`prefers-reduced-motion`** is set, render a **static grid** with a few **stationary yellow dots** and **no animation** at all.

### 5.9 Readability
- Keep the background **subtle enough** that text always stays readable over it.
- Add a very light **navy vignette** at the page edges (a CSS pseudo-element or drawn on canvas) to darken the periphery slightly.

---

## 6. Layout & sections

> **All sections are LEFT-ALIGNED and asymmetric** with generous whitespace. Use a max-width container (e.g. 1280px) with left-biased padding. Do NOT centre everything.

### 6.1 Navbar
- **Sticky**, flat, with a **1px bottom border** (offwhite at 20% opacity). No pill shape, no backdrop blur.
- **Logo:** "HACKX" in JetBrains Mono on the left.
- **Links** (5 only): About, Tracks, Schedule, Prizes, FAQs. In JetBrains Mono, small. Normal opacity, brighten on hover.
- **Register button:** square, yellow background, navy text, **hard offset shadow** (`4px 4px 0 rgba(242,239,230,0.3)`). On the right side.
- **Mobile (< 768px):** collapse links to a hamburger. On click, show a **full-screen overlay menu** with large left-aligned links. No blur background.

### 6.2 Hero
- **Tiny mono label** above the headline:
  `[COLLEGE NAME] / 24-HOUR HACKATHON / [YEAR]`
  In JetBrains Mono, small caps or uppercase, dimmed opacity.

- **Headline:** `HACKX 2026` in huge left-aligned Bricolage Grotesque (around **18–20vw** on desktop, capped with a max font-size so it doesn't break on ultrawide). Tight leading (line-height ~0.9). The "2026" is **outlined** — use `text-stroke` / `-webkit-text-stroke` with transparent fill so it contrasts with the solid "HACKX".

- **Subhead:** one line, casual student voice:
  `"24 hours. Build an agent that actually does something. Free food, loud music, one trophy."`
  In Bricolage Grotesque regular or JetBrains Mono, at comfortable reading size.

- **Dimension-line decoration** below the headline:
  `←—— 24 HRS ——→`
  In JetBrains Mono, dimmed, decorative.

- **Countdown:** NOT in boxes or tiles. A single **plain mono row** along the bottom of the hero section, with thin vertical `|` dividers:
  `01d : 23h : 34m : 39s`
  Numbers in offwhite, large-ish JetBrains Mono. Labels (`d`, `h`, `m`, `s`) tiny and dimmed.
  - Calculate the countdown to `event.startDate` in IST.
  - When it reaches zero, replace the entire countdown with: `HACKING IS LIVE` in yellow.
  - If the event end date has passed, show: `HACKX 2026 HAS ENDED`.

- **CTAs:**
  - Primary: yellow button with hard shadow, text `"Register your team →"`. Links to `event.registrationUrl`.
  - Secondary: plain underlined text link `"See the schedule"`. Scrolls to the schedule section.

- **Registered-teams counter:** Do NOT render this element unless the count is 10 or more. (Since this is a static site, either hard-code a number in `event.js` or omit it.)

### 6.3 About
- **Two-column asymmetric** layout (roughly 55/45 or 60/40 split). On mobile: stack.
- **Left column:** A big statement headline:
  `"Not another hackathon. A 24-hour sprint to build agents that act on their own."`
  In Bricolage Grotesque, large.
- **Right column:**
  - 3 short paragraphs describing what happens, who it's for, and why it's different. Written in casual, direct student voice.
  - Below the paragraphs: a **stats strip** in JetBrains Mono, laid out horizontally with hairline dividers:
    `24 HRS  |  4 TRACKS  |  ₹[PRIZE]  |  [N] SEATS`

### 6.4 Tracks
- Section label: `01 / TRACKS` in JetBrains Mono, dimmed.
- **A numbered list (01–04), NOT cards.** Each track is a full-width row with:
  - A **hairline divider** (top border) separating rows.
  - Left: the track number in large Bricolage Grotesque (e.g. `01`).
  - Middle: the **track name** in large type, and a **one-line description** below it in smaller text.
  - Right: a **→ arrow** that slides right by ~8px on hover (CSS transition).
- On **hover**: the row background shifts to a slightly **lighter navy** (`rgba(255,255,255,0.03)`), and the track name text turns **yellow**.
- No icons, no cards, no rounded corners.

### 6.5 Schedule
- Section label: `02 / SCHEDULE` in JetBrains Mono, dimmed.
- **Vertical timeline** layout:
  - Left column: mono **timestamp** (from `event.schedule[].time`), right-aligned.
  - A **thin vertical hairline** connecting all items.
  - A **small square marker** (4×4px, offwhite border) at each event. The currently active item's marker is **filled yellow**.
  - Right column: event **title** (bold) and **description** (regular).
- **Active item detection:** compare the current real time (in IST) against the schedule times on the event date. The currently active item (or the most recently passed one) gets:
  - A yellow-filled square marker.
  - The title text in yellow.
  - A slightly brighter appearance.
- On mobile: the timestamp stacks above the title instead of using two columns.

### 6.6 Prizes
- Section label: `03 / PRIZES` in JetBrains Mono, dimmed.
- **Oversized numerals** `1`, `2`, `3` — massive, in Bricolage Grotesque 800 weight (like 120–200px font size on desktop).
- Prize amounts in **huge JetBrains Mono** below each numeral.
- Arranged in an **uneven staggered layout** — NOT three identical cards in a row. For example:
  - 1st place takes up ~50% width and is taller.
  - 2nd and 3rd are side-by-side below it, or offset.
  - Use CSS grid with varied row/column spans.
- **Special prizes** listed below in a mono row, separated by `|`:
  `[SPECIAL PRIZES]`

### 6.7 Rules
- Section label: `04 / RULES` in JetBrains Mono, dimmed.
- A compact **numbered list** (1–10). Each rule is a short sentence.
- Numbers in JetBrains Mono, rules text in body font.
- Left-aligned with generous left padding. Simple, readable, no decoration beyond the numbers.

### 6.8 Team (organisers)
- Section label: `05 / TEAM` in JetBrains Mono, dimmed.
- A **grid of organiser cards** (3 columns on desktop, 2 on tablet, 1 on mobile).
- Each card:
  - A **square photo placeholder** — grey on navy, no rounded corners (0–2px radius). If no photo URL is provided, show a placeholder with the person's initials.
  - Photos are **grayscale by default**, becoming **full colour on hover** (CSS `filter: grayscale(1)` → `grayscale(0)`).
  - **Name** in Bricolage Grotesque below the photo.
  - **Role** in JetBrains Mono, dimmed.
- **No rounded avatars.** All square.

### 6.9 Sponsors
- Section label: `06 / SPONSORS` in JetBrains Mono, dimmed.
- A clean **row/grid of logo slots** separated by **hairlines** (not cards).
- If sponsors are empty in `event.js`, show placeholder slots with a dashed border and "LOGO" text.
- Below the grid: a `"Become a sponsor →"` mailto link (using `event.sponsorContactEmail`).

### 6.10 FAQs
- Section label: `07 / FAQS` in JetBrains Mono, dimmed.
- A **native accordion.** Each FAQ item:
  - A **hairline separator** between items.
  - The question in Bricolage Grotesque, left-aligned.
  - A `+` / `−` toggle on the right side, in JetBrains Mono.
  - On click, the answer slides open. Only one open at a time (or allow multiple — your call, note the decision).
- 6–8 real questions from `event.faqs`.
- No rounded corners, no cards, no background colour on open items.

### 6.11 Venue
- Section label: `08 / VENUE` in JetBrains Mono, dimmed.
- The **venue name** in large Bricolage Grotesque.
- The **full address** in JetBrains Mono below it.
- A `"Get directions →"` link to `event.mapUrl` (opens in new tab).
- A **simple outlined rectangle** as a map placeholder (1px offwhite border at 20% opacity), with a small **crosshair "+" mark** in the centre acting as a pin. This is purely decorative.

### 6.12 Footer
- A **huge "HACKX" wordmark** in Bricolage Grotesque 800, cropped at the bottom edge of the page (use `overflow: hidden` on the footer and let the text extend below the container's bottom edge, so only the top ~60–70% of the letters are visible).
- Above the wordmark:
  - Social links (Instagram, Discord/WhatsApp) as plain text links with `→` arrows, not icon buttons.
  - Contact email as a mailto link.
  - `event.madeBy` text in JetBrains Mono, dimmed.
- **Easter egg:** clicking the "HACKX" logo in the footer **5 times** briefly flips the entire page colour palette to **inverted** (swap navy ↔ offwhite, keep yellow) for 3 seconds, then reverts. Track clicks with a ref, not state that causes full re-renders. Add a CSS class to `<html>` to trigger it.

---

## 7. Motion & interaction

### 7.1 Section reveals (Framer Motion)
- Each section **fades up 16px** with **opacity 0 → 1** as it enters the viewport.
- Stagger child elements by **60ms**.
- Trigger **once only** — don't re-animate when scrolling back up.
- Use Framer Motion's `whileInView` with `viewport={{ once: true }}`, or use `IntersectionObserver` and pass the state to Framer variants.

### 7.2 Button hover
- On hover, the hard offset shadow **shrinks** (e.g. from `6px 6px` to `2px 2px`) and the button **translates** `3px` down-right — feels like the button is being pressed into the page.
- CSS transition: 150ms ease.

### 7.3 Hero headline
- On page load, the letters of "HACKX 2026" **fade in one by one** with a quick **40ms stagger** per character.
- Nothing flashy — just a subtle entrance. Use Framer Motion `variants` with `transition.delay` per child, or a CSS `@keyframes` with `animation-delay`.
- This fires once on mount, not on scroll.

### 7.4 Custom cursor — `CustomCursor.jsx`
- A small **crosshair** (two 16px perpendicular lines, 1px wide, offwhite) that follows the mouse pointer.
- Hide the native cursor on desktop (`cursor: none` on `body`) and render this component.
- On **touch devices** (detect via `navigator.maxTouchPoints > 0` or `'ontouchstart' in window`): do NOT render the custom cursor and do NOT hide the native cursor.
- Keep it performant — use `requestAnimationFrame` to smooth the position, not direct `mousemove` → state updates.

### 7.5 Smooth scroll
- Clicking any nav link scrolls smoothly to the section with an offset equal to the navbar height so the section heading isn't hidden behind the sticky nav.
- Use `scroll-behavior: smooth` in CSS plus a scroll offset via `scroll-margin-top` on each section.

### 7.6 Banned motion
- No parallax on text or content. No auto-playing carousels. No typing-cursor animation. No infinite bounce/pulse loops (except the canvas nodes which pulse once and stop).

---

## 8. Copy & tone

- Write in a **casual, direct, student voice**. Short sentences. Specific details over hype.
- **Banned words/phrases:** "unleash", "innovate", "elevate", "revolutionize", "cutting-edge", "next-gen", "empower", "journey", "dive in", "seamless".
- Every piece of visible text that isn't structural (section numbers, labels) should sound like a real student wrote it, not a marketing department.

---

## 9. Technical requirements & quality checklist

### Accessibility
- [ ] Semantic HTML: proper heading hierarchy (`h1` only once, `h2` per section, etc.).
- [ ] All `<img>` elements have meaningful `alt` text.
- [ ] All interactive elements have **visible focus states** (a yellow outline or equivalent, not browser default blue).
- [ ] Colour contrast at least **4.5:1** for all text. (offwhite `#F2EFE6` on navy `#0B1F3A` = ~11:1, so the base palette is fine. Ensure dimmed text and small labels also pass.)
- [ ] Keyboard navigation works for the navbar, accordion, and all links/buttons.
- [ ] The accordion uses `<button>` triggers with `aria-expanded`.
- [ ] The mobile menu is keyboard-accessible and traps focus.
- [ ] `prefers-reduced-motion` disables all animation (canvas falls back to static, Framer Motion reveals are instant).

### Meta & SEO
- [ ] `<title>`: "HACKX 2026 — Build Autonomous Agents | [COLLEGE NAME]"
- [ ] `<meta name="description">`: one-sentence summary.
- [ ] Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`.
- [ ] `<html lang="en">`.

### Performance
- [ ] Lighthouse performance score **90+** on the built site.
- [ ] Images are lazy-loaded (`loading="lazy"`).
- [ ] Fonts loaded with `display=swap` to prevent FOIT.
- [ ] Canvas doesn't cause jank — solid 60fps.
- [ ] No unused CSS (Tailwind purge handles this).

### Code quality
- [ ] One component per file. Clean imports.
- [ ] Canvas animation loop is well-commented: explain the grid drawing, agent movement, trail rendering, cursor interaction, and data packet logic.
- [ ] All event data comes from `src/data/event.js`. No hard-coded strings in components (except structural labels like section numbers).
- [ ] `README.md` with: what this is, how to install, how to run dev, how to build, how to customise `event.js`, and any decisions made.

---

## 10. Build phases (work in this order; stop and report after each)

### Phase 1: Foundation
- Init Vite + React in the workspace. Install Tailwind CSS, PostCSS, Autoprefixer, Framer Motion.
- Configure `tailwind.config.js` with the Blueprint palette (navy, offwhite, yellow) and font families.
- Set up `index.html` with Google Fonts links (Bricolage Grotesque 700/800, JetBrains Mono 400/500/700), meta tags, and OG tags.
- Create `src/index.css` with Tailwind directives, custom CSS variables, and base styles (background navy, text offwhite, font-family).
- Create `src/data/event.js` with the full data structure from Section 2.
- Create `src/App.jsx` as a shell that renders a placeholder "HACKX 2026" heading.
- **✅ Checkpoint:** `npm run dev` serves a page with a navy background, offwhite heading in Bricolage Grotesque, and no errors.

### Phase 2: Background canvas
- Build `src/components/Background.jsx` — the full canvas component implementing **every detail** from Section 5: grid, agents with trails, node pulses, cursor interaction, parallax, data packets, performance guards, reduced-motion fallback, and vignette.
- Wire it into `App.jsx` as a fixed full-screen layer behind everything.
- **✅ Checkpoint:**
  - The canvas renders the grid with graph-paper emphasis lines.
  - Yellow agent squares move along grid lines and turn at intersections.
  - Agents leave fading trails.
  - Moving the mouse brightens nearby grid lines.
  - Agents steer away from the cursor.
  - Node pulses happen every 8–12 seconds.
  - Data packets flash every ~6 seconds.
  - The grid shifts slightly on scroll.
  - Tabbing away pauses animation.
  - `prefers-reduced-motion` shows a static grid.
  - 60fps on a mid-range laptop.

### Phase 3: Hero
- Build `Navbar.jsx` (sticky, flat, mobile hamburger → full-screen menu).
- Build `Hero.jsx` (mono label, huge headline with outlined "2026", subhead, dimension line, countdown to `event.startDate`, CTAs).
- Build `CustomCursor.jsx` (crosshair, desktop only).
- Implement the staggered letter-fade hero headline animation.
- Implement smooth scroll with nav offset.
- **✅ Checkpoint:**
  - Navbar is sticky with correct links and yellow Register button.
  - Headline renders huge, left-aligned, with "2026" outlined.
  - Countdown ticks down in mono, shows "HACKING IS LIVE" at zero.
  - Custom crosshair cursor appears on desktop, hidden on touch.
  - Clicking nav links scrolls smoothly to anchor positions.
  - Mobile menu works.

### Phase 4: About + Tracks + Schedule
- Build `About.jsx` (two-column asymmetric, big statement, stats strip).
- Build `Tracks.jsx` (numbered rows with hairlines, hover effects).
- Build `Schedule.jsx` (vertical timeline, active-item detection).
- Add Framer Motion scroll reveals to all three sections.
- **✅ Checkpoint:**
  - About section has asymmetric columns with the stats strip.
  - Tracks render as full-width rows, NOT cards. Hover turns title yellow.
  - Schedule shows a timeline with the correct current-time highlighting.
  - All three sections fade up on scroll.
  - Responsive at 360px.

### Phase 5: Prizes + Rules + Team
- Build `Prizes.jsx` (oversized staggered numerals, special prizes in mono).
- Build `Rules.jsx` (compact numbered list).
- Build `Team.jsx` (square photo grid, grayscale → colour on hover).
- Add scroll reveals.
- **✅ Checkpoint:**
  - Prizes have an asymmetric staggered layout, NOT three identical cards.
  - Rules are a clean numbered list.
  - Team cards have square placeholders with initials, grayscale hover effect.
  - Responsive at 360px.

### Phase 6: Sponsors + FAQs + Venue + Footer
- Build `Sponsors.jsx` (logo slots with hairlines, "Become a sponsor" link).
- Build `Faqs.jsx` (native accordion with +/− toggles, hairline separators).
- Build `Venue.jsx` (address, directions link, outlined map placeholder).
- Build `Footer.jsx` (huge cropped wordmark, social links, easter egg).
- Add scroll reveals.
- Add crosshair "+" marks at section corners (at least 2–3 sections for the effect).
- **✅ Checkpoint:**
  - FAQs accordion opens/closes with +/− toggle.
  - Footer wordmark is cropped at the bottom.
  - Easter egg works (5 clicks → inverted palette for 3 seconds).
  - All focus states are visible and yellow.
  - Tab navigation works through the full page.
  - `npm run build` succeeds with 0 errors.
  - The page looks good at 360px, 768px, 1024px, and 1920px.

---

## 11. Acceptance test (I will run this at the end)

1. `npm install` → `npm run dev` → the site loads with a navy background and yellow agent dots moving on a grid.
2. The grid has graph-paper emphasis lines. Agents move along grid lines and turn at intersections.
3. Moving the mouse brightens nearby grid lines and pushes agents away.
4. The hero headline is huge, left-aligned, "2026" is outlined. Letters fade in on load.
5. The countdown ticks down in a mono row, not in boxes.
6. The navbar is sticky, flat, with a square yellow Register button. Mobile menu works.
7. About section is two-column asymmetric with a stats strip.
8. Tracks are numbered rows (NOT cards) with hover effects — title turns yellow, arrow slides.
9. Schedule is a vertical timeline with real-time active-item highlighting.
10. Prizes use oversized staggered numerals, not three identical cards.
11. FAQs accordion works with +/− toggles.
12. Footer has a huge cropped "HACKX" wordmark. 5 clicks inverts the palette for 3 seconds.
13. Custom crosshair cursor on desktop, hidden on mobile.
14. `prefers-reduced-motion` shows a static grid with no animation.
15. Tab navigation reaches all interactive elements with visible yellow focus rings.
16. The site looks correct at 360px, 768px, and 1920px — no horizontal scroll.
17. `npm run build` succeeds with 0 errors.
18. All visible text comes from `src/data/event.js`. Changing a value there changes the site.

**Start with Phase 1 now.**
