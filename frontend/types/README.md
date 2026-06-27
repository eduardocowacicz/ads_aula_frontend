# Pasta `types/` — Tipos do TypeScript

Aqui você descreve, com **tipos/interfaces do TypeScript**, o formato dos dados
que circulam na aplicação — principalmente as respostas da API. Isso dá
autocomplete no editor e avisa erros antes de rodar (ex.: acessar um campo que
não existe).

> Esta pasta começa vazia (só com este README). **Você vai criar os tipos** das
> suas funcionalidades.

## Por que usar tipos?

Sem tipo, o editor não sabe o que existe dentro de um objeto:

```ts
const produto = await res.json()   // tipo: any  → sem ajuda, sem checagem
produto.nme                        // erro de digitação passa batido 😬
```

Com tipo, o editor te ajuda e aponta erros:

```ts
const produto: Produto = await res.json()
produto.nme   // ❌ o editor avisa: 'nme' não existe em 'Produto'
```

## Como criar um tipo

Crie um arquivo por domínio (ex.: `produtos.ts`) espelhando o que a API
devolve. Confira os campos reais no **Swagger** da API
(`http://localhost:3001/api/docs`).

```ts
// types/produtos.ts
export interface Produto {
  id: number
  nome: string
  preco: number
  descricao?: string   // o '?' indica campo opcional
}

// para criar um produto (sem o id, que a API gera)
export interface NovoProduto {
  nome: string
  preco: number
  descricao?: string
}
```

E use onde precisar:

```ts
import type { Produto } from '@/types/produtos'

const produtos: Produto[] = await res.json()
```

> Dica: `Produto[]` significa "uma lista de Produto". `type { ... }` no import
> deixa claro que você está importando apenas um tipo (não código executável).

## Sugestão de arquivos para o projeto

`produtos.ts`, `clientes.ts`, `orcamentos.ts`, `usuario.ts` — um por área do
sistema. Organize como fizer mais sentido para você.
