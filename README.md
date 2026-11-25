# ForgeLeague — Procedural Sports Team, League, Cup & Custom Sport Studio

**ForgeLeague** is a full-featured, cloud-ready web application for generating unique sports franchises, pure-vector SVG crests, custom sports, dated league calendars, knockout brackets, preseasons, and rule-based simulation engines—built with **zero external raster image files**.

---

## Core Features

- **Procedural SVG Logo Engine (Zero Raster Images)**
  - **32 Shield & Crest Silhouettes**, **24 Clipped Field Patterns**, **136 Multi-Path Vector Mascot & Sport Icons** across 5 categories, **8 Framing Accents**, **6 Banner/Monogram Styles**, and **72 Coordinated 3-Color Palettes** with automatic WCAG relative-luminance contrast.
  - Export any crest cleanly as **SVG** or high-resolution **PNG** (offscreen canvas rasterization).
- **Strict Zero-Duplicate Global Registry & 10-Char Base36 Seeds**
  - Every generated logo receives a canonical `Logo DNA` fingerprint.
  - Persistent Global Registry prevents duplicate Logo DNAs and Team Names across sessions via an automatic collision re-roll loop, and enforces competition-level uniqueness (no shared mascot icon, city, or primary color scheme within any league or cup).
  - Compact **10-character uppercase Base36 seeds** (e.g., `K9X4M2P8Q1`) deterministically reproduce the exact logo, colors, team details, and roster.
- **Multi-Sport Engine (8 Built-In Sports) + Custom Sport Creator**
  - Built-in presets for **Soccer**, **Basketball**, **American Football**, **Baseball**, **Ice Hockey**, **Volleyball**, **Rugby Union**, and **Esports (5v5 Tactical/MOBA)**.
  - Custom Sport Designer lets you customize terminology, periods, roster sizes, active lineup counts, custom positions, scoring plays & probability weights, stat columns, champion/tiebreaker criteria, and default break weeks.
- **Deep Competition Wizard, Preseason & Conditional Rule Advantages**
  - Supports **3 to 64 teams** across **Single Round-Robin**, **Double Round-Robin**, **Group Stage + Knockout**, **Single-Elimination Cup**, and **Double-Elimination Cup** (with automatic BYE handling).
  - Dated calendar engine with Start/End date controls, allowed days of the week, pacing (`Games per Week` or `Min Rest Days`), and **Custom Team Break / Bye Weeks**.
  - Optional **Preseason & Exhibition** stage with isolated preseason standings/stats.
  - **If/Then Rule & Advantage Builder** for preseason carryover bonuses, win-streak rating boosts, margin-of-victory bonus points, and top-seed home bonuses.
- **Cloud Auth, Shareable Links, Community Hub & Granular Permissions**
  - Supports **Email/Password**, **Google OAuth**, **Phone SMS OTP**, **Magic Link**, account linking, and a local guest fallback mode.
  - Generate random short links (`#/l/x9k2m7p4`) or custom vanity URLs (`#/l/friday-night-premier`, `#/sport/hyperball-2026`) with **Private**, **Unlisted**, or **Public** visibility.
  - Browse the **Community Hub** and **Import / Clone** shared Custom Sports to your personal library.
  - **Granular Collaborator Permission Matrix** (`canView`, `canSimulateMatches`, `canSimulateSeason`, `canUndoSimulations`, `canEditTeamsAndRosters`, `canEditScheduleAndDates`, `canEditRulesAndAdvantages`, `canManageCollaborators`) with role presets (`Viewer`, `Sim Operator`, `Co-Commissioner`, `Full Admin`).
- **Simulation Undo & 20-State Snapshot History**
  - Automatically records a deep state snapshot before every match, round, preseason, or batch simulation.
  - One-click **Undo Sim** and **Restore Checkpoint** history stack (up to 20 rolling states) plus confirmation prompts for batch simulations.

---

## Repository Structure

