# Data Form App

Monorepo for client registration. The user fills in personal data and a favorite color; the system validates the payload, persists it in PostgreSQL, and reports success or errors (including duplicate CPF/email). The page also lists registered clients with a masked CPF.

Repository: https://github.com/rebecagrn/data-form-app

---

## Tech stack

### Backend (`apps/api`)

| Technology | Role |
|------------|------|
| [NestJS](https://nestjs.com/) | REST API, modules, dependency injection |
| [TypeORM](https://typeorm.io/) | ORM and `Client` entity |
| [PostgreSQL](https://www.postgresql.org/) | Database |
| [class-validator](https://github.com/typestack/class-validator) / [class-transformer](https://github.com/typestack/class-transformer) | DTO validation |
| [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) | Unit and e2e tests |

### Frontend (`apps/web`)

| Technology | Role |
|------------|------|
| [React](https://react.dev/) + [Vite](https://vite.dev/) | UI and build |
| [TypeScript](https://www.typescriptlang.org/) | Typing |
| [Tailwind CSS](https://tailwindcss.com/) v4 | Styling |
| [shadcn/ui](https://ui.shadcn.com/) (New York style) | Components (Button, Input, Card, Alert, etc.) |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form state and client-side validation |
| [TanStack Query](https://tanstack.com/query) | Registration mutation (`useMutation`) and listing (`useQuery`) |
| [Axios](https://axios-http.com/) | HTTP client |
| [Sonner](https://sonner.emilkowal.ski/) | Success/error toasts |
| [Lucide](https://lucide.dev/) | Icons |
| [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Form and list tests |

### Infrastructure

| Technology | Role |
|------------|------|
| [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/) | Postgres, API, Web (nginx) |
| npm workspaces | Monorepo (`apps/api`, `apps/web`) |
| [Biome](https://biomejs.dev/) | Lint, format, and import sorting (replaces ESLint + Prettier) |

---

## Architecture decisions

### Monorepo with npm workspaces

A single repository with `apps/api` and `apps/web` keeps versioning together and puts shared scripts at the root (`dev`, `build`, `test`, `docker:up`).

### NestJS on the backend

Chosen for its modular layout (controllers, services, DTOs), declarative `class-validator` checks, mature TypeORM/Postgres integration, and first-class tests — so another team can extend the API without rewriting boilerplate.

### React + Vite on the frontend

A light SPA with HMR, TypeScript, and a dev proxy (`/api` → local API). In Docker production, nginx serves the static build and proxies `/api` to the NestJS service.

### Two-layer validation

- **Client:** Zod + React Hook Form (immediate feedback, CPF mask).
- **Server:** DTOs that validate Brazilian CPF, email, and rainbow color (`RAINBOW_COLORS`, shared across the domain).

### Unique registration

`UNIQUE` constraints on `cpf` and `email` in Postgres; the API returns `409 Conflict` when the client already exists.

### Feedback with Sonner (toasts)

Notifications in the top-right corner, without shifting the form layout — preferred over an inline Alert for submit actions.

### Docker

- **Development:** only Postgres in Compose; API and Web run on the host with hot reload.
- **Local/demo production:** `docker compose` starts Postgres + API + Web (multi-stage build).

### Database — migrations

The schema is versioned with **TypeORM migrations** in `apps/api/src/database/migrations/`. The CLI `DataSource` lives in [`apps/api/src/database/data-source.ts`](apps/api/src/database/data-source.ts) and uses the same `DATABASE_*` variables. `synchronize` is **off by default** and only turns on with `TYPEORM_SYNCHRONIZE=true` (occasional local use).

| Environment | How the schema is applied |
|-------------|---------------------------|
| **Local dev** (`npm run dev:api`) | Run `npm run db:migrate` after starting Postgres; `synchronize` off |
| **Docker Compose** (`api` service) | `TYPEORM_MIGRATIONS_RUN=true` runs pending migrations on boot; `TYPEORM_SYNCHRONIZE=false` |
| **Production** | `synchronize: false` + versioned migrations (`migration:run` on deploy or `TYPEORM_MIGRATIONS_RUN=true`) |

Flags in `apps/api/src/app.module.ts`:

- `TYPEORM_SYNCHRONIZE=true` — create/update tables from entities (dev only; never in production).
- `TYPEORM_MIGRATIONS_RUN=true` — run pending migrations when the API starts.

**Commands (workspace `@data-form/api`):**

```bash
npm run db:migrate                     # apply pending migrations (root proxy)
npm run db:migrate:revert              # undo the last migration

# or directly in the API workspace:
npm run migration:run -w @data-form/api
npm run migration:show -w @data-form/api
npm run migration:generate -w @data-form/api -- src/database/migrations/ChangeName
npm run migration:create -w @data-form/api -- src/database/migrations/ChangeName
```

**Flow when changing an entity:** edit the entity → `migration:generate` → review the generated SQL → `db:migrate`. In production, never edit migrations that have already been applied.

**Initial setup (dev):**

```bash
docker compose up -d postgres
npm run db:migrate
npm run dev:api
```

### Light/dark theme

Preference persisted in `localStorage`; CSS tokens (oklch) in `apps/web/src/index.css`.

---

## Project structure

```
data-form-app/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── clients/          # Registration module
│   │   │   ├── common/           # Validators (CPF)
│   │   │   ├── database/         # DataSource and migrations
│   │   │   └── ...
│   │   ├── test/                 # e2e
│   │   └── Dockerfile
│   └── web/
│       ├── src/
│       │   ├── components/       # Form, list, shadcn UI
│       │   ├── lib/              # API client, Zod schemas
│       │   └── hooks/            # Theme
│       └── Dockerfile            # Vite build + nginx
├── packages/
│   └── shared/                   # Shared constants (rainbow colors)
├── docker-compose.yml
├── package.json                  # Scripts and workspaces
└── README.md
```

---

## Prerequisites

- **Node.js** >= 20
- **npm** (v9+ recommended, for workspaces)
- **Docker** and **Docker Compose** (local database or full stack)

---

## Setup

```bash
git clone https://github.com/rebecagrn/data-form-app.git
cd data-form-app
npm install
```

Configure environment variables:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

| File | Main variables |
|------|----------------|
| `apps/api/.env` | `DATABASE_*`, `PORT`, `CORS_ORIGIN`, `TYPEORM_SYNCHRONIZE`, `TYPEORM_MIGRATIONS_RUN` (see [Database — migrations](#database--migrations)) |
| `apps/web/.env` | `VITE_API_URL` (dev: `http://localhost:3000/api`) |

---

## Running the app

### Option A — Local development (recommended for coding)

1. Start Postgres only:

```bash
docker compose up -d postgres
```

2. Start API and Web:

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Form (Vite) | http://localhost:5173 |
| API | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |

Individual commands:

```bash
npm run dev:api   # API only
npm run dev:web   # Web only
```

### Option B — Full Docker stack

Build and start Postgres + API + Web:

```bash
npm run docker:up
```

| Service | URL |
|---------|-----|
| Form (nginx) | http://localhost:8080 |
| API directly | http://localhost:3000/api |
| Postgres | `localhost:5434` (host) → `5432` in the container |

```bash
npm run docker:logs    # follow logs
npm run docker:down    # stop containers
```

In Docker, the frontend uses `VITE_API_URL=/api` and nginx proxies that path to the `api` service.

---

## API

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/clients` | List clients (paginated; masked CPF) |
| `POST` | `/api/clients` | Register a client |

**Query params (`GET /api/clients`):**

| Param | Default | Limit |
|-------|---------|-------|
| `page` | `1` | ≥ 1 |
| `limit` | `20` | 1–50 |

**Example response (`GET /api/clients`):**

```json
{
  "items": [
    {
      "id": "uuid",
      "fullName": "Maria Silva",
      "cpf": "***.***.***-25",
      "email": "maria@example.com",
      "favoriteColor": "blue",
      "notes": null,
      "createdAt": "2026-05-26T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

The list returns a masked CPF. `POST` still returns the full CPF of the newly created record.

**Example body (`POST /api/clients`):**

```json
{
  "fullName": "Maria Silva",
  "cpf": "529.982.247-25",
  "email": "maria@example.com",
  "favoriteColor": "blue",
  "notes": "optional"
}
```

**Valid colors:** `red`, `orange`, `yellow`, `green`, `blue`, `indigo`, `violet`

**Common responses:**

| Status | Meaning |
|--------|---------|
| `200` | Client list |
| `201` | Client created |
| `400` | Invalid data (CPF, email, color, pagination, etc.) |
| `409` | CPF or email already registered |

**Quick curl test:**

```bash
curl http://localhost:3000/api/clients

curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "cpf": "529.982.247-25",
    "email": "john@example.com",
    "favoriteColor": "blue",
    "notes": "Test"
  }'
```

---

## Available scripts (root)

| Script | Description |
|--------|-------------|
| `npm run dev` | API + Web in parallel |
| `npm run dev:api` | API in watch mode |
| `npm run dev:web` | Vite dev server |
| `npm run build` | Build API and Web |
| `npm run test` | Tests in all workspaces |
| `npm run lint` | Biome (lint + format check) |
| `npm run lint:fix` | Biome with automatic fixes |
| `npm run format` | Format files with Biome |
| `npm run docker:up` | Compose: build + up |
| `npm run docker:down` | Stop containers |
| `npm run docker:logs` | Compose logs |

API e2e tests:

```bash
npm run test:e2e -w @data-form/api
```

---

## Lint and formatting (Biome)

Central config in [`biome.json`](./biome.json). In VS Code/Cursor, install the **Biome** extension (`biomejs.biome`); the repo enables format-on-save in [`.vscode/settings.json`](./.vscode/settings.json).

```bash
npm run lint        # check lint + formatting
npm run lint:fix    # apply automatic fixes
npm run format      # format only
```

---

## Tests

```bash
npm run test
```

- **API:** services, controllers, CPF validator, e2e (health + clients).
- **Web:** utilities, registration form, and client list (RTL).
