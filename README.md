# Electric Cylinder Configurator

A high-end online electric cylinder selection and configuration tool. Configure the cylinder, transmission, motor, drive and control system around your application — with real-time compatibility validation and engineering checks.

Inspired by the interaction model of premium automotive configurators, combined with the engineering rigor of industrial motion control software.

## Features

- **Smart Selection** — input application requirements, get three optimized recommendations (Recommended / Performance / Economy)
- **Build Your Own** — 10-step guided configuration: Requirements → Platform → Transmission → Screw/Belt → Motor → Drive → Encoder & Sensors → Accessories → Engineering Check → Review
- **5 Cylinder Series** — EC40 Compact, EC60 General Purpose, EC80 High Force, EC100 Heavy Duty, EC120 Ultra Heavy
- **3 Transmission Types** — Ball Screw, Lead Screw, Timing Belt
- **12 Ball Screw combinations**, 8 Timing Belt combinations
- **12 Motors** — Servo, Stepper, Closed-loop Stepper (100W to 3kW)
- **10 Drives**, 5 Encoder options, 6 Sensor configurations, 10 Accessories, 8 Communication protocols
- **Real-time Compatibility Engine** — every selection validated; incompatible options remain visible with "Why unavailable?" explanations
- **Engineering Calculation Layer** — thrust, torque, RPM, critical speed, safety factor, estimated life (clearly marked as demo model)
- **Live Product Visualizer** — SVG-based cylinder illustration with Side / Transmission / Exploded views, dynamically reflecting selections
- **Current Configuration Panel** — sticky sidebar with real-time performance metrics
- **Configuration Code Generation** — e.g. `EC80-BS25-L10-S800-SV750-BR-ECAT`
- **Automatic BOM Generation** — bill of materials with part numbers, quantities, status
- **Review Page** — complete configuration summary, downloads (JSON / BOM CSV / Print), CAD/STEP placeholders
- **Quote Request** — full form with demo submission and JSON export
- **Platform Comparison** — compare up to 3 cylinder series side by side
- **Basic / Advanced modes** — hide complex parameters for casual users
- **localStorage Persistence** — configuration survives page refresh
- **Shareable Configuration Links** — encode core config into URL
- **Responsive Design** — desktop three-column, tablet, mobile with bottom sticky bar
- **Accessibility** — keyboard navigation, focus visible, ARIA labels, prefers-reduced-motion
- **GitHub Pages Auto-deploy** — GitHub Actions workflow with lint + typecheck + build

## Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite 5** — build tooling
- **Tailwind CSS 3** — custom design system (luxury industrial aesthetic)
- **Zustand** — state management with persist middleware
- **Framer Motion** — animations and transitions
- **Lucide React** — icons
- **React Router 6** — HashRouter for GitHub Pages compatibility
- **React Hook Form** + **Zod** — form validation
- **ESLint** + **Prettier** — code quality

## Project Structure

```
src/
├── app/                    # App-level setup
├── components/
│   ├── layout/            # Header, StepNav, CurrentConfiguration
│   ├── ui/                # Button, OptionCard, Badge, Tooltip, PerformanceCard
│   └── visualizer/        # ProductVisualizer SVG
├── features/
│   └── configurator/
│       ├── Configurator.tsx
│       └── steps/         # 10 configuration step components
├── pages/                  # Home, SmartSelection, Compare, Review, Quote
├── data/                   # Mock product data (all entities)
├── store/                  # Zustand store
├── types/                  # TypeScript domain types
├── lib/                    # codeGenerator, bom, utils, share
├── engineering/            # Engineering calculation layer
├── compatibility/          # Compatibility engine
├── hooks/                  # Custom hooks
└── utils/                  # Utilities
```

## Local Development

### Requirements

- Node.js **20+** (LTS recommended)
- npm

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Lint
npm run lint

# Type check
npm run typecheck

# Production build
npm run build

# Preview production build
npm run preview

# Format code
npm run format
```

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

### How it works

1. Push to `main` (or trigger manually via `workflow_dispatch`)
2. GitHub Actions runs: checkout → setup Node 20 → `npm ci` → lint → typecheck → build → upload-pages-artifact → deploy-pages
3. The Vite `base` path is automatically resolved from `GITHUB_REPOSITORY`:
   - If repo is `username.github.io` → base `/`
   - Otherwise → base `/repo-name/`
4. HashRouter is used so all routes work without server-side rewrite (no 404 on refresh)

### Setup Steps

1. Go to repository **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` — the workflow will build and deploy automatically
4. The deployed URL will be shown in the workflow run or under Settings → Pages

## Mock Engineering Data Notice

**All product parameters and engineering calculations in this project are mock/demo data.**

- Product specs (thrust, speed, payload, torque, etc.) are fabricated for UI demonstration
- Engineering formulas are simplified models — not certified for real design work
- The UI clearly marks calculations as "Demo" throughout
- Motor brands (Panasonic, Mitsubishi, Yaskawa, etc.) are used as data labels only — no business logic is tied to specific brands

### Production Integration Path

To move from demo to production:

1. **Product Database** — replace `src/data/` with API calls to a real product database (PDM / ERP)
2. **Engineering Calculations** — replace `src/engineering/` with validated formulas from engineering handbooks and product datasheets
3. **Compatibility Matrix** — connect `src/compatibility/` to real product compatibility rules
4. **Quote API** — connect the Quote page to a CRM / CPQ backend
5. **CAD / STEP** — integrate with a CAD service or file server for real model downloads
6. **Authentication** — add user auth for saved configurations and quote history

## Configuration Persistence

- Configuration state is saved to `localStorage` under key `ecc-configurator-v1`
- "Reset Configuration" clears all selections (with confirmation)
- "Copy Configuration Link" encodes core config into a URL query parameter (`?cfg=...`)
- Opening a shared link restores the main configuration automatically

## Performance

- No 3D libraries — product visualization is pure SVG
- Lazy loading where beneficial
- Production build targets ES2020
- Chunk size warning limit set to 1200KB

## License

This project is provided as a demonstration / prototype. All product data is fictional.
