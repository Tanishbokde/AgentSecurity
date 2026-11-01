# Agent Guard (AgentShield) - Enterprise Security Frontend

A high-performance, pixel-accurate security operations console and authentication interface built for **Agent Guard** (AgentShield), integrating the live AgentShield FastAPI backend.

---

## 🚀 Live Backend & CORS Configuration
- **Backend API Base URL:** `https://agent-security-4.onrender.com`
- **Prefix:** Versioned endpoints use `/api/v1`, while `/health` is unversioned.
- **Cross-Origin Resource Sharing (CORS) & Seamless Proxy:**
  - In local development (`npm run dev`), the API client automatically routes through Vite's local dev server proxy (`/api` and `/health`). Because all requests are same-origin to the browser, **all CORS restrictions are eliminated** regardless of whether you access via `localhost:5173`, `127.0.0.1:5173`, or any dynamically assigned port.
  - Vite's server proxy forwards requests server-to-server to `https://agent-security-4.onrender.com` with `changeOrigin: true`.
  - The API client includes transparent automatic fallback: if a cross-origin direct call encounters a network or CORS block, it automatically falls back to the same-origin proxy, ensuring uninterrupted operation across all pages.
  - In production builds (`npm run build`), the client connects to `VITE_API_BASE_URL` (defaults to `https://agent-security-4.onrender.com`).

---

## 🛠️ Tech Stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (agent guard dark theme, custom gradients, glowing focus states)
- **Icons:** Lucide React (`mail`, `lock`, `eye`, `eye-off`, `shield`, `swords`, `terminal`, `trophy`, `layers`, `history`) + custom inline SVG gradient logo
- **Form State & Validation:** React Hook Form + Zod (`@hookform/resolvers`)
- **Routing:** React Router v7 (`/`, `/login`, `/register`, `/dashboard`, `/runs`, `/runs/:id`, `/evaluations`, `/arena`, `/campaign`, `/guardian`, `/benchmarks`, `/replay/:runId`, `/privacy`, `/terms`)
- **Typography:** Inter (via Google Fonts)

---

## 📦 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# .env
VITE_API_BASE_URL=https://agent-security-4.onrender.com
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🗺️ Page Architecture & Live API Integration

| Route | Page Component | Live API Endpoints Integrated | Description |
|---|---|---|---|
| `/login` | `LoginPage.tsx` / `LoginCard.tsx` | `POST /api/v1/auth/login` | Email & password authentication, session expiration warnings, remember-me persistence. |
| `/register` | `RegisterPage.tsx` | `POST /api/v1/auth/register`, `POST /api/v1/auth/login` | Account creation with 12-128 character password constraints, direct transition to dashboard. |
| `/dashboard` | `DashboardPage.tsx` | `GET /health`, `GET /api/v1/runs`, `GET /api/v1/autonomy/guardian`, `GET /api/v1/benchmarks/scoreboard` | KPI metric aggregations (total runs, blocked vs executed actions, block rate, unauthorized effects), guardian enclave status, scoreboard trend chart, recent runs table, and quick actions. |
| `/runs` | `RunsListPage.tsx` | `GET /api/v1/runs?limit=...` | Historical runs table with client-side scenario & status search/filter, configurable pagination limit (1-100), and links to run detail & replay. |
| `/runs/:id` | `RunDetailPage.tsx` | `GET /api/v1/runs/{run_id}` | Detailed trace metadata, safe plain-text rendering of red team prompt and target response, metrics cards, and actions telemetry with risk badges and collapsible JSON payloads. |
| `/evaluations` | `EvaluationsPage.tsx` | `POST /api/v1/evaluations/run` | Rotating scenario evaluation runner (safe file read, prompt injection, invoice workflow, mixed) with 1-10 rounds, cancel support (`AbortController`), summary cards, and returned runs list. |
| `/arena` | `ArenaPage.tsx` | `POST /api/v1/arena/run`, `GET /api/v1/arena/history` | Multi-family adversarial attack rounds with train/held-out splits, per-round case cards, verdicts, and historical sessions tab. |
| `/campaign` | `CampaignPage.tsx` | `POST /api/v1/autonomy/campaign`, `GET /api/v1/autonomy/history` | Autonomous multi-round campaign with 7 core metric cards per round, prominent advisory notes display, expandable case list, and history tab. |
| `/guardian` | `GuardianPage.tsx` | `GET /api/v1/autonomy/guardian` | Live zero-trust policy engine status: mode, allow-list integrity flags, held-out learning toggle, active policy rules, and searchable deny indicator list. |
| `/benchmarks` | `BenchmarksPage.tsx` | `POST /api/v1/benchmarks/run`, `GET /api/v1/benchmarks/scoreboard` | Standardized benchmarks runner, "Your Results" scoreboard table, historical score trend charts (block rate, usefulness, attack success), and compliance disclaimer. |
| `/replay/:runId` | `ReplayPage.tsx` | `GET /api/v1/benchmarks/replay/{run_id}` | Ordered read-only vertical execution timeline labeled "Read-only replay: tools are not re-executed", decision rationale, and metrics. |

---

## 🔒 Security & Token Storage Strategy

- **Token Storage:** Authentication tokens are stored in-memory in `AuthContext` and backed by `sessionStorage`. This reduces exposure to persistent XSS attacks relative to `localStorage` (as tokens are automatically purged when the browser tab is closed).
- **Session Expiration:** The auth context dynamically calculates token lifetime from the API's `expires_in` response field and triggers automatic logout and redirect upon expiry or a 401 response from any protected endpoint.
- **Safe Rendering:** All user prompts, red team payloads, tool results, and execution reasons are rendered as plain text strings or through the escaped `SafeJsonViewer`. `dangerouslySetInnerHTML` is never used.
- **Prototype Labeling:** A persistent banner and badge display `"Synthetic-only prototype security evaluation - not a security certification"` alongside the `execution_mode` on all evaluation and dashboard views.
