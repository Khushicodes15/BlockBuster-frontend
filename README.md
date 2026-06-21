# 🚦 BlockBuster

> **Next-Generation City Operations Dashboard for the Bengaluru Traffic Management Centre (BTMC)**

BlockBuster is an advanced, AI-assisted frontend dashboard designed to help city officials and watch commanders manage urban traffic chaos in real-time. By combining live network state monitoring with a dynamically generated "Honest AI" Playbook engine, BlockBuster turns hours of emergency planning into a mathematically stress-tested, verifiable response in seconds.

## ✨ Key Features

* **🗺️ Live Network Map:** Visualizes real-time corridor congestion, network capacity (`vc_ratio`), and police station deployments using interactive Leaflet-based map rendering.
* **🤖 "Honest AI" Playbook Engine:** When disasters strike (e.g., infrastructure failure), the Playbook Engine uses live Server-Sent Events (SSE) to mathematically simulate the fallout, generate multi-step mitigation strategies (Signal Overrides, Barricades, Marshal Deployments), and create LLM-backed localized public advisories.
* **⚡ Real-Time Stress Testing:** Our routing algorithms don't just guess—they simulate network capacity overloads. BlockBuster dynamically reroutes traffic around blocked corridors and proves its viability via a built-in stress test.
* **⚖️ Automated Judging Panel:** We believe in verifiable AI. Before dispatch, an independent AI panel evaluates the generated playbook against three strict criteria: **Safety**, **Feasibility**, and **Clarity**, raising flags for Watch Commander review if any criteria fail.
* **📱 Ground Unit Dispatch:** With one click, push SMS alerts to citizens (via Groq-generated contextual copy) and dispatch available ground marshals to exact junctions based on localized ETA availability.

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router, React 18)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with class-variance-authority & `clsx` for dynamic UI tokens.
* **State & Data Fetching:** `@tanstack/react-query`
* **Icons:** [Lucide React](https://lucide.dev/)
* **Typography:** Geist Sans & Geist Mono (Vercel)
* **Toasts/Alerts:** Sonner

## 🚀 Getting Started

### 1. Install Dependencies
Make sure you are running Node.js >= 18.x.
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root of the project to point to your backend API.
```env
# Optional: Defaults to a same-origin proxy (/api/backend)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## 🏗️ Project Structure Highlights

* `src/app/` - Next.js App Router layout, error handling, and pages.
* `src/components/` - React components, including the highly dynamic `PlaybookPanel.tsx` and context providers.
* `src/lib/` - Shared types, API fetching logic (`api.ts`), and the SSE streaming hook (`usePlaybookStream.ts`).

## 🤝 Contributing
Contributions are welcome! Please ensure any modifications to routing or simulation features respect the existing data shapes defined in `src/lib/types.ts`. All changes to the Playbook execution should maintain the "Honest AI" principle of verifiable stress-testing before dispatch.

---
*Built for the future of smart urban mobility.*
