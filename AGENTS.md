# Repository Guidelines

## Project Structure & Module Organization
The web client lives in `src/`, with reusable math helpers under `src/lib/` and UI widgets in `src/components/`. State and routing logic reside in `src/app/`. Static assets (SVG icons, fonts) go in `public/`, and quiz content JSON is stored in `data/quizzes/`. Browser-facing tests sit beside their targets as `*.spec.tsx`, while broader integration flows live in `tests/`.

## Build, Test, and Development Commands
- `npm install`: Resolves dependencies before any other task.
- `npm run dev`: Starts the Vite dev server with hot reload for the live expression visualiser.
- `npm run build`: Produces an optimized bundle ready for deployment to the classroom kiosk site.
- `npm run test`: Executes Vitest suites for solver logic, React components, and quiz flows.
- `npm run lint`: Runs ESLint with Prettier to ensure style alignment before opening a PR.

## Coding Style & Naming Conventions
Use TypeScript with 2-space indentation, camelCase for functions/variables, PascalCase for React components, and kebab-case filenames (e.g., `expression-panel.tsx`). Prefer functional components with hooks. Keep solver utilities pure and documented with TSDoc. Run `npm run lint` and `npm run format` (Prettier) before pushing.

## Testing Guidelines
Vitest drives unit tests; React Testing Library covers UI states. Name suites after the module under test (`ExpressionSolver.spec.ts`). Every math rule addition must add fixture coverage for BODMAS, including mixed operator precedence and parentheses. Maintain ≥90% statement coverage via `npm run test -- --coverage` and update snapshots when UI colors change.

## Commit & Pull Request Guidelines
Write commits in the imperative mood (`feat: add quiz feedback states`). Squash small WIP work locally. PRs must describe the change, outline manual test steps, and link the tracked classroom card. Add screenshots or GIFs for visual tweaks (expression tree, quiz modal). Request review from both curriculum and frontend maintainers when solver logic or pedagogy changes.

## Security & Configuration Tips
Do not embed API keys for analytics—load them via `.env.local` and document defaults in `.env.example`. When adding quizzes, validate input on both client and server mocks to prevent injection in rendered math expressions.
