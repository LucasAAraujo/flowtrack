# Flowtrack

Sistema de controle de tempo pessoal com autenticação JWT, dashboard e histórico filtrado.

## Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2, PostgreSQL 16, Alembic
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query v5
- **Infra**: Docker Compose

## Pré-requisitos

- Docker + Docker Compose v2
- Make (opcional, mas recomendado)

## Como rodar

```bash
# 1. Copie os arquivos de environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Edite backend/.env com uma JWT_SECRET_KEY segura
openssl rand -hex 32  # gere e cole em JWT_SECRET_KEY

# 3. Suba os serviços
make up
# ou: docker compose up -d --build

# 4. Migrations são aplicadas automaticamente no start do backend
```

Acesse:
- Frontend: http://localhost:5173
- API / Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `make up` | Sobe todos os serviços em background |
| `make down` | Para e remove os containers |
| `make logs` | Acompanha os logs ao vivo |
| `make migrate` | Aplica migrations pendentes |
| `make revision m="descrição"` | Gera nova migration via autogenerate |
| `make test` | Roda os testes do backend |

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do PostgreSQL | `postgresql+psycopg://flowtrack:changeme@db:5432/flowtrack` |
| `JWT_SECRET_KEY` | Chave secreta JWT (32 bytes hex) | gerada via `openssl rand -hex 32` |
| `JWT_ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | TTL do access token | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | TTL do refresh token | `7` |
| `CORS_ORIGINS` | Origins permitidas | `http://localhost:5173` |
| `ENVIRONMENT` | Ambiente | `development` |

### Frontend (`frontend/.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL base da API | `http://localhost:8000/api/v1` |

## Testes

```bash
make test
# ou: docker compose exec backend pytest -v
```

## Segurança

- Tokens JWT (access 15min, refresh 7 dias)
- Senhas com bcrypt (cost 12)
- Rate limiting em `/auth/login` e `/auth/register`
- Ownership check em todos os endpoints
- Headers de segurança (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)

## Próximos passos (pós-MVP)

- Recuperação de senha por e-mail
- Blacklist de tokens (logout server-side)
- Exportação para CSV/PDF
- OAuth (Google, GitHub)
- Timer em tempo real
- Relatórios semanais/mensais

## Produção

Em produção, coloque o backend e frontend atrás de um reverse proxy (ex.: nginx) com TLS habilitado. Nunca exponha o PostgreSQL diretamente.
