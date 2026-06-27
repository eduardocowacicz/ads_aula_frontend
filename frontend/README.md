# Frontend — Sistema de Orçamentos (base do projeto)

Este é o **esqueleto** do front-end que você vai evoluir durante a disciplina.
Ele já vem com o essencial funcionando (login, autenticação, layout base) e
**você constrói as telas de funcionalidades**.

> Feito com **Next.js 16** usando o **App Router**. Se você já ouviu falar em
> "pages" no Next, esqueça por enquanto: aqui o roteamento é por **pastas**
> dentro de `app/`. Veja `app/README.md`.

---

## 1. Pré-requisitos

- **Node.js 20 ou 22** (LTS). Confira com `node -v`.
- A **API** rodando (é o back-end deste projeto). Veja o `README.md` na raiz do
  repositório — o jeito mais simples é subir com Docker:
  `docker compose up -d db api` (a API fica em `http://localhost:3001`).

## 2. Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Crie o arquivo de variáveis de ambiente
cp .env.example .env.local

# 3. Suba o servidor de desenvolvimento
npm run dev
```

Abra **http://localhost:3000**.

### Variáveis de ambiente (`.env.local`)

| Variável          | Para que serve                                            |
|-------------------|-----------------------------------------------------------|
| `BACKEND_API_URL` | Endereço base da API. Padrão: `http://localhost:3001/api` |

> `.env.local` **não** é versionado (está no `.gitignore`). O `.env.example` é o
> modelo — copie e ajuste.

## 3. Scripts disponíveis

| Comando         | O que faz                                            |
|-----------------|------------------------------------------------------|
| `npm run dev`   | Servidor de desenvolvimento (recarrega ao salvar)    |
| `npm run build` | Compila a versão de produção (bom para achar erros)  |
| `npm run start` | Roda a versão compilada                              |
| `npm run lint`  | Verifica problemas de código com o ESLint            |

---

## 4. Como a autenticação funciona (leia com atenção!)

O fluxo de login já está pronto. Entender ele te ajuda a montar suas telas:

1. **Login** (`app/(auth)/login`): você digita email e senha. A *server action*
   `login` chama a API (`/autenticacao/login`); se as credenciais estiverem
   corretas, a API devolve um **token JWT** e ele é guardado em um **cookie**
   chamado `jwt-token` (cookie `httpOnly` — invisível ao JavaScript do
   navegador, por segurança).
2. **Proteção de rotas** (`proxy.ts`): antes de cada página carregar, esse
   arquivo verifica se existe o cookie. Sem token → redireciona para `/login`.
3. **Chamadas à API** (`lib/api-server.ts`): a função `apiServerFetch` lê o
   cookie e manda o token no cabeçalho `Authorization: Bearer <token>` em toda
   requisição. **Use sempre essa função** para falar com a API a partir do
   servidor.
4. **Logout** (`app/(auth)/logout`): apaga o cookie e volta para `/login`.

```
Login → grava cookie jwt-token → proxy.ts protege as rotas → apiServerFetch envia o token → API responde
```

---

## 5. O que já vem pronto x o que você vai construir

**Já pronto (não precisa mexer, mas pode estilizar):**

- Tela inicial pública (`app/page.tsx`) e login/logout (`app/(auth)/...`).
- Proteção de rotas (`proxy.ts`) e fetch autenticado (`lib/api-server.ts`).
- Sistema de notificações/toasts (`components/Notify`) — função `notify()`.
- Layouts base (`app/layout.tsx`, `app/(auth)/layout.tsx`,
  `app/(system)/layout.tsx`) e a página `app/(system)/home`.

**Você vai construir (rotas + componentes + tipos):**

- `/produtos` — lista e cadastro de produtos
- `/clientes` — lista e cadastro de clientes
- `/orcamentos` — lista e cadastro de orçamentos
- `/usuario` — tela de perfil do usuário
- (e o que mais o enunciado da atividade pedir, como um dashboard)
- A **moldura** do sistema (cabeçalho, menu de navegação, rodapé) dentro de
  `app/(system)/layout.tsx`.
- Os **estilos** — escolha entre usar as classes do Bootstrap (já incluído),
  CSS Modules, ou CSS puro.

---

## 6. Mapa das pastas (cada uma tem seu próprio README)

| Pasta         | O que é                                              |
|---------------|------------------------------------------------------|
| `app/`        | **Rotas e telas** (App Router). Comece por aqui.     |
| `components/` | Componentes React reutilizáveis.                     |
| `lib/`        | Funções utilitárias e de acesso à API.               |
| `types/`      | Tipos/interfaces TypeScript dos dados.               |
| `public/`     | Arquivos estáticos (imagens, ícones).                |
| `proxy.ts`    | "Porteiro" que protege as rotas (autenticação).      |

📖 **Documentação oficial do Next.js:** https://nextjs.org/docs/app
