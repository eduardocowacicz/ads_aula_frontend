# Pasta `public/` — Arquivos estáticos

Tudo que você colocar aqui é servido **diretamente na raiz do site**. Um arquivo
`public/logo.svg` fica acessível em `http://localhost:3000/logo.svg`.

Use para: imagens, ícones, logos, fontes, `favicon`, PDFs — qualquer arquivo
que o navegador baixa "como está".

## Como referenciar

O caminho começa em `/` (a barra representa a pasta `public/`, **não** escreva
`/public/`):

```tsx
// com a tag <img> comum
<img src="/logo.svg" alt="Logo" />
```

### Imagens com `next/image` (recomendado)

O Next tem um componente `<Image>` que otimiza imagens automaticamente
(tamanho, formato, carregamento). Para imagens locais é preciso informar
`width` e `height`:

```tsx
import Image from 'next/image'

<Image src="/logo.svg" alt="Logo" width={40} height={40} />
```

## Arquivos que já estão aqui

- `logo.svg` — logo usada na tela inicial.
- `favicon` — o ícone fica em `app/favicon.ico`.
- Outros `.svg` de exemplo (`file`, `globe`, `next`, `vercel`, `window`) que
  vieram do template do Next — pode apagar os que não usar.

> Não coloque aqui arquivos secretos (chaves, `.env`): tudo em `public/` fica
> **público** na internet.
