# MusicSky

> Listen and share music in the Atmosphere

MusicSky is a social music platform built on the [AT Protocol](https://atproto.com/). Sign in with any ATProto-compatible server (Bluesky, self-hosted PDS, etc.) and share what you're listening to.

## Tech Stack

### Web (`apps/web`)

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ |
| Framework | Next.js 16, React 19                             |
| Auth      | AT Protocol OAuth (`@atproto/oauth-client-node`) |
| Styling   | Tailwind CSS v4, shadcn/ui                       |
| State     | Zustand                                          |

### Appview (`apps/appview`)

| Layer    | Technology      |
| -------- | --------------- |
| Server   | Express 5       |
| Database | SQLite + Kysely |
| Sync     | AT Protocol Tap |

## Project Structure

This is a [pnpm](https://pnpm.io/) monorepo managed with [Turborepo](https://turbo.build/repo).

| Path                | Description                     |
| ------------------- | ------------------------------- |
| `apps/web`          | Next.js frontend                |
| `apps/appview`      | AT Protocol appview service     |
| `packages/common`   | Shared utilities                |
| `packages/lexicons` | AT Protocol lexicon definitions |

## Getting Started

```bash
# Install dependencies (requires pnpm)
pnpm install

# Start both apps in dev mode
pnpm dev
```

`pnpm dev` starts both `apps/web` and `apps/appview` via Turbo.
Open [http://localhost:3000](http://localhost:3000) for the web frontend.

## Scripts

| Script           | Description                                |
| ---------------- | ------------------------------------------ |
| `pnpm dev`       | Start both apps in development mode        |
| `pnpm build`     | Build all apps and packages for production |
| `pnpm typecheck` | Type-check with TypeScript                 |
| `pnpm lint`      | Lint with ESLint                           |
| `pnpm knip`      | Find unused exports and dependencies       |
| `pnpm format`    | Format with Prettier                       |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE.md)
