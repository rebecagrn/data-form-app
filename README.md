# Data Form App

Aplicação monorepo para cadastro de clientes. O usuário preenche um formulário com dados pessoais e cor preferida; o sistema valida, persiste no PostgreSQL e informa sucesso ou erro (incluindo duplicidade de CPF/e-mail).

Repositório: https://github.com/rebecagrn/data-form-app

---

## Tecnologias

### Backend (`apps/api`)

| Tecnologia | Uso |
|------------|-----|
| [NestJS](https://nestjs.com/) | API REST, módulos, injeção de dependência |
| [TypeORM](https://typeorm.io/) | ORM e entidade `Client` |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados |
| [class-validator](https://github.com/typestack/class-validator) / [class-transformer](https://github.com/typestack/class-transformer) | Validação de DTOs |
| [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) | Testes unitários e e2e |

### Frontend (`apps/web`)

| Tecnologia | Uso |
|------------|-----|
| [React](https://react.dev/) + [Vite](https://vite.dev/) | UI e build |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem |
| [Tailwind CSS](https://tailwindcss.com/) v4 | Estilos |
| [shadcn/ui](https://ui.shadcn.com/) (estilo New York) | Componentes (Button, Input, Card, Alert, etc.) |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Formulário e validação no cliente |
| [TanStack Query](https://tanstack.com/query) | Mutação do cadastro (`useMutation`) |
| [Axios](https://axios-http.com/) | Cliente HTTP |
| [Sonner](https://sonner.emilkowal.ski/) | Toasts de sucesso/erro |
| [Lucide](https://lucide.dev/) | Ícones |
| [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Testes do formulário |

### Infraestrutura

| Tecnologia | Uso |
|------------|-----|
| [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/) | Postgres, API, Web (nginx) |
| npm workspaces | Monorepo (`apps/api`, `apps/web`) |
| [Biome](https://biomejs.dev/) | Lint, format e organize imports (substitui ESLint + Prettier) |

---

## Decisões de arquitetura

### Monorepo com npm workspaces

Um único repositório com `apps/api` e `apps/web` facilita versionamento conjunto e scripts na raiz (`dev`, `build`, `test`, `docker:up`).

### NestJS no backend

Escolhido por estrutura modular (controllers, services, DTOs), validação declarativa com `class-validator`, integração madura com TypeORM/Postgres e testes nativos — adequado para evolução por outra equipe sem reescrever boilerplate.

### React + Vite no frontend

SPA leve com HMR, TypeScript e proxy de desenvolvimento (`/api` → API local). Em produção Docker, o nginx serve o build estático e faz proxy de `/api` para o serviço NestJS.

### Validação em duas camadas

- **Cliente:** Zod + React Hook Form (feedback imediato, máscara de CPF).
- **Servidor:** DTOs com validação de CPF brasileiro, e-mail e cor do arco-íris (`RAINBOW_COLORS` compartilhável no domínio).

### Unicidade de cadastro

Constraint `UNIQUE` em `cpf` e `email` no Postgres; a API responde `409 Conflict` quando o cliente já existe.

### Feedback com Sonner (toasts)

Notificações no canto superior direito, sem deslocar o layout do formulário — preferível ao Alert inline para ações de submit.

### Docker

- **Desenvolvimento:** apenas Postgres no Compose; API e Web rodam no host com hot reload.
- **Produção local/demo:** `docker compose` sobe Postgres + API + Web (multi-stage build).

### Banco de dados — sem migrations

**Não há migrations TypeORM neste repositório.** O schema é criado/atualizado via `synchronize` do TypeORM, o que simplifica o setup em dev e Docker, mas **não** é o padrão recomendado para produção.

| Ambiente | Como o schema é aplicado |
|----------|---------------------------|
| **Dev local** (`npm run dev:api`, `NODE_ENV=development`) | `synchronize` ativo automaticamente — tabelas refletem a entidade `Client` ao subir a API |
| **Docker Compose** (serviço `api`) | `TYPEORM_SYNCHRONIZE=true` no `docker-compose.yml` |
| **Produção** | Usar migrations versionadas (`typeorm migration:generate` / `migration:run`) e `synchronize: false` |

A lógica está em `apps/api/src/app.module.ts`: sync liga se `TYPEORM_SYNCHRONIZE=true` **ou** se `NODE_ENV` não for `production`. Por isso, mesmo com `TYPEORM_SYNCHRONIZE=false` no `.env.example`, o dev local ainda sincroniza enquanto `NODE_ENV=development`.

**Notas de operação:**

- Primeira execução: subir Postgres antes da API; não é preciso rodar scripts SQL manuais.
- Alterações na entidade: reiniciar a API (dev/Docker) para o TypeORM ajustar colunas — sem histórico de migration.
- Dados em volume Docker (`postgres_data`) persistem entre `docker compose down`; o schema evolui com sync, não com arquivos `.ts` de migration.

Para evoluir o projeto em produção, desligar `synchronize`, adicionar pasta `apps/api/src/migrations/` e versionar mudanças de schema explicitamente.

### Tema claro/escuro

Preferência persistida em `localStorage`; tokens CSS (oklch) em `apps/web/src/index.css`.

---

## Estrutura do projeto

```
data-form-app/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── clients/          # Módulo de cadastro
│   │   │   ├── common/           # Constantes, validadores (CPF)
│   │   │   └── ...
│   │   ├── test/                 # e2e
│   │   └── Dockerfile
│   └── web/
│       ├── src/
│       │   ├── components/       # Formulário, UI shadcn
│       │   ├── lib/              # API, schemas Zod
│       │   └── hooks/            # Tema
│       └── Dockerfile            # Build Vite + nginx
├── docker-compose.yml
├── package.json                  # Scripts e workspaces
└── README.md
```

---

## Pré-requisitos

- **Node.js** >= 20
- **npm** (v9+ recomendado, para workspaces)
- **Docker** e **Docker Compose** (banco local ou stack completa)

---

## Instalação

```bash
git clone https://github.com/rebecagrn/data-form-app.git
cd data-form-app
npm install
```

Configure as variáveis de ambiente:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

| Arquivo | Variáveis principais |
|---------|----------------------|
| `apps/api/.env` | `DATABASE_*`, `PORT`, `CORS_ORIGIN`, `TYPEORM_SYNCHRONIZE` (ver [Banco de dados — sem migrations](#banco-de-dados--sem-migrations)) |
| `apps/web/.env` | `VITE_API_URL` (dev: `http://localhost:3000/api`) |

---

## Como executar

### Opção A — Desenvolvimento local (recomendado para codar)

1. Suba apenas o Postgres:

```bash
docker compose up -d postgres
```

2. Inicie API e Web:

```bash
npm run dev
```

| Serviço | URL |
|---------|-----|
| Formulário (Vite) | http://localhost:5173 |
| API | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |

Comandos individuais:

```bash
npm run dev:api   # só API
npm run dev:web   # só Web
```

### Opção B — Stack completa com Docker

Build e sobe Postgres + API + Web:

```bash
npm run docker:up
```

| Serviço | URL |
|---------|-----|
| Formulário (nginx) | http://localhost:8080 |
| API direta | http://localhost:3000/api |
| Postgres | `localhost:5432` |

```bash
npm run docker:logs    # acompanhar logs
npm run docker:down    # parar containers
```

No Docker, o front usa `VITE_API_URL=/api` e o nginx encaminha para o serviço `api`.

---

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/clients` | Cadastra cliente |

**Exemplo de body (`POST /api/clients`):**

```json
{
  "fullName": "Maria Silva",
  "cpf": "529.982.247-25",
  "email": "maria@example.com",
  "favoriteColor": "blue",
  "notes": "opcional"
}
```

**Cores válidas:** `red`, `orange`, `yellow`, `green`, `blue`, `indigo`, `violet`

**Respostas comuns:**

| Status | Situação |
|--------|----------|
| `201` | Cadastro criado |
| `400` | Dados inválidos (CPF, e-mail, cor, etc.) |
| `409` | CPF ou e-mail já cadastrado |

**Teste rápido com curl:**

```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "cpf": "529.982.247-25",
    "email": "john@example.com",
    "favoriteColor": "blue",
    "notes": "Teste"
  }'
```

---

## Scripts disponíveis (raiz)

| Script | Descrição |
|--------|-----------|
| `npm run dev` | API + Web em paralelo |
| `npm run dev:api` | API em modo watch |
| `npm run dev:web` | Vite dev server |
| `npm run build` | Build de API e Web |
| `npm run test` | Testes em todos os workspaces |
| `npm run lint` | Biome (lint + format check) |
| `npm run lint:fix` | Biome com correções automáticas |
| `npm run format` | Formata arquivos com Biome |
| `npm run docker:up` | Compose: build + up |
| `npm run docker:down` | Para containers |
| `npm run docker:logs` | Logs do Compose |

Testes e2e da API:

```bash
npm run test:e2e -w @data-form/api
```

---

## Lint e formatação (Biome)

Configuração central em [`biome.json`](./biome.json). No VS Code/Cursor, instale a extensão **Biome** (`biomejs.biome`); o repositório recomenda format-on-save em [`.vscode/settings.json`](./.vscode/settings.json).

```bash
npm run lint        # verifica lint + formatação
npm run lint:fix    # corrige automaticamente
npm run format      # só formata
```

---

## Testes

```bash
npm run test
```

- **API:** services, controllers, validador de CPF, e2e (health + clients).
- **Web:** utilitários e formulário de cadastro (RTL).