```text
├── .github/workflows/
│   ├── ci.yml                 # Lint, Vitest, TypeScript & Vite build CI check
│   └── deploy.yml             # Automated GitHub Pages deployment
├── public/
│   └── favicon.svg            # Pure SVG vector favicon
├── supabase/
│   └── schema.sql             # PostgreSQL tables & Row-Level Security policies
├── src/
│   ├── __tests__/             # Vitest unit & integration test suite
│   ├── components/
│   │   ├── Auth/              # Multi-provider Sign-In & Account Linking modal
│   │   ├── Community/         # Public Hub & 1-click Custom Sport Cloner
│   │   ├── Competitions/      # Wizard, LeagueView, CupBracketView, HistoryBar
│   │   ├── Layout/            # Header with Sport Switcher, Registry & Account pill
│   │   ├── Registry/          # Global Registry ledger & JSON import/export
│   │   ├── Sharing/           # Shareable Link & Granular Permission Matrix modal
│   │   ├── Sports/            # 8-Sport Library & Custom Sport Creator
│   │   ├── TeamStudio/        # Crest Builder, Identity Editor & Roster Editor
│   │   └── Vault/             # Persistent "My Teams" Franchise Vault
│   ├── context/               # AppContext state, cloud sync & hash link routing
│   ├── engine/
│   │   ├── generator/         # Pools, Roster Generator & Team Generator
│   │   ├── registry/          # Zero-Duplicate Global Registry
│   │   ├── simulation/        # League, Cup, Preseason, Advantages, Scheduler, Undo History
│   │   ├── sports/            # 8 Built-In Sports, Custom Registry & SVG Jerseys
│   │   ├── storage/           # localStorage persistence & JSON bundle validation
│   │   └── svg-logo/          # 32 Shields, 24 Patterns, 136 Icons, 72 Palettes
│   ├── lib/auth-db/           # Env config, Auth service, Permissions & Share URLs
│   └── types/                 # Shared TypeScript interfaces
├── .env.example               # Environment variable template (no real secrets)
├── .gitignore
├── eslint.config.js
└── vite.config.ts
```

---

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   By default, `VITE_BACKEND_PROVIDER=local` runs cleanly with zero external setup using `localStorage` guest/demo sync. To connect a live cloud backend, populate your Supabase or Firebase credentials in `.env` (never commit `.env`).

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Run verification checks**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

---

## Backend Setup Guide (Supabase or Firebase)

### Option A: Supabase (Recommended)
1. Create a new project at [supabase.com](https://supabase.com).
2. In **Authentication → Providers**, enable:
   - **Email** (supports Email/Password and Magic Link OTP).
   - **Google** (configure Google Cloud OAuth Client ID & Secret + Authorized Redirect URI).
   - **Phone** (configure Twilio/MessageBird SMS provider for Phone OTP).
3. Open **SQL Editor** and run the entire script in [`supabase/schema.sql`](supabase/schema.sql). This creates:
   - `profiles`, `franchises`, `custom_sports`, `competitions`, `collaborators`, and `global_registries` tables.
   - `public.has_collaborator_permission(...)` helper and Row-Level Security (RLS) policies enforcing `owner_id`, `visibility` (`private`/`unlisted`/`public`), and all 8 granular collaborator checkboxes.
4. Copy your **Project URL** and **anon public key** from **Project Settings → API** into `.env`:
   ```env
   VITE_BACKEND_PROVIDER=supabase
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Option B: Firebase
1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. In **Authentication → Sign-in method**, enable **Email/Password** (including Email link / passwordless), **Google**, and **Phone**.
3. Create a **Cloud Firestore** database with collections `users/{uid}/franchises`, `competitions`, `customSports`, and `globalRegistry`, and mirror the permission rules checking `request.auth.uid == resource.data.ownerId` or `resource.data.sharing.collaborators` permissions.
4. Add your Firebase Web App config keys to `.env` with `VITE_BACKEND_PROVIDER=firebase`.

---

## Deployment Instructions

### GitHub Pages (Automated)
1. Push this repository to GitHub (`main` branch).
2. In your GitHub repo, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Add any optional `VITE_*` secrets under **Settings → Secrets and variables → Actions** if deploying with live cloud auth.
4. `.github/workflows/deploy.yml` builds `./dist` and publishes automatically on every push to `main`.

### Vercel or Netlify (One-Click)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Copy keys from `.env.example` into your Vercel/Netlify project settings.
