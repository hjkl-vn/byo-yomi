# Byoyomi - Go Game Clock

A mobile-friendly game clock for Go/Baduk with support for multiple time control systems.

## Features

- **Time Controls**: Byoyomi, Canadian byoyomi, and Fischer
- **Mobile-First Design**: Portrait layout optimized for phones and tablets
- **Face-to-Face Play**: Device lies flat between players, each clock rotated to face its player
- **Sound Profiles**: Silent, Subtle, and Intense audio feedback
- **PWA Support**: Installable on mobile home screens, works offline
- **Wake Lock**: Screen stays on during active games

## Usage

1. Configure your time control settings
2. Tap "Start Game" to begin
3. Each player taps their clock to end their turn
4. Use the center pause button to pause/resume

## Development

### Prerequisites

- Node.js 22+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker

```bash
# Build and run (http://localhost:8080)
docker compose up --build

# Run in background
docker compose up -d

# Stop
docker compose down
```

## Deployment

This app is deployed to [Cloudflare Workers](https://workers.cloudflare.com/) as a static site using Workers Assets.

### How It Works

1. `npm run build` creates a production build in `dist/`
2. Wrangler uploads the static assets to Cloudflare's edge network
3. The worker serves the SPA with proper routing (404s redirect to index.html)

Configuration is in `wrangler.json`:

- `assets.directory` - Points to the Vite build output (`./dist`)
- `assets.not_found_handling` - Set to `single-page-application` for client-side routing

### Deploy Commands

```bash
# Authenticate with Cloudflare (one-time setup)
npx wrangler login

# Deploy to production
npm run deploy

# Deploy to preview environment
npm run deploy:preview
```

### CI/CD

The app can be deployed automatically via GitHub Actions by adding `CLOUDFLARE_API_TOKEN` to repository secrets.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Web Audio API
- PWA (vite-plugin-pwa)
