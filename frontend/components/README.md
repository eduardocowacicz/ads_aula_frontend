# Pasta `components/` — Componentes reutilizáveis

Um **componente** é um pedaço de interface (uma função que devolve JSX) que você
pode reaproveitar em várias telas — um botão, uma tabela, um cabeçalho, um
modal. Aqui ficam os componentes que **não** são páginas (páginas ficam em
`app/`).

## Convenção de organização deste projeto

Cada componente fica em sua **própria pasta**, com um arquivo `index.tsx`:

```
components/
├── Notify/
│   └── index.tsx     →  import Notify from '@/components/Notify'
└── PaginaInicial/
    └── index.tsx     →  import PaginaInicial from '@/components/PaginaInicial'
```

Usar `Pasta/index.tsx` deixa o import curto (`@/components/Notify`) e permite
agrupar arquivos relacionados na mesma pasta (subcomponentes, estilos, etc.).
O `@/` é um atalho para a raiz do projeto (configurado no `tsconfig.json`).

> Não é obrigatório usar pasta + `index.tsx`. Um arquivo `components/Botao.tsx`
> também funciona. Mas siga o padrão acima para manter o projeto organizado.

## Server x Client Component

Vale a mesma regra das páginas (veja `app/README.md`): componentes são **Server
Components por padrão**. Se o componente usa `useState`, `useEffect`, `onClick`
ou qualquer interação no navegador, coloque `'use client'` na primeira linha.

## Componentes que já vêm prontos

### `Notify` — notificações (toasts)

Mostra mensagens flutuantes de sucesso/erro/aviso. O `<Notify />` já está
incluído no `app/layout.tsx` raiz. Para disparar uma mensagem, importe a função
`notify` **(só funciona em Client Components)**:

```tsx
'use client'
import { notify } from '@/components/Notify'

notify('Produto salvo com sucesso!')          // sucesso (padrão)
notify('Não foi possível salvar', 'danger')   // erro
notify('Atenção: campo vazio', 'warning')     // aviso
```

### `PaginaInicial` — tela inicial pública

A landing page mostrada em `/` (usada por `app/page.tsx`). Pode estilizar à
vontade.

## O que você vai criar aqui

À medida que construir as telas, vai precisar de componentes próprios, por
exemplo:

- `Header/` — cabeçalho com o nome do sistema.
- `Navegacao/` — menu com links (`/produtos`, `/clientes`, `/orcamentos`,
  `/usuario`) e um botão **Sair**. O botão Sair deve chamar a server action
  `logout`:

  ```tsx
  'use client'
  import { logout } from '@/app/(auth)/logout/actions'
  // ...
  <form action={logout}><button type="submit">Sair</button></form>
  ```

- `Footer/` — rodapé.
- Tabelas, formulários e modais das suas funcionalidades.

Depois importe esses componentes no `app/(system)/layout.tsx` (para a moldura)
ou nas suas páginas.
