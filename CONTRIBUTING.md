# Contributing to MusicSky

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Prerequisites

- [Node.js](https://nodejs.org/)

## Local Setup

```bash
# 1. Fork and clone the repository
git clone https://tangled.org/mejsiejdev.bsky.social/musicsky.git
cd musicsky

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Pull Request Checklist

Before opening a PR, make sure the following pass locally:

```bash
pnpm run typecheck   # TypeScript type checking
pnpm run lint        # ESLint + Prettier formatting check
```

A good PR:

- Has a clear title following the commit style above
- Describes _what_ changed and _why_ in the PR body
- Keeps changes focused - one concern per PR
- Links to a relevant issue if one exists

## Reporting Bugs

Please open a [issue](https://tangled.org/mejsiejdev.bsky.social/musicsky/issues) and include:

- Steps to reproduce
- Expected vs. actual behaviour
- Browser / OS / Node.js version if relevant
