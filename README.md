# Doom Watcher

Doom Watcher is a small Next.js dashboard that simulates a macro risk monitor. It blends several synthetic indicators into a single **Doom Score** and presents trend context, top drivers, and scenario toggles.

## What the app currently does

- Calculates a weighted aggregate score from mock indicators.
- Maps the score to an alert level with color semantics.
- Shows history, quick stats, and indicator-level trend details.
- Supports scenario switching to compare different market/risk regimes.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` – start local development server.
- `npm run build` – production build.
- `npm run start` – run production server.
- `npm run lint` – ESLint checks.
- `npm run type-check` – TypeScript validation.

## Project structure

- `src/app` – Next.js App Router entrypoints and global CSS.
- `src/components` – dashboard UI sections and reusable visual primitives.
- `src/engine` – scoring logic, scenario definitions, and alert-level rules.
- `src/data` – mock data builders used by the UI.
- `src/lib` – design tokens and utilities.

## Improvement roadmap

A prioritized analysis and brainstormed improvement plan is available at:

- [`docs/improvement-roadmap.md`](docs/improvement-roadmap.md)
