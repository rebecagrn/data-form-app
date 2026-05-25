# Data Form App

Aplicação monorepo para cadastro de clientes (desafio técnico).

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **API** | NestJS, TypeORM, PostgreSQL, class-validator |
| **Web** | React, Vite, Tailwind CSS, shadcn/ui, Zustand, React Hook Form, TanStack Query, Jest + RTL |
| **Infra** | Docker, Docker Compose |

## Estrutura

```
data-form-app/
├── apps/
│   ├── api/    # Backend NestJS
│   └── web/    # Frontend React
├── docker-compose.yml
└── package.json
```

## Requisitos

- Node.js >= 20
- Docker (opcional, para Postgres local)

## Setup inicial

```bash
cd data-form-app
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
docker compose up -d   # Postgres local
```

## Desenvolvimento

```bash
npm run dev          # API + Web em paralelo
npm run dev:api      # só API (porta 3000)
npm run dev:web      # só Web (porta 5173)
npm run test         # testes em todos os workspaces
```

## Repositório

https://github.com/rebecagrn/data-form-app

```bash
git init
git branch -M main
git remote add origin https://github.com/rebecagrn/data-form-app.git
git add -A && git commit -m "chore: bootstrap monorepo"
git push -u origin main
```
