# cEDH Game Tracker

A production-ready full-stack web application for recording and analyzing competitive EDH (cEDH) games. Built with Next.js, Prisma, Tailwind CSS, and shadcn/ui components to prioritize rapid mobile-first data entry and rich analytics.

## Features

- Mobile-first quick record wizard for capturing pods, decks, mulligans, and game outcomes in seconds
- Rich analytics including win rates, turns-to-win distribution, seat advantage, mulligan impact, and archetype matchup matrix
- Comprehensive player and deck profiles with performance breakdowns
- CSV import/export utilities for players, decks, and games
- Guest mode support alongside NextAuth email/OAuth authentication
- Prisma ORM data model targeting SQLite for development and PostgreSQL for production
- Seed data with demo players, decks, and games
- Minimal Vitest coverage for analytics utilities

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Setup

```bash
pnpm install
cp .env.example .env
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

Visit `http://localhost:3000` to explore the dashboard, quick record wizard, analytics, and management pages.

## Scripts

- `pnpm dev` - Run the development server with live reload
- `pnpm build` - Create an optimized production build
- `pnpm start` - Start the production server
- `pnpm lint` - Lint the codebase
- `pnpm test` - Run Vitest unit tests
- `pnpm prisma db seed` - Populate the database with sample data

## License

MIT
