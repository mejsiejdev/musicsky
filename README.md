# MusicSky

> Listen and share music in the Atmosphere

MusicSky is a social music platform built on the [AT Protocol](https://atproto.com/). Sign in with any ATProto-compatible server (Bluesky, self-hosted PDS, etc.) and share what you're listening to.

## Tech Stack

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ |
| Framework | Next.js 16, React 19                             |
| Auth      | AT Protocol OAuth (`@atproto/oauth-client-node`) |
| Database  | SQLite + Kysely                                  |
| Styling   | Tailwind CSS v4, shadcn/ui                       |
| State     | Zustand                                          |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script               | Description                                       |
| -------------------- | ------------------------------------------------- |
| `pnpm run dev`       | Run migrations and start the development server   |
| `pnpm run build`     | Build for production                              |
| `pnpm run start`     | Run migrations and start the production server    |
| `pnpm run migrate`   | Run database migrations                           |
| `pnpm run gen-key`   | Generate a private key for production deployments |
| `pnpm run typecheck` | Type-check with TypeScript                        |
| `pnpm run lint`      | Lint with ESLint                                  |
| `pnpm run format`    | Format with Prettier                              |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE.md)
