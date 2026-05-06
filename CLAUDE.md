# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

Event ticketing marketplace frontend (like Yesplis/Goers). Two-sided platform: organizers create events and sell tickets, buyers discover and purchase them. Backend is Bun + Elysia.js + PostgreSQL + Prisma + Redis (separate repo). Full blueprint in `ticketing-blueprint.md`.

## Tech Stack

- **Next.js 16.2** (App Router) with React 19 and TypeScript
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **ESLint 9** flat config · **Prettier** with `prettier-plugin-tailwindcss`
- Path alias: `@/*` maps to project root

## Commands

- `npm run dev` — start dev server (port 3001 recommended, backend on 3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx prettier --write .` — format all files

## Environment

Copy `.env.example` → `.env.local` and fill in:

```
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```

## Architecture

### Route Groups

| Group | URL prefix | Auth | Layout |
|---|---|---|---|
| `app/(public)/` | `/`, `/events`, `/organizers`, `/categories`, `/search` | None | Navbar + Footer |
| `app/(auth)/` | `/login`, `/register`, `/verify-email`, etc. | Guest only | Centered card |
| `app/(buyer)/` | `/checkout`, `/orders`, `/tickets`, `/profile` | Required | Navbar only |
| `app/dashboard/` | `/dashboard/**` | Organizer role | Navbar + DashboardSidebar |
| `app/scan/` | `/scan/**` | Authenticated | Minimal mobile |
| `app/admin/` | `/admin/**` | super_admin role | Navbar + AdminSidebar |

### `lib/` Layer

```
lib/
├── api/          # API client + per-domain endpoint functions
│   └── client.ts # Base fetch wrapper: auto auth header, token refresh, typed errors
├── auth/         # AuthProvider (context.tsx), ProtectedRoute (guard.tsx), token cookies (tokens.ts)
├── hooks/        # SWR/SSE hooks: use-stock, use-waiting-room, use-checkin-stream, use-countdown
├── schemas/      # Zod schemas for all forms (auth, event, checkout, ticket-type, promo)
├── types/        # TypeScript interfaces matching backend API shapes
└── utils/        # cn(), formatCurrency(), formatDate(), constants (enums, error codes, polling intervals)
```

### `components/` Layer

```
components/
├── ui/       # Primitives: Button, Input, Select, Textarea, Badge, Card, Modal, Skeleton,
│             # Spinner, Pagination, DataTable, EmptyState, Dropdown, Tabs
├── layout/   # Navbar, Footer, DashboardSidebar, AdminSidebar
└── shared/   # Domain components: EventCard, TicketSelector, PriceBreakdown, CountdownTimer,
              # StockBadge, QrViewer, QrScanner, ScanResult, EventStatusBadge, OrganizerBadge,
              # SearchFilters, ShareButtons, DynamicForm, FileUpload, JsonLd, AttendanceList
```

### Real-time Strategy (§8.4 blueprint)

| Feature | Approach | File |
|---|---|---|
| Waiting room position | HTTP polling 5s | `lib/hooks/use-waiting-room.ts` |
| Stock counter | SWR polling 30s | `lib/hooks/use-stock.ts` |
| Check-in dashboard | SSE (EventSource) | `lib/hooks/use-checkin-stream.ts` |
| Payment status | HTTP polling 5s | inline in payment page |

### Server vs Client Components

- **Server Components**: all `(public)` pages — event listing, event detail, organizer profile, categories, search. Use `generateMetadata()` for SEO.
- **Client Components**: everything under `(buyer)`, `dashboard`, `scan`, `admin`. All forms, real-time features, charts.
- `params` and `searchParams` in Next.js 16 are **Promises** — always `await` them in Server Components.

### Auth Flow

1. `AuthProvider` wraps the entire app in `app/layout.tsx`
2. `proxy.ts` (Next.js 16 rename of `middleware.ts`) does cookie-based edge redirects (no role check — just auth presence)
3. `ProtectedRoute` in layouts does client-side role enforcement (organizer, super_admin)
4. API client (`lib/api/client.ts`) auto-refreshes tokens on 401

## Key Roles in the System

6 roles with event-scoped permissions: `super_admin`, `organizer`, `event_staff`, `gate_scanner`, `buyer`, `guest`. Staff and scanner permissions are per-event. See `ticketing-blueprint.md` §2 for full matrix.

## Important Notes

- **Next.js 16** — APIs differ from 13/14/15. Always check `node_modules/next/dist/docs/` before using Next.js features.
- **`middleware.ts` is deprecated** in Next.js 16 — use `proxy.ts` with exported function named `proxy` (not `middleware`).
- **`useSearchParams()`** must always be wrapped in `<Suspense>` — otherwise build fails at static page generation.
- **Tailwind v4** — CSS-first config only, no `tailwind.config.js`.
- **`<Select>` component** requires an `options` prop (`{ value, label }[]`) — does not accept children `<option>` elements.
- **Recharts `formatter`** prop type is `(value: ValueType) => ...` — cast with `Number(value)` before passing to `formatCurrency`.
- **`lucide-react`** in this version does not export `Twitter` — use text character `𝕏` or another icon instead.
- Error codes from backend are typed in `lib/utils/constants.ts` → `ERROR_CODES`.
- All API responses follow `{ success, data, meta }` shape — typed in `lib/types/api.ts`.
- `price_snapshot` in OrderItems (not live price) — always use snapshot for display in order/ticket pages.
