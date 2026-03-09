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
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Run migrations and start the development server   |
| `npm run build`     | Build for production                              |
| `npm run start`     | Run migrations and start the production server    |
| `npm run migrate`   | Run database migrations                           |
| `npm run gen-key`   | Generate a private key for production deployments |
| `npm run typecheck` | Type-check with TypeScript                        |
| `npm run lint`      | Lint with ESLint                                  |
| `npm run format`    | Format with Prettier                              |

## Contributing

Contributions are welcome. Please open an issue or pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes
4. Open a pull request against `main`

## License

[MIT](LICENSE.md)
