# Pasta `lib/` — Funções utilitárias e acesso à API

Aqui ficam funções de apoio que **não** são componentes de tela: acesso à API,
formatações, cálculos, helpers em geral. A ideia é não repetir código —
escreva uma vez aqui e reutilize nas páginas e componentes.

## `api-server.ts` — falando com a API (com o token!)

Este é o arquivo **mais importante** da pasta. A função `apiServerFetch` é a
forma padrão de chamar a API: ela lê o token JWT do cookie e o envia
automaticamente no cabeçalho `Authorization`. **Use sempre ela** em vez de
`fetch` direto para endpoints protegidos.

```ts
import { apiServerFetch } from '@/lib/api-server'
```

> ⚠️ Ela tem `import 'server-only'` no topo: **só pode ser usada no servidor**
> (Server Components e Server Actions). Isso é proposital — o token nunca vai
> para o navegador. Não tente importá-la em um componente `'use client'`.

### Exemplo: listar (GET) em um Server Component

```tsx
import { apiServerFetch } from '@/lib/api-server'

export default async function ProdutosPage() {
  const res = await apiServerFetch('/produtos')      // GET por padrão
  if (!res.ok) throw new Error('Falha ao carregar produtos')
  const produtos = await res.json()

  return (
    <ul>
      {produtos.map((p) => <li key={p.id}>{p.nome}</li>)}
    </ul>
  )
}
```

### Exemplo: criar (POST) em uma Server Action

```ts
'use server'
import { apiServerFetch } from '@/lib/api-server'

export async function criarProduto(formData: FormData) {
  const res = await apiServerFetch('/produtos', {
    method: 'POST',
    body: JSON.stringify({
      nome: formData.get('nome'),
      preco: Number(formData.get('preco')),
    }),
  })
  return { ok: res.ok }
}
```

> `apiServerFetch` já define `Content-Type: application/json`, então basta
> mandar o `body` com `JSON.stringify(...)`. Os métodos seguem o padrão HTTP:
> `GET` (listar), `POST` (criar), `PUT`/`PATCH` (editar), `DELETE` (excluir).

### De onde vem o endereço da API?

Do `.env.local`, na variável `BACKEND_API_URL` (padrão
`http://localhost:3001/api`). Por isso você passa só o caminho relativo
(`/produtos`) para o `apiServerFetch`.

📖 Endpoints disponíveis: veja a documentação **Swagger** da API em
`http://localhost:3001/api/docs` com a API rodando.

## Criando seus próprios utilitários

Pode adicionar arquivos aqui conforme a necessidade. Exemplos comuns:

```ts
// lib/format.ts
export function formatarMoeda(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}
```

E usar onde precisar: `import { formatarMoeda } from '@/lib/format'`.
