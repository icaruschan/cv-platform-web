# CV Platform — Full Picture Guide
*A complete technical reference for the portfolio generation platform*

---

## 📖 Overview

The **CV Platform** is a full-stack SaaS application that generates personalized portfolio websites from a user's profile brief. A user fills out an onboarding form, pays via Polar, and receives an AI-generated React + Vite portfolio — fully editable in a browser-based code editor. The platform uses three sequential AI agents, a browser-based sandboxed preview, a credit-based revision system, and one-click Vercel deployment.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 14** (App Router, Edge-compatible) |
| Frontend | **React 18 + TypeScript** |
| Styling | **Tailwind CSS** + CSS variables |
| Animation | **Framer Motion 11** |
| Database | **Supabase** (PostgreSQL) |
| AI Model Provider | **OpenRouter** (proxies to Google Gemini) |
| AI Models | `GEMINI_FLASH_MODEL` (fast/cheap) · `GEMINI_PRO_MODEL` (quality) |
| Web Scraping | **Firecrawl** (primary) · **Tavily** (fallback search) |
| Email | **Resend** |
| Payments | **Polar SDK** |
| Deployment Target | **Vercel API** (for generated portfolios) |
| Generated Portfolio Tech | **React + Vite** (NOT Next.js) |

---

## 📁 Project Structure

```
cv-platform-web/
├── src/
│   ├── app/                        # Next.js App Router pages & API routes
│   │   ├── page.tsx                # Landing page
│   │   ├── project/[id]/page.tsx   # Project editor page (server component + token enforcement)
│   │   ├── recover/page.tsx        # Magic link recovery form
│   │   ├── topup-success/page.tsx  # Post-payment success page
│   │   └── api/
│   │       ├── generate/
│   │       │   ├── route.ts        # Entry point: validates, creates project, sends email
│   │       │   └── process/route.ts # Background processor: runs all 3 agents
│   │       ├── project/[id]/
│   │       │   ├── status/route.ts # Polls generation progress
│   │       │   └── files/route.ts  # Retrieves generated files
│   │       ├── chat/route.ts       # AI chat: edits the portfolio with credit consumption
│   │       ├── publish/route.ts    # Deploys files to Vercel
│   │       ├── polish/route.ts     # AI text polisher for onboarding data
│   │       ├── session/route.ts    # Returns session data (credits, premium status)
│   │       ├── topup/route.ts      # Creates Polar checkout for credit purchase
│   │       ├── checkout/route.ts   # Initial portfolio purchase checkout
│   │       ├── magic-link/route.ts # Re-sends access link by email (recovery)
│   │       ├── webhooks/polar/route.ts # Handles payment events from Polar
│   │       └── health/route.ts     # Health check: returns { status: "alive" }
│   ├── components/
│   │   └── editor/
│   │       ├── EditorPage.tsx      # Main client component orchestrating editor state
│   │       ├── EditorLayout.tsx    # Shell layout: sidebar + canvas + header
│   │       ├── ChatSidebar.tsx     # AI chat panel (left sidebar)
│   │       ├── SimplePreview.tsx   # Sandboxed iframe renderer for the portfolio
│   │       ├── CodeView.tsx        # Code viewer (raw file display)
│   │       ├── CanvasArea.tsx      # Canvas wrapper
│   │       ├── PreviewToolbar.tsx  # Device switcher & preview controls
│   │       ├── WaitingRoom.tsx     # Generation progress animations
│   │       ├── TopUpModal.tsx      # Credits exhausted → buy more modal
│   │       └── ProcessFeed.tsx     # Chat message types: thought, action, ai_message, etc.
│   └── lib/
│       ├── types.ts                # Shared TypeScript interfaces (Brief, Moodboard, etc.)
│       ├── session.ts              # Session CRUD: create, get, useEditCredit, upgradeSession
│       ├── supabase.ts             # Supabase client (uses ANON key for general queries)
│       ├── visual-editing.ts       # Inject visual editing hook into generated React files
│       ├── helpers/
│       │   └── brief-parser.ts     # Helpers: getProfileImageUrl, getSocialLinks, formatProjects
│       └── agents/
│           ├── inspiration.ts      # Agent 1: Scrape web → extract visual moodboard
│           ├── spec.ts             # Agent 2: Moodboard → STYLE_GUIDE + SECTION_SPECS docs
│           ├── builder.ts          # Agent 3: Specs + Brief → React component files
│           ├── system-prompts.ts   # Shared: MOTION_SYSTEM_PROMPT, TECHNICAL_CONSTRAINTS_PROMPT
│           └── vibes.ts            # ⚠️ DEAD CODE — orphaned, not used anywhere
├── portfoli-onboarding/            # Separate React+Vite app (the onboarding form)
│   ├── App.tsx                     # Multi-step form with image upload + AI polish + submit
│   └── ...
└── .env.local                      # Environment variables (see full list below)
```

