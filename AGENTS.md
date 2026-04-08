# AGENTS.md

## Commands

- **Use pnpm** (not npm)
- `pnpm dev` - Start dev server
- `pnpm build` - Typecheck + build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

## Tech Stack

- React 19 with React Compiler (babel-plugin-react-compiler)
- Vite 8
- TypeScript ~6.0.2
- ESLint 9 (flat config)
- Created with: `pnpm create vite maths-rose-izia --template react-compiler-ts --no-interactive`

## Notes

- Build uses `tsc -b` (build mode) before vite build
- React Compiler requires Babel via `@rolldown/plugin-babel` - don't remove
- No test framework configured