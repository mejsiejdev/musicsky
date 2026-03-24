# Contributing to MusicSky

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (the repo uses `pnpm@10` — install it directly or enable [corepack](https://nodejs.org/api/corepack.html) with `corepack enable`)
- [Tap](https://github.com/bluesky-social/indigo/blob/main/cmd/tap/README.md) — an AT Protocol sync utility that provides data for the appview

## Local Setup

```bash
# 1. Fork and clone the repository
git clone https://tangled.org/mejsiejdev.bsky.social/musicsky.git
cd musicsky

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

This starts both `apps/web` (the frontend) and `apps/appview` (the AT Protocol appview) via Turbo.
Open [http://localhost:3000](http://localhost:3000) in your browser.

No `.env` files are required — the configs provide sensible defaults for local development.

### Setting Up the Tap

The appview relies on [Tap](https://github.com/bluesky-social/indigo/blob/main/cmd/tap/README.md) to sync AT Protocol data. Follow the Tap README to install it, then run it with:

```bash
TAP_SIGNAL_COLLECTION=app.musicsky.temp.song tap
```

## Branch Naming

| Prefix   | When to use                          |
| -------- | ------------------------------------ |
| `feat/`  | New features                         |
| `fix/`   | Bug fixes                            |
| `chore/` | Maintenance, tooling, or config work |

Example: `git checkout -b feat/share-track`

## Commit Style

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<optional scope>): <short description>

[optional body]
```

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`.

Examples:

```
feat(player): add repeat mode toggle
fix(auth): handle expired OAuth token gracefully
chore: upgrade Next.js to 16.3
```

## Pull Requests

Pre-commit hooks (husky + lint-staged) run formatting and linting automatically. CI runs `knip`, `typecheck`, `lint`, and `build` on every push and pull request.

A good PR:

- Has a clear title following the commit style above
- Describes _what_ changed and _why_ in the PR body
- Keeps changes focused, with one concern per PR
- Links to a relevant issue if one exists

## Reporting Bugs

Please open a [issue](https://tangled.org/mejsiejdev.bsky.social/musicsky/issues) and include:

- Steps to reproduce
- Expected vs. actual behaviour
- Browser / OS / Node.js version if relevant
