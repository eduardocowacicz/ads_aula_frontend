/*
 * Layout da área autenticada (route group "(system)").
 *
 * Todo arquivo `page.tsx` dentro de (system) é renderizado aqui no lugar de
 * {children}. Este é o lugar para a MOLDURA do sistema: cabeçalho, menu de
 * navegação, rodapé, etc. — partes que se repetem em todas as telas internas.
 *
 * Hoje ele é só um esqueleto. PARTE DO SEU TRABALHO é construir:
 *   - um cabeçalho (Header) com o nome do sistema;
 *   - uma navegação (links para /produtos, /clientes, /orcamentos, /usuario);
 *   - um botão "Sair" que chama a server action `logout`
 *     (de "@/app/(auth)/logout/actions") dentro de um <form action={logout}>.
 *
 * Crie esses componentes em /components e importe-os aqui.
 */
export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {/* TODO: <Header /> e <Navegacao /> aqui */}
      <main>{children}</main>
      {/* TODO: <Footer /> aqui */}
    </div>
  );
}
