# Documentação da API (protótipo)

REST JSON em **camelCase**. Prefixo global: **`/api`**. Sem paginação nas listagens. Identificadores (`id`, `clienteId`, `produtoId`, etc.) são **números inteiros** (SERIAL no PostgreSQL).

## Versão do Node.js

O `@nestjs/cli` (e dependências como `@angular-devkit/core`) declara suporte apenas a **Node 18.19+**, **20.11+** ou **22+**. O recomendado é usar **Node 20 LTS** ou **Node 22 LTS** (ex.: com [nvm](https://github.com/nvm-sh/nvm): na pasta `api`, `nvm install` / `nvm use` lê o arquivo [`.nvmrc`](./.nvmrc)).

### Opção: Docker Compose

Na raiz do monorepo, [`docker-compose.yml`](../docker-compose.yml) sobe PostgreSQL e a API; na primeira subida do volume, `banco.sql` e `seed.sql` são aplicados automaticamente. Variáveis como `DATABASE_HOST=db` e `JWT_SECRET` vêm do Compose (não é obrigatório ter `api/.env` para esse fluxo). Detalhes, portas e perfil opcional do frontend: seção **Docker Compose** em [README.md](../README.md).

## Como executar

1. Crie o banco e aplique o schema: [`../banco.sql`](../banco.sql).
2. (Opcional) Dados de demonstração: a partir da raiz do repositório, `psql ... -f seed.sql` ([arquivo na raiz](../seed.sql)).
3. Copie [`.env.example`](./.env.example) para `.env` e ajuste credenciais PostgreSQL e `JWT_SECRET` (no monorepo, `PORT` padrão é **3001** e `CORS_ORIGIN` aponta para o Next em **http://localhost:3000**).
4. Na pasta `api`: `npm install` e `npm run start:dev`.
5. Swagger UI: **http://localhost:3001/api/docs** (porta conforme `PORT` no `.env`; padrão do exemplo: 3001).

### Login de demonstração (após `seed.sql`)

- **E-mail:** `demo@sistema.local`
- **Senha:** `senha123`

### Login retorna “Credenciais inválidas”

1. Confirme que o **mesmo banco** configurado em `api/.env` (`DATABASE_*`) é o onde você rodou `banco.sql` e `seed.sql`.
2. Rode de novo o seed na raiz do repositório: `psql … -f seed.sql` — o script atualiza o hash da senha do demo mesmo se o e-mail já existir (não usa mais só `DO NOTHING` no usuário demo).
3. No PostgreSQL, verifique se o usuário existe:  
   `SELECT id, email, ativo FROM usuarios WHERE email = 'demo@sistema.local';`

---

## Rotas por módulo

As rotas abaixo refletem os módulos NestJS (`autenticacao`, `usuarios`, `clientes`, `produtos`, `orcamentos`, `dashboard`). Na documentação, agrupamos assim:

| Módulo na doc | Pastas / responsabilidade no código |
|----------------|-------------------------------------|
| **Login** | `autenticacao/login` + perfil do usuário autenticado (`usuarios/atual`) |
| **Clientes** | `clientes` |
| **Produtos** | `produtos` |
| **Orçamentos** | `orcamentos` |
| **Dashboard** | `dashboard` |

---

## Login

Inclui **entrada no sistema** e **perfil do usuário autenticado** (JWT).

### `POST /api/autenticacao/login`

Corpo:

```json
{
  "email": "demo@sistema.local",
  "senha": "senha123"
}
```

Resposta inclui `accessToken` (JWT).

| Método | Caminho | Auth |
|--------|---------|------|
| POST | `/api/autenticacao/login` | Não |

### Rotas protegidas (Bearer)

Depois do login, nas demais rotas envie:

```http
Authorization: Bearer <accessToken>
```

#### Perfil do usuário atual (`/api/usuarios/...`)

| Método | Caminho | Auth |
|--------|---------|------|
| GET | `/api/usuarios/atual` | Sim |
| PATCH | `/api/usuarios/atual` | Sim |
| PATCH | `/api/usuarios/atual/senha` | Sim |

**Redefinir senha**

`PATCH /api/usuarios/atual/senha`

```json
{
  "senhaAtual": "senha123",
  "novaSenha": "outraSenhaSegura"
}
```

---

## Clientes

| Método | Caminho | Auth |
|--------|---------|------|
| GET | `/api/clientes` | Sim |
| POST | `/api/clientes` | Sim |
| GET | `/api/clientes/:id` | Sim |
| PATCH | `/api/clientes/:id` | Sim |
| DELETE | `/api/clientes/:id` | Sim |

### Filtros opcionais

`GET /api/clientes?nome=...&documento=...`

---

## Produtos

| Método | Caminho | Auth |
|--------|---------|------|
| GET | `/api/produtos` | Sim |
| POST | `/api/produtos` | Sim |
| GET | `/api/produtos/:id` | Sim |
| PATCH | `/api/produtos/:id` | Sim |
| DELETE | `/api/produtos/:id` | Sim |

### Filtros opcionais

`GET /api/produtos?nome=...&ativo=true`

---

## Orçamentos

| Método | Caminho | Auth |
|--------|---------|------|
| GET | `/api/orcamentos` | Sim |
| GET | `/api/orcamentos/:id` | Sim |
| POST | `/api/orcamentos` | Sim |
| PATCH | `/api/orcamentos/:id` | Sim |

### Filtros opcionais

`GET /api/orcamentos?mes=5&ano=2026&situacao=pendente`

### Criar orçamento (payload composto)

`POST /api/orcamentos`

```json
{
  "clienteId": 1,
  "valorDesconto": 10,
  "validoAte": "2026-12-31",
  "observacoes": "Entrega em 15 dias",
  "situacao": "pendente",
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2,
      "precoUnitario": 189.9
    },
    {
      "produtoId": 2,
      "quantidade": 1
    }
  ]
}
```

- `precoUnitario` em cada item é **opcional**; se omitido, usa o preço atual do produto.
- O servidor recalcula `subtotal`, aplica `valorDesconto` e persiste cabeçalho + linhas em transação.

### Atualizar orçamento

`PATCH /api/orcamentos/:id` — campos opcionais. Se enviar `itens`, **todas as linhas antigas são substituídas** pelas novas.

---

## Dashboard

Todas as rotas abaixo são protegidas por Bearer JWT e retornam dados agregados para gráficos e cards.

| Método | Caminho | Auth |
|--------|---------|------|
| GET | `/api/dashboard/resumo` | Sim |
| GET | `/api/dashboard/orcamentos-por-status` | Sim |
| GET | `/api/dashboard/orcamentos-por-mes?ano=2026` | Sim |
| GET | `/api/dashboard/valor-orcado-por-mes?ano=2026` | Sim |
| GET | `/api/dashboard/top-clientes-orcamentos?limit=10` | Sim |
| GET | `/api/dashboard/top-produtos-orcados?limit=10` | Sim |

### `GET /api/dashboard/resumo`

```json
{
  "totalOrcamentos": 25,
  "totalClientes": 12,
  "totalProdutosAtivos": 10
}
```

### `GET /api/dashboard/orcamentos-por-status`

Retorna todas as situações conhecidas, com `0` quando não houver registros.

```json
[
  { "situacao": "pendente", "total": 8 },
  { "situacao": "enviado", "total": 5 },
  { "situacao": "aprovado", "total": 7 },
  { "situacao": "rejeitado", "total": 3 },
  { "situacao": "cancelado", "total": 2 }
]
```

### `GET /api/dashboard/orcamentos-por-mes?ano=2026`

`ano` é opcional; se omitido, usa o ano atual. Retorna os 12 meses.

```json
[
  { "ano": 2026, "mes": 1, "total": 3 },
  { "ano": 2026, "mes": 2, "total": 6 }
]
```

### `GET /api/dashboard/valor-orcado-por-mes?ano=2026`

`ano` é opcional; se omitido, usa o ano atual. `total` representa a soma mensal de `orcamentos.total`.

```json
[
  { "ano": 2026, "mes": 1, "total": 12500.5 },
  { "ano": 2026, "mes": 2, "total": 9800 }
]
```

### `GET /api/dashboard/top-clientes-orcamentos?limit=10`

`limit` é opcional, com padrão `10` e máximo `50`.

```json
[
  { "clienteId": 3, "nome": "Móveis Planejados Costa", "totalOrcamentos": 9 }
]
```

### `GET /api/dashboard/top-produtos-orcados?limit=10`

Top produtos por quantidade de ocorrências em `itens_orcamento` (contagem de linhas). `limit` é opcional, com padrão `10` e máximo `50`.

```json
[
  { "produtoId": 1, "nome": "MDF 18mm branco 2,75x1,84m", "totalOcorrencias": 12 }
]
```

---

## Erros

Corpo típico:

```json
{
  "mensagem": "Texto em português",
  "codigo": "VALIDACAO",
  "detalhes": []
}
```

HTTP usuais: `400`, `401`, `404`, `409`, `422`.

## Datas

Respostas usam ISO 8601 (`timestamptz` no PostgreSQL).
