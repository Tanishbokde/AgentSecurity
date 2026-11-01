# Agent Guard (AgentShield) - Enterprise Security Operations Console

A high-performance, pixel-accurate cybersecurity operations dashboard and authentication enclave built with React 18, TypeScript, Tailwind CSS, Framer Motion, and Three.js, redesigned in a strict Black, Red, and Silver palette. Fully integrated with the live AgentShield FastAPI backend.

---

## ⚡ Quick Start

You can run commands directly from the root directory or inside `AgentSecurity-main`:

```bash
# Start local development server with Vite same-origin proxy
npm run dev

# Or build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Live Backend & Proxy Integration
- **Live Backend:** `https://agent-security-4.onrender.com`
- **Health Check:** `GET /health` -> `{"status":"ok","database":"connected","execution_mode":"SYNTHETIC_ONLY"}`
- **Proxy Behavior:** In development, requests to `/api` and `/health` route through Vite's local dev server proxy, eliminating any browser CORS restrictions across localhost, 127.0.0.1, or remote hosts.
- **Direct Fallback:** The API client includes transparent automatic fallback between direct HTTPS and same-origin proxy.

---

## 🎨 Color System & Glassmorphism
- **Black Base:** `#050506` (page background), `#0B0B0D` (surfaces), `#121214` (elevated)
- **Primary Red:** `#E10600` (buttons, active nav pills, badges, indicators)
- **Deep Red:** `#8B0000` (gradients, pressed states, borders)
- **Bright Red:** `#FF2A2A` (glow accents, focus rings, hovers)
- **Silver:** `#C0C0C0` (icons, borders, logo), `#E8E8EC` (headings), `#8A8A92` (muted text)
- **Typography:** Orbitron & Rajdhani (headings/KPIs), Inter (UI/body), JetBrains Mono (telemetry/logs)

