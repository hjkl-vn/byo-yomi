# Byo-yomi - Go Game Clock

A mobile-friendly game clock for Go/Baduk with support for multiple time control systems.

## Features

- **Time Controls**: Byo-yomi, Canadian byo-yomi, and Fischer
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

### Cloudflare Workers

```bash
# Deploy to production
npm run deploy

# Deploy to preview environment
npm run deploy:preview
```

Requires [wrangler authentication](https://developers.cloudflare.com/workers/wrangler/commands/#login):

```bash
npx wrangler login
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Web Audio API
- PWA (vite-plugin-pwa)
