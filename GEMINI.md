# Project Instructions: Habit Tracker

This project is a Next.js application (version 16.2.4) with React 19. It uses a specific set of conventions and workflows adapted from the team's established Claude-based standards.

## Next.js Special Rules
- **Breaking Changes**: This version has breaking changes. APIs and conventions may differ from training data.
- **Instant Navigation**: If fixing slow client-side navigations, `Suspense` alone is not enough. You MUST export `unstable_instant` from the route. See `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.mdx`.

## Development Workflow
Follow the **Research -> Strategy -> Execution (Plan -> Act -> Validate)** cycle.
For complex features, use the following phases:
1. **Brainstorm**: Explore options and design.
2. **Plan**: Break into phases and identify risks.
3. **Implement**: Build with TDD (Red/Green/Refactor).
4. **Quality Check**: Full audit before finishing.

## Core Principles
1. **Consistency**: Matches existing patterns, naming, and structure (Wins over cleverness).
2. **Readability**: Clear intent, minimal mental overhead.
3. **Reusability**: Shared components over duplication.

## Pre-Flight Checklist
Before coding, verify:
- What project wrappers exist for UI components (Buttons, Modals, etc.)?
- What UI library is in use?
- Naming conventions (Kebab-case for files, PascalCase for components).
- Naming for hooks (`useKebabCase.ts`).
- State management and refresh behavior.

## Component Priority Order
1. **Project components**: Always check `./components/` first.
2. **UI library**: Use the project's library (e.g., Tailwind).
3. **Layout primitives**: Avoid raw `<div>` for layout; use project primitives.

## Naming Conventions
- **Component files**: `kebab-case.tsx` (e.g., `user-profile.tsx`)
- **Hook files**: `use-kebab-case.ts` (e.g., `use-table-params.ts`)
- **Component names**: `PascalCase`
- **Hook names**: `useCamelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Props**: `Props` (local) or `ComponentNameProps` (exported)

## Import Order
1. React
2. Third-party libraries
3. Next.js
4. Local files (relative)
5. Shared alias

## TypeScript Rules
- **No `any`**: Use `unknown` or proper types.
- **No `as` or `!`**: Avoid unless explained.
- **Named Props**: Use named interfaces for props.
- **Explicit types**: For all function parameters and returns.
- **React Types**: Import named types (e.g., `import { ReactNode } from 'react'`), do not use `React.ReactNode`.

## Performance
- `useCallback` for all handlers passed as props or in dependency arrays.
- `useMemo` for derived state and context values.
- Valid dependency arrays for `useEffect`.

## Quality Standards
- **Zero Lint Errors**: Run `npm run lint` and fix all warnings.
- **Test-Driven**: Write a failing test before implementing features.
- **No hardcoded strings**: Use the project's i18n/string system.
- **File Length**: Aim for 150 lines, max 300 lines for components.

## Commit Messages
Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>: <description>`
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
