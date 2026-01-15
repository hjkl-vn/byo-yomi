# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server (http://localhost:5173)
npm run build         # TypeScript check + production build
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npx vitest run src/core/timeControl.test.ts  # Run a single test file
npx vitest run src/components/App.test.tsx   # Run component tests
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix lint issues
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting (used in CI)
npm run preview       # Preview production build
npm run deploy        # Build and deploy to Cloudflare Workers
npm run deploy:preview # Deploy to preview environment
```

Requires Node.js 22+.

Pre-commit hooks (Husky + lint-staged) auto-run lint and format on staged files.

## Docker

```bash
docker compose up --build  # Build and run (http://localhost:8080)
docker compose up -d       # Run in background
```

## Architecture

This is a Go/Baduk game clock PWA with three time control modes: byoyomi, Canadian byoyomi, and Fischer.

### Core Layer (`src/core/`)

Framework-agnostic TypeScript modules:

- **gameState.ts** - Type definitions for time controls, player state, and game state. Contains `createInitialGameState()` for state initialization.
- **timeControl.ts** - Pure functions for clock logic: `tick()` advances time and handles overtime transitions, `onMove()` handles turn-end effects (period resets, increments). `formatTime()` and `getDisplayTime()` for display.
- **audioEngine.ts** - Web Audio API wrapper with generated tones. Singleton `audioEngine` instance. Supports scheduled playback for countdown sequences.

### React Layer

- **App.tsx** - Screen router (config → game)
- **hooks/useGameClock.ts** - Main game loop using `requestAnimationFrame`. Manages state transitions, audio triggers, and exposes `switchTurn`, `pause`, `resume`, `reset`.
- **hooks/useAudio.ts** - React wrapper around audioEngine
- **hooks/useWakeLock.ts** - Screen Wake Lock API for keeping display on

### UI Components

- **ConfigScreen** - Time control configuration with localStorage persistence (key: `byoyomi-config`)
- **GameBoard** - Split-screen layout with two ClockFace components, top one rotated 180°
- **ClockFace** - Displays time, overtime info (periods/stones), move count. Mode-specific rendering for each time control type.
- **GameOverModal** - End game overlay with rematch/new game options

### Key Design Decisions

- Core logic is pure TypeScript for testability (no React dependencies)
- Time precision uses `performance.now()` via requestAnimationFrame
- Audio uses Web Audio API for sample-accurate scheduling of countdown beeps
- Portrait-only layout with device lying flat between players
- Tailwind CSS v4 (uses `@import 'tailwindcss'` syntax, not v3 directives)
- Tests use jsdom environment with setup in `src/test/setup.ts`
