# Order of Operations Tutor

This repo contains a Vite/React playground for exploring the BODMAS rules with a visual expression solver and quiz mode. Use the steps below to configure a local development environment.

## Prerequisites
- Node.js 18+ (recommended) and npm 9+.
- macOS/Linux/WSL shell that can run `npm` scripts.

## Install Dependencies
```bash
npm install
```
> Re-run after pulling changes that modify `package.json` or `package-lock.json`.

## Environment Variables
- Copy `.env.example` to `.env.local` for local overrides.
- Never commit `.env.local`; it may hold classroom analytics keys or other secrets.
- UI code reads environment variables through Vite’s `import.meta.env` prefix (`VITE_*`).

## Running the App
Start the development server with hot reload:
```bash
npm run dev
```
Visit the printed localhost URL to interact with the visualizer and quiz panes.

## Quality Checks
- **Tests**: `npm run test` (Vitest unit coverage; add `-- --coverage` for the 90% target).
- **Lint**: `npm run lint` (ESLint + Prettier config).
- **Format**: `npm run format` (Prettier write-mode).

Always run lint and tests before opening a PR to keep CI green.

## Build
Generate a production bundle for deployment to the classroom kiosk site:
```bash
npm run build
```
Artifacts land in `dist/`.

## Repository Layout
- `src/` – React UI + hooks.
  - `src/components/` – widgets like `ExpressionVisualizer`.
  - `src/lib/` – solver helpers (`bodmas.ts`, `quiz-generator.ts`).
  - `src/app/` – shared state/routing (if expanded).
- `public/` – static assets (icons, fonts).
- `data/quizzes/` – quiz JSON.
- `tests/` – Vitest integration suites (browser-ish flows).

## Tips
- Follow 2-space indentation, camelCase for vars, PascalCase for components, and kebab-case filenames (`expression-panel.tsx`).
- Keep solver utilities pure and documented with TSDoc when adding rules.
- Avoid hard-coding secrets—load them via `.env.local`.