---

## 🗄️ Supabase Database Schema

### `projects`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | text | User's email |
| `status` | text | `draft` · `inspiration` · `specs` · `building` · `saving` · `ready` · `error` · `published` |
| `vibe` | jsonb | Stored `Moodboard` object after Agent 1 completes |
| `domain` | text | Live URL after publishing |
| `magic_token` | text | UUID for magic link recovery |
| `updated_at` | timestamptz | Last update time |

### `files`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `project_id` | UUID | FK → `projects.id` |
| `path` | text | File path (e.g. `src/App.tsx`) |
| `content` | text | Full file content |
| `updated_at` | timestamptz | Last update time |

### `sessions`
| Column | Type | Description |
|---|---|---|
| `token` | UUID | Session auth token (used as the magic link key) |
| `project_id` | UUID | FK → `projects.id` |
| `edits_remaining` | int | Credits left (starts at 5 free) |
| `is_premium` | boolean | Unlimited edits flag |
| `expires_at` | timestamptz | Session TTL (24 hours) |

### `used_checkouts`
Tracks already-processed Polar checkout IDs to prevent duplicate free-tier orders.

---

## 🔄 End-to-End User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ONBOARDING FLOW                                   │
│                                                                             │
│  User visits Landing Page                                                   │
│       ↓                                                                     │
│  Clicks "Get Started" → /api/checkout?products=POLAR_PRODUCT_ID             │
│       ↓                                                                     │
│  Redirected to Polar payment page                                           │
│       ↓                                                                     │
│  Payment succeeds → redirect to portfoli-onboarding/?checkout_id={ID}       │
│       ↓                                                                     │
│  Multi-step onboarding form (React+Vite app):                               │
│    Step 1: Personal info (name, role, tagline, bio)                         │
│    Step 2: Upload profile photo                                              │
│    Step 3: Work experience + project links                                  │
│    Step 4: Social links (Twitter, LinkedIn, GitHub)                         │
│    Step 5: Style vibe (text description of desired aesthetic)               │
│       ↓                                                                     │
│  On submit:                                                                 │
│    1. Upload profile image → storage bucket                                 │
│    2. Map form data → Brief object                                          │
│    3. POST /api/polish → AI polishes bio + tagline text                    │
│    4. POST /api/generate { brief, checkout_id }                             │
│       ↓                                                                     │
│  /api/generate:                                                             │
│    - Validates checkout_id with Polar (prevents duplicate free orders)      │
│    - Creates project row in Supabase (status: "draft")                      │
│    - Creates session (5 free credits, 24h TTL)                              │
│    - Constructs magicLink = /project/{id}?token={token}                    │
│    - Sends email via Resend with the magic link                             │
│    - Fires background request to /api/generate/process (detached)          │
│    - Returns { magicLink, sessionToken } immediately                        │
│       ↓                                                                     │
│  Onboarding shows magic link / redirects user to editor                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        GENERATION PIPELINE                                  │
│                  (runs in /api/generate/process)                            │
│                                                                             │
│  Project status: "inspiration"                                              │
│  AGENT 1: Inspiration Agent (inspiration.ts)                                │
│    - Parses brief.style.vibe (user's aesthetic description)                 │
│    - Identifies target sites: Framer, Webflow, Behance, Dribbble, etc.     │
│    - Firecrawl scrapes those sites (branding format → colors, fonts, etc.)  │
│    - Tavily used as fallback if Firecrawl fails                             │
│    - Gemini Vision analyzes screenshots                                     │
│    - Output: Moodboard object (colors, typography, motion profile, UI)      │
│    - Saved to projects.vibe in Supabase                                     │
│       ↓                                                                     │
│  Project status: "specs"                                                    │
│  AGENT 2: Spec Agent (spec.ts)                                              │
│    - Uses GEMINI_FLASH_MODEL                                                │
│    - Maps moodboard fonts to valid Google Fonts (with fallback table)       │
│    - Generates STYLE_GUIDE.md (CSS variables, typography, motion physics)   │
│    - Determines sections based on role (hero, about, projects, skills, CTA) │
│    - Generates PROJECT_REQUIREMENTS.md + SECTION_SPECS.md                  │
│    - Output: Array of { path, content } doc files                           │
│       ↓                                                                     │
│  Project status: "building"                                                 │
│  AGENT 3: Builder Agent (builder.ts)                                        │
│    - Uses GEMINI_PRO_MODEL (highest quality)                                │
│    - Takes Brief + Moodboard + all spec docs                                │
│    - Generates complete React+Vite portfolio:                               │
│        src/main.tsx, src/App.tsx, src/index.css                             │
│        tailwind.config.ts                                                   │
│        src/components/Hero.tsx + About.tsx + Projects.tsx                   │
│        src/components/Skills.tsx + Contact.tsx                              │
│    - ENFORCES: Phosphor Icons only (never lucide), no Next.js imports       │
│    - ENFORCES: First-person voice (bio conversion from 3rd person)          │
│    - ENFORCES: Mandatory elements (profile image, project visuals, CTA)     │
│    - Self-healing: detectErrors() → autoFixErrors() on first generation     │
│    - validateAndFix() as final cleanup pass                                 │
│       ↓                                                                     │
│  Project status: "saving"                                                   │
│    - All spec docs + generated code files → Supabase files table           │
│       ↓                                                                     │
│  Project status: "ready"                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           EDITOR FLOW                                       │
│                                                                             │
│  User opens /project/{id}?token={token}                                     │
│  Server component fetches project + files from Supabase                     │
│       ↓                                                                     │
│  EditorPage (client) mounts with:                                           │
│    - Files → formatted into Sandpack-compatible Record<path, content>       │
│    - Missing entry files auto-injected (vite.config.ts, index.html,        │
│      src/main.tsx, src/App.tsx, src/index.css)                              │
│    - injectVisualEditing() patches src/App.tsx with useVisualEditing hook   │
│       ↓                                                                     │
│  If project.status !== "ready" (still generating):                          │
│    - Polls /api/project/{id}/status every 3 seconds                         │
│    - Shows WaitingRoom with animated progress bar                           │
│    - When status = "ready", fetches files and transitions to editor         │
│       ↓                                                                     │
│  EditorLayout renders 3-panel layout:                                       │
│    LEFT:   ChatSidebar (AI chat + thought feed)                             │
│    CENTER: SimplePreview (sandboxed iframe)                                 │
│    TOOLBAR: Publish button, device switcher, code view toggle               │
│       ↓                                                                     │
│  Session fetched via /api/session?token={token}                             │
│    - Re-fetches on window.focus (picks up credits added after top-up)       │
│    - editsRemaining shown in header                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ SimplePreview — The Sandboxed Renderer

`SimplePreview.tsx` is the most complex component. It doesn't use Sandpack directly for rendering — instead it builds a **complete self-contained HTML document** that:

1. Loads **React 18 + ReactDOM via CDN**
2. Loads **Babel Standalone** (transpiles TSX at runtime in-browser)
3. Loads **Tailwind CSS CDN** + a fallback config
4. Loads **Framer Motion via CDN** (`window.Motion`)
5. Loads **Phosphor Icons** (CSS icon font via `<link>`)
6. Extracts `src/index.css` and injects as `<style>`
7. Detects Google Fonts used in CSS and dynamically loads them
8. Concatenates all component files + cleans import statements
9. Creates a **proxy sandbox** using `new Proxy(window)` to trap all undefined imports (unknown icon components return `IconStub` instead of crashing)
10. Executes the cleaned/compiled code via `new Function('sandbox', 'with(sandbox) {...}')`
11. Renders the React app into `<div id="root">`
12. Initialises **Visual Editing** (element hover + click → postMessage back to parent)

This approach allows the platform to preview a React site without a build server, working entirely client-side.

### Visual Editing
When the user toggles "Visual edits" mode:
- Parent frame sends `VISUAL_EDITING_TOGGLE: { enabled: true }` via `postMessage`
- iframe listens and enables click/hover handlers
- Clicking an element sends `ELEMENT_SELECTED` back to parent with `{ tag, id, className, textContent, selectorPath }`
- EditorPage stores this as `selectedElement` state
- ChatSidebar appends element context to the next AI message automatically

---

## 💬 Chat / AI Revision Flow

```
User types message (with optional visual selection context)
  ↓
POST /api/chat {
  projectId,
  messages: [...history],
  currentFiles: sandpackFiles,     ← current file state from SimplePreview
  selectionContext: { tag, id, ... },
  sessionToken: token
}
  ↓
/api/chat:
  1. Validate sessionToken via getSession()
  2. Call useEditCredit() — decrements edits_remaining by 1
     → Returns false if credits = 0 → sends 403 LIMIT_REACHED
  3. Fetch current files from Supabase (authoritative source)
  4. Build context message with ALL current file contents + user message
  5. POST to Gemini Pro via OpenRouter
  6. Parse AI response for file changes: ### FILE: path → content
  7. Re-validate changed files with detectErrors()
  8. If errors → second AI call with error context (self-healing)
  9. Persist changed files to Supabase files table
  10. Return { response, files: {path: content}, thoughtSteps, filesChanged }
  ↓
EditorPage receives updated files
  → Updates sandpackFiles state (causes SimplePreview re-render)
  → Re-applies injectVisualEditing() on updated files
  → Optimistically decrements editsRemaining display
```

---

## 💳 Credits & Payment System

### Initial Portfolio Purchase
- User hits `/api/checkout?products=POLAR_PRODUCT_ID`
- Polar creates a checkout session → redirects to Polar hosted page
- On success → Polar sends webhook to `/api/webhooks/polar`
- `order.created` event → records checkout in `used_checkouts` table
- `/api/generate` validates the `checkout_id` against `used_checkouts` to prevent replay

### Free Credits
- Every user gets **5 free revision edits** on signup (set in `createSession`)
- Credits stored in `sessions.edits_remaining`
- Decremented by `useEditCredit()` on every `/api/chat` call
- Premium sessions (`is_premium: true`) skip credit checks entirely

### Top-Up Purchase
```
User clicks "Buy More Credits" in TopUpModal
  ↓
Redirects to /api/topup?token={sessionToken}
  ↓ 
Polar checkout created with successUrl pointing to /topup-success
  ↓
Polar sends webhook: order.created with product_id = POLAR_TOPUP_PRODUCT_ID
  ↓
/api/webhooks/polar:
  - Matches order.customer.email → finds session
  - Adds 5 credits: edits_remaining += 5
  ↓
/topup-success:
  - Shows "5 credits added" confirmation
  - Countdown timer (5s) → redirects back to /project/{id}?token={token}
  ↓
EditorPage window.focus event fires → re-fetches /api/session → shows new credit count
```

---

## 🚀 Publish Flow

```
User clicks "Publish" in EditorLayout header
  ↓
POST /api/publish { projectId, slug? }
  ↓
1. Fetch project details from Supabase
2. Fetch ALL files for this project from Supabase
3. Build Vercel file payload: { file: path, data: content }
4. Set project name: cv-{projectId[0:8]} or sanitized custom slug
5. POST to Vercel API v13/deployments:
   {
     name: projectName,
     files: vercelFiles,
     target: 'production'      ← No framework set; raw static deploy (correct for Vite output)
   }
6. Update project: status='published', domain=deployData.url
7. Return { url, deploymentId, dashboardUrl }
  ↓
EditorPage shows alert with live URL + adds "Site Published!" message to chat feed
```

---

## 🤖 Agent Deep Dive

### Agent 1: Inspiration (`inspiration.ts`)
**Purpose:** Gather real visual inspiration from the web to create a `Moodboard` object

**Process:**
1. Parse `brief.style.vibe` string — extract keywords and target site styles
2. Build a list of target URLs based on vibe (e.g. Framer Gallery, Dribbble, design agencies)
3. **Firecrawl `branding` format**: Scrapes sites to extract colors, fonts, spacing, components
4. **Fallback**: If Firecrawl fails, uses Tavily to search for inspiration images/sites
5. Gemini Vision processes screenshots to extract visual characteristics
6. Synthesizes everything into a `Moodboard` with:
   - `color_palette` (primary, secondary, accent, background, surface, text)
   - `typography` (heading_font, body_font, mono_font)
   - `ui_patterns` (card_style, button_style, layout_structure)
   - `motion` (profile: `STUDIO` | `TECH` | `BOLD`)
   - `visual_direction` (text description)
   - `personality` (tone, energy, targetAudience)

> ⚠️ **Note:** `vibes.ts` is completely dead code — it was an old pre-defined vibe library that was never connected to the live pipeline.

### Agent 2: Spec (`spec.ts`)
**Purpose:** Transform moodboard data into actionable design documents for the builder

**Process:**
1. Map all moodboard fonts to valid **Google Fonts** using a lookup table + AI fallback
2. AI generates `STYLE_GUIDE.md` with CSS variables, color palette, typography
3. Determine sections from the brief (`determineSections()`):
   - Always: `hero`, `about`, `contact`
   - If `brief.work.length > 0`: `projects`  
   - If tech role detected: `skills`
4. Single LLM call generates `PROJECT_REQUIREMENTS.md` + `SECTION_SPECS.md`
5. Parse the `---FILE: path---` delimiters in the response into separate files

**Mandatory requirements enforced in prompts:**
- Profile image must appear in Hero or About
- Projects must have visual elements (not text-only)
- Contact must have a working `mailto:` CTA button
- WCAG 2.1 AA color contrast

### Agent 3: Builder (`builder.ts`)
**Purpose:** Generate the actual React + Vite portfolio source code

**Process:**
1. Reads all spec docs (STYLE_GUIDE, REQUIREMENTS, SECTION_SPECS)
2. Uses `brief-parser` helpers to extract profile image URL, social links, projects
3. Builds a detailed system prompt enforcing:
   - **Phosphor Icons only** (never lucide-react)
   - **No Next.js** (Vite project)
   - Motion profile physics (STUDIO=70/20, TECH=150/15, BOLD=300/20)
   - Data integrity — only use provided brief data
   - First-person voice for bio text
4. Single large LLM call → parses `### FILE: path` markers
5. **`detectErrors()`** — static analysis for:
   - Next.js imports
   - Missing React hook imports
   - Missing framer-motion imports
   - Missing Phosphor Icon imports
   - Malformed destructuring
   - Empty function calls / default exports
   - Truncated code detection
   - CSS property/variable name errors
6. **`autoFixErrors()`** — applies fixable errors automatically
7. **`validateAndFix()`** — legacy cleanup pass
8. Falls back to a minimal hardcoded site if LLM call fails

---

## 🔑 Environment Variables

```env
# AI
OPENROUTER_API_KEY=         # Routes to Google Gemini
GEMINI_FLASH_MODEL=         # e.g. google/gemini-3-flash-preview (Spec Agent)
GEMINI_PRO_MODEL=           # e.g. google/gemini-3-pro-preview (Builder + Chat agents)

# Database
SUPABASE_URL=
SUPABASE_ANON_KEY=          # Used in supabase.ts for general queries
SUPABASE_SERVICE_ROLE_KEY=  # Used by Polar webhook route (bypasses RLS for credit writes)

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=          # e.g. noreply@yourdomain.com

# Payments
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=       # For verifying webhook signatures
NEXT_PUBLIC_POLAR_TOPUP_PRODUCT_ID=  # Product ID for the credit top-up
NEXT_PUBLIC_POLAR_PRODUCT_ID=        # Product ID for the main portfolio purchase

# Deployment
VERCEL_API_TOKEN=           # Vercel API token for publishing (also supports VERCEL_TOKEN fallback)
VERCEL_TEAM_ID=             # Optional — for team deployments

# URLs
NEXT_PUBLIC_APP_URL=        # ⭐ Primary production URL — used for magic links, topup redirects, referer
NEXT_PUBLIC_BASE_URL=       # Backward-compatible fallback for NEXT_PUBLIC_APP_URL
ONBOARDING_ORIGIN=          # URL of the portfoli-onboarding Vite app

# Security
INTERNAL_API_SECRET=        # Shared secret for /api/generate/process internal calls

# Web Scraping
FIRECRAWL_API_KEY=
TAVILY_API_KEY=
```

---

## 🐛 Known Bugs & Issues (Audit Log)

| # | File | Status | Description |
|---|---|---|---|
| 1 | `project/[id]/page.tsx` | ✅ Fixed | **Security:** Token enforcement now active. Session token validated against DB; missing/invalid tokens show an error page with a link to `/recover`. |
| 2 | `api/publish/route.ts` | ✅ Fixed | **Env var:** Now reads `VERCEL_API_TOKEN` with `VERCEL_TOKEN` as a fallback. |
| 3 | `api/publish/route.ts` | ✅ Fixed | **Framework:** Removed `framework: 'nextjs'`. Vercel now treats the deploy as raw static files (correct for Vite output). |
| 4 | `api/topup/route.ts` | ✅ Fixed | **Base URL:** Now uses `NEXT_PUBLIC_APP_URL` → `NEXT_PUBLIC_BASE_URL` → localhost chain with a guard against invalid URLs. |
| 5 | `api/magic-link/route.ts` | ✅ Fixed | **Implemented:** Full magic link re-send endpoint. Looks up email → finds session → sends styled email via Resend. Recovery page at `/recover`. |
| 6 | `api/webhooks/polar/route.ts` | ✅ Fixed | **Supabase key:** Switched to `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for credit writes. |
| 7 | `lib/agents/vibes.ts` | ⚪ Pending | **Dead code:** The entire `vibes.ts` file is unused. Safe to delete. |
| 8 | `EditorPage.tsx` | ✅ Fixed | **Upgrade URL:** `onUpgrade` now calls `/api/topup?token=...` (credit top-up) instead of `/api/checkout` (main product). |

---

## 🔐 Session & Magic Link Recovery

- When the user completes the onboarding, they receive a **magic link** by email: `/project/{projectId}?token={sessionToken}`
- The `token` is a UUID stored in the `sessions` table
- It is NOT stored in any cookie or localStorage — the URL IS the session
- **Session expiry:** 24 hours (hard-coded in `createSession`)
- **If the user closes the tab:** They must use the original email link
- **If the email is lost:** User visits `/recover`, enters their email, and `POST /api/magic-link` sends a fresh access link

### Recovery Flow
```
User loses email or link expires
  → Visits /project/{id} without token → sees "Access Required" error page
  → Clicks "Lost your link? Request a new one →"
  → Taken to /recover
  → Enters their email → clicks "Send Access Link"
  → POST /api/magic-link:
      1. Looks up most recent project by email
      2. Finds the active session for that project
      3. Builds magic link: /project/{id}?token={token}
      4. Sends styled email via Resend
      5. Returns generic success (prevents email enumeration)
  → User receives email → clicks "Open My Portfolio →" → back in editor ✅
```

---

## 📊 Status Machine for Project Generation

```
draft
  → inspiration   (Agent 1 starts)
  → specs         (Agent 2 starts)
  → building      (Agent 3 starts)
  → saving        (Files being inserted to Supabase)
  → ready         (The portfolio is accessible in the editor)
  → error         (Something failed along the way)
  → published     (Deployed to Vercel)
```

The `WaitingRoom.tsx` component maps these statuses to user-friendly progress messages and animated progress bars (0% → 100%).

---

## 🔧 Production Deployment Checklist

Before going live, the following MUST be done:

1. **[x] Fix `VERCEL_TOKEN` env var name** — Now reads `VERCEL_API_TOKEN || VERCEL_TOKEN`
2. **[x] Fix framework mismatch** — Removed `framework: 'nextjs'`, deploys as raw static files
3. **[x] Fix base URL for topup redirects** — Now uses `NEXT_PUBLIC_APP_URL` with fallback chain
4. **[x] Enable token enforcement** — Session token validated against DB on project page load
5. **[x] Update Polar webhook key** — Now uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
6. **[x] Fix upgrade URL** — `onUpgrade` now correctly calls `/api/topup` instead of `/api/checkout`
7. **[x] Implement `/api/magic-link`** — Full re-send endpoint + `/recover` page
8. **[ ] Set `NEXT_PUBLIC_APP_URL`** in production env vars to the live domain
9. **[ ] Set `VERCEL_API_TOKEN`** in production env vars (Vercel API token with deploy rights)
10. **[ ] Set `SUPABASE_SERVICE_ROLE_KEY`** in production env vars
11. **[ ] Swap Polar sandbox → production:** Automatic via `process.env.NODE_ENV` — verify it's set to `production`
12. **[ ] Delete `vibes.ts`** (dead code cleanup)

---

## 🧩 Key Data Interfaces

```typescript
// The raw user input — collected from the onboarding form
interface Brief {
    id: string;                          // Job ID
    personal: {
        name: string;
        role: string;
        tagline: string;
        bio: string;
        location?: string;
        avatar_url?: string;
        email?: string;
    };
    socials: Record<string, string>;     // { "twitter": "...", "linkedin": "..." }
    work: Array<{
        title: string;
        role: string;
        description: string;
        link?: string;
        impact?: string;
    }>;
    style: {
        vibe: string;                    // Free-text aesthetic description
        likes?: string[];
        dislikes?: string[];
    };
}

// The output of Agent 1 (Inspiration Agent)
interface Moodboard {
    visual_direction: string;
    color_palette: { primary, secondary, accent, background, surface, text: string };
    typography: { heading_font, body_font, mono_font: string };
    ui_patterns: { card_style, button_style, layout_structure: string };
    motion: { profile: 'STUDIO' | 'TECH' | 'BOLD'; description: string };
    // Extended from Firecrawl branding
    spacing?: Record<string, string>;
    animations?: { name: string; value: string }[];
    personality?: { tone, energy, targetAudience, description?: string };
}

// User session (auth + credits)
interface Session {
    token: string;
    project_id: string;
    edits_remaining: number;
    is_premium: boolean;
    expires_at: string;
}
```

---

## 🎨 Motion System

Three motion profiles are supported, determined by the AI in Agent 1:

| Profile | Physics | Use Case |
|---|---|---|
| `STUDIO` | stiffness: 70, damping: 20 (fluid, elegant) | Creatives, designers, artists |
| `TECH` | stiffness: 150, damping: 15 (snappy, precise) | Developers, engineers, startups |
| `BOLD` | stiffness: 300, damping: 20 (explosive, energetic) | Bold brands, agencies, high-impact |

All Framer Motion animations use `type: "spring"` — no linear `duration` animations.

---

*This guide was generated from a deep audit of the cv-platform-web codebase. Last updated: 2026-02-24 — reflects all bug fixes applied and the new magic-link recovery system.*
