# Sistema de orçamentos — API + Frontend

Monorepo com **API REST** (NestJS + TypeORM + PostgreSQL) e **interface web** (Next.js). Este guia permite clonar o repositório, preparar o banco e subir as duas aplicações em desenvolvimento.

**Portas padrão neste projeto:** frontend **3000**, API **3001** (evita conflito entre Next.js e Nest).

## Pré-requisitos

| Ferramenta | Observação |
|------------|------------|
| **Node.js** | Na pasta `api`, o arquivo [`.nvmrc`](api/.nvmrc) indica **Node 22** (também suportados 18.19+ e 20.11+ conforme `api/package.json`). Recomenda-se [nvm](https://github.com/nvm-sh/nvm): `cd api && nvm install && nvm use`. |
| **npm** | Versão **8+** (vem com Node recente). |
| **PostgreSQL** | Servidor acessível por TCP; crie um banco vazio (ou use um só para este projeto). **Opcional** se você usar apenas o fluxo [Docker Compose](#docker-compose-postgresql--api). |
| **Docker** | Opcional: [Docker Engine](https://docs.docker.com/engine/install/) + Compose V2 para subir banco + API (e, se quiser, frontend) via [`docker-compose.yml`](docker-compose.yml). |

## Estrutura do repositório

```
projeto-final/
├── api/              # Backend NestJS (porta padrão 3001)
├── frontend/         # App Next.js — porta padrão 3000
├── banco.sql         # DDL: tipos, tabelas e constraints (substitui “migração” inicial)
├── seed.sql          # Dados de demonstração (usuário demo, etc.)
├── docker-compose.yml  # PostgreSQL + API (+ frontend opcional via profile)
├── api/.env.example
├── frontend/.env.example
└── README.md
```

Não há pastas de **migração TypeORM** (`MigrationInterface`). O schema esperado pela API é o definido em **`banco.sql`**. Com `TYPEORM_SYNC=false` (padrão no exemplo de ambiente), o TypeORM **não** cria tabelas automaticamente: é obrigatório aplicar o SQL antes de rodar a API (exceto no fluxo Docker Compose abaixo, onde o init do PostgreSQL aplica `banco.sql` e `seed.sql` na primeira subida do volume).

## Docker Compose (PostgreSQL + API)

Uso didático: sobe **PostgreSQL** (dados persistidos em volume Docker nomeado `pgdata`, independente de Linux ou Windows) e a **API** em container, sem precisar instalar o servidor de banco na máquina.

### Pré-requisitos

- [Docker Engine](https://docs.docker.com/engine/install/) e Docker Compose V2 (`docker compose`).

### Comandos (na raiz do repositório)

```bash
docker compose build
docker compose up -d
```

- **Padrão:** apenas `db` + `api`. O frontend **não** sobe no container (ideal para `npm run dev` no Next na IDE em **http://localhost:3000**).
- **Incluir o Next em container:** `docker compose --profile frontend up -d` (rebuild se mudar código: `docker compose --profile frontend build frontend`).

Na **primeira** criação do volume vazio, a imagem oficial do PostgreSQL executa automaticamente `banco.sql` e `seed.sql` montados em `/docker-entrypoint-initdb.d/`. Nos próximos `up`, os dados já existentes são reutilizados; alterações nesses arquivos **não** reaplicam sozinhas — use `docker compose down -v` para apagar o volume e rodar o init de novo (apaga todos os dados do banco no Docker).

### Portas e conflitos

| Serviço    | Host        | Observação |
|------------|-------------|------------|
| API        | **3001**    | Se algo já usar a 3001 na máquina, pare esse processo ou altere o mapeamento no `docker-compose.yml`. |
| PostgreSQL | **5433** → 5432 no container | Evita conflito com um PostgreSQL local na porta 5432. Usuário `postgres`, senha `postgres`, banco `sistema_pequena_empresa`. |
| Next (profile `frontend`) | **3000** | Só quando o profile estiver ativo. |

### Variáveis de ambiente

- **API no Compose:** definidas em [`docker-compose.yml`](docker-compose.yml) (`DATABASE_HOST=db`, `CORS_ORIGIN=http://localhost:3000`, `JWT_SECRET` fixo só para didática — não use em produção).
- **Next na IDE (debug):** crie [`frontend/.env.local`](frontend/.env.example) com `BACKEND_API_URL=http://localhost:3001/api` (o servidor Next no host fala com a API exposta na máquina).
- **Next no Docker (profile `frontend`):** o Compose define `BACKEND_API_URL=http://api:3001/api` (rede interna do Compose), porque as chamadas ao backend ocorrem **dentro** do container do Next.

### URLs úteis

- Swagger: **http://localhost:3001/api/docs**
- Next (se subiu com profile): **http://localhost:3000**

### Se a API falhar com `getaddrinfo EAI_AGAIN db`

Isso costuma ser falha temporária de DNS na rede Docker (às vezes com imagens **Alpine** no Node). O `docker-compose.yml` usa rede **`internal`** explícita, a API reinicia com `restart: unless-stopped` e o TypeORM passa a ter mais tentativas de conexão; a imagem da API usa **Debian slim** (`bookworm-slim`) para melhor compatibilidade com o resolvedor do Docker. Reconstrua e suba de novo: `docker compose build api && docker compose up -d`.

### Login de demonstração (após init automático ou `seed.sql`)

| Campo  | Valor |
|--------|--------|
| E-mail | `demo@sistema.local` |
| Senha  | `senha123` |

## 1. Banco de dados

### 1.1 Criar o banco (uma vez)

No `psql` ou em qualquer cliente PostgreSQL, crie o banco com o mesmo nome que você usar em `DATABASE_NAME` (o padrão do exemplo é `sistema_pequena_empresa`):

```sql
CREATE DATABASE sistema_pequena_empresa;
```

### 1.2 Aplicar o schema (`banco.sql`)

A partir da **raiz do repositório** (onde está `banco.sql`):

```bash
psql -h localhost -U postgres -d sistema_pequena_empresa -f banco.sql
```

Ajuste `-h`, `-U` e `-d` conforme seu ambiente. O script remove e recria objetos; use em banco dedicado ao projeto.

### 1.3 Seeds / dados de demonstração (`seed.sql`)

Opcional, mas necessário para o **login de demonstração** descrito abaixo:

```bash
psql -h localhost -U postgres -d sistema_pequena_empresa -f seed.sql
```

Se o login falhar após mudanças de senha, rode o `seed.sql` de novo (ele atualiza o hash do usuário demo).

## 2. API (`api/`) — porta **3001**

### Variáveis de ambiente

```bash
cd api
cp .env.example .env
```

Edite `api/.env`. Principais variáveis:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_*` | Host, porta, usuário, senha e nome do banco PostgreSQL. |
| `JWT_SECRET` | Segredo para assinatura do JWT (altere em produção). |
| `JWT_EXPIRES_SEGUNDOS` | Validade do token (padrão: 7 dias). |
| `PORT` | Porta HTTP da API (padrão do exemplo: **3001**). |
| `CORS_ORIGIN` | Origem do frontend no CORS (padrão: **http://localhost:3000**). **Deve coincidir com a URL do Next** (incluindo porta). |
| `TYPEORM_SYNC` | `false` em produção; se `true`, o TypeORM tenta sincronizar o schema (não substitui o uso recomendado de `banco.sql`). |
| `TYPEORM_LOGGING` | `true` para depurar SQL no console. |

### Instalar dependências e executar

```bash
cd api
npm install
npm run start:dev
```

- Documentação interativa (Swagger): **http://localhost:3001/api/docs** (se usar outra `PORT`, ajuste a URL).
- Prefixo global das rotas: **`/api`**.

## 3. Frontend (`frontend/`) — porta **3000**

### Variáveis de ambiente

```bash
cd frontend
cp .env.example .env.local
```

O arquivo [frontend/.env.example](frontend/.env.example) define a base da API. O valor deve incluir o prefixo **`/api`**:

```env
BACKEND_API_URL=http://localhost:3001/api
```

### CORS na API

Com o frontend em `http://localhost:3000`, em `api/.env` use (já está assim em `.env.example`):

```env
CORS_ORIGIN=http://localhost:3000
```

(Vários valores separados por vírgula também são aceitos pela API.)

### Instalar dependências e executar

```bash
cd frontend
npm install
npm run dev
```

O Next.js sobe na **3000** por padrão. Abra **http://localhost:3000**.

### Build de produção (referência)

```bash
cd frontend
npm run build
npm run start
```

## Ordem sugerida para a primeira execução

1. PostgreSQL ativo e banco criado.  
2. `psql ... -f banco.sql` e depois `psql ... -f seed.sql` (recomendado).  
3. `api/.env` a partir de `api/.env.example` (`PORT=3001`, `CORS_ORIGIN=http://localhost:3000`).  
4. `npm install` e `npm run start:dev` na pasta `api`.  
5. `frontend/.env.local` a partir de `frontend/.env.example` (`BACKEND_API_URL` apontando para a API).  
6. `npm install` e `npm run dev` na pasta `frontend`.

## Login de demonstração (após `seed.sql`)

| Campo | Valor |
|-------|--------|
| E-mail | `demo@sistema.local` |
| Senha | `senha123` |

## Documentação da API (contrato REST)

Detalhes de rotas, corpo das requisições e autenticação Bearer: [**api/README-API.md**](api/README-API.md).

## Repositório

Código-fonte: [https://github.com/WelersonMartins/senac-orcamentos](https://github.com/WelersonMartins/senac-orcamentos).
