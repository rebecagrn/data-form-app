# Data Form App

Aplicação monorepo para cadastro de clientes (desafio técnico). O usuário preenche um formulário com dados pessoais e cor preferida; o sistema valida, persiste no PostgreSQL e informa sucesso ou erro (incluindo duplicidade de CPF/e-mail).

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

---

## Decisões de arquitetura

### Monorepo com npm workspaces

Um único repositório com `apps/api` e `apps/web` atende o requisito do desafio, facilita versionamento conjunto e scripts na raiz (`dev`, `build`, `test`, `docker:up`).

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

`TYPEORM_SYNCHRONIZE=true` no Compose de produção cria/atualiza schema automaticamente (adequado ao desafio; em produção real usar migrations).

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
├── PLAN.md                       # Plano de fases do projeto
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
| `apps/api/.env` | `DATABASE_*`, `PORT`, `CORS_ORIGIN`, `TYPEORM_SYNCHRONIZE` |
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
| `npm run lint` | ESLint nos workspaces |
| `npm run docker:up` | Compose: build + up |
| `npm run docker:down` | Para containers |
| `npm run docker:logs` | Logs do Compose |

Testes e2e da API:

```bash
npm run test:e2e -w @data-form/api
```

---

## Testes

```bash
npm run test
```

- **API:** services, controllers, validador de CPF, e2e (health + clients).
- **Web:** utilitários e formulário de cadastro (RTL).

---

## Documentação adicional

- [PLAN.md](./PLAN.md) — requisitos de negócio, fases de entrega e histórico do plano de desenvolvimento.

---

## Licença

Projeto de desafio técnico — uso conforme política do repositório.
