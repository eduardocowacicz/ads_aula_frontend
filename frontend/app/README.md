# Pasta `app/` — Roteamento e telas (App Router)

Esta é a pasta mais importante do projeto. **No Next.js (App Router), a
estrutura de pastas dentro de `app/` define as rotas (URLs) da aplicação.**
Não existe um arquivo de configuração de rotas: a **pasta vira a URL**.

> ⚠️ Você talvez tenha visto exemplos antigos com uma pasta `pages/`. Aqui é
> diferente: usamos o **App Router**, baseado em `app/`. Use a documentação do
> "App Router": https://nextjs.org/docs/app

---

## 1. Os arquivos especiais

Dentro de `app/` (e suas subpastas), alguns nomes de arquivo têm significado:

| Arquivo        | O que faz                                                                 |
|----------------|---------------------------------------------------------------------------|
| `page.tsx`     | A **tela** de uma rota. Sem `page.tsx`, a pasta não vira uma URL acessível |
| `layout.tsx`   | **Moldura** compartilhada que "abraça" as páginas filhas (`{children}`)    |
| `actions.ts`   | **Server Actions**: funções que rodam no servidor (ex.: enviar formulário) |
| `loading.tsx`  | Tela de carregamento exibida enquanto a página carrega (opcional)          |
| `not-found.tsx`| Tela de "404 - não encontrado" (opcional)                                  |
| `globals.css`  | Estilos globais (importado no `layout.tsx` raiz)                           |

## 2. Pasta = URL

```
app/page.tsx                    →  /
app/(system)/home/page.tsx      →  /home
app/produtos/page.tsx           →  /produtos
app/produtos/novo/page.tsx      →  /produtos/novo
```

### Rotas dinâmicas: `[id]`

Uma pasta com nome entre colchetes vira um **parâmetro** da URL:

```
app/produtos/[id]/page.tsx      →  /produtos/1, /produtos/2, /produtos/qualquer-coisa
```

O valor chega na página assim:

```tsx
export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <h1>Produto {id}</h1>
}
```

## 3. Route Groups: as pastas com `(parênteses)`

Pastas com nome entre parênteses **organizam** o código **sem** virar parte da
URL. Usamos dois grupos:

- **`(auth)`** → telas públicas de autenticação. URL: `/login`, **não**
  `/auth/login`. Tem seu próprio `layout.tsx` (centraliza o card na tela).
- **`(system)`** → telas internas (logado). URL: `/home`, `/produtos`, etc.
  Seu `layout.tsx` é onde você vai montar a moldura (cabeçalho, menu, rodapé).

```
app/
├── layout.tsx              ← layout RAIZ (envolve TODAS as telas: <html>, <body>)
├── page.tsx                ← tela inicial pública  (/)
├── (auth)/
│   ├── layout.tsx          ← moldura das telas de login
│   ├── login/page.tsx      ← /login
│   └── logout/actions.ts   ← ação de logout (sem tela)
└── (system)/
    ├── layout.tsx          ← moldura das telas internas (FAÇA SEU MENU AQUI)
    └── home/page.tsx       ← /home
```

## 4. Server Components x Client Components

**Por padrão, todo componente no App Router roda no SERVIDOR** (Server
Component). Isso é ótimo para buscar dados: você pode chamar a API direto, com
segurança, sem expor o token ao navegador.

Quando o componente precisa de **interatividade no navegador** (cliques que
mudam estado, `useState`, `useEffect`, eventos), coloque a diretiva
`'use client'` na **primeira linha** do arquivo. Aí ele vira um Client
Component.

```tsx
// Server Component (padrão) — pode buscar dados da API
import { apiServerFetch } from '@/lib/api-server'

export default async function ProdutosPage() {
  const res = await apiServerFetch('/produtos')
  const produtos = await res.json()
  return <ul>{produtos.map((p) => <li key={p.id}>{p.nome}</li>)}</ul>
}
```

```tsx
'use client' // ← Client Component — pode usar useState, onClick, etc.
import { useState } from 'react'

export default function Contador() {
  const [n, setN] = useState(0)
  return <button onClick={() => setN(n + 1)}>Cliquei {n}x</button>
}
```

**Regra prática:** comece tudo como Server Component. Só adicione `'use client'`
quando precisar de interação no navegador.

## 5. Server Actions (`actions.ts`)

São funções que rodam **no servidor** e podem ser chamadas a partir de um
formulário ou de um botão — ótimas para criar/editar/excluir dados. O arquivo
(ou a função) começa com `'use server'`. Veja exemplos em
`app/(auth)/login/actions.ts` e `logout/actions.ts`.

```tsx
// app/produtos/actions.ts
'use server'
import { apiServerFetch } from '@/lib/api-server'

export async function criarProduto(formData: FormData) {
  await apiServerFetch('/produtos', {
    method: 'POST',
    body: JSON.stringify({ nome: formData.get('nome') }),
  })
}
```

```tsx
// uso em uma page.tsx
import { criarProduto } from './actions'
export default function Page() {
  return (
    <form action={criarProduto}>
      <input name="nome" />
      <button type="submit">Salvar</button>
    </form>
  )
}
```

## 6. Navegação entre páginas

Use o componente `<Link>` (não use `<a>` puro para rotas internas):

```tsx
import Link from 'next/link'
<Link href="/produtos">Ver produtos</Link>
```

---

## ✅ Passo a passo: criando a rota `/produtos`

1. Crie a pasta `app/(system)/produtos/`.
2. Dentro dela, crie `page.tsx` exportando um componente default.
3. Para listar dados: no Server Component, use `apiServerFetch('/produtos')`
   (veja `lib/README.md`).
4. Para criar/editar/excluir: crie um `actions.ts` com `'use server'`.
5. Defina os tipos dos dados em `types/` (veja `types/README.md`).
6. Acesse **http://localhost:3000/produtos**. Pronto!
