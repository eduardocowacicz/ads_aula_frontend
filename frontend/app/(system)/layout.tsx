import Cabecalho from "@/components/Layout/Cabecalho";
import Rodape from "@/components/Layout/Rodape";
import styles from "@/components/Layout/Layout.module.css";

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.shell}>
      <Cabecalho />
      <main className={styles.conteudo}>{children}</main>
      <Rodape />
    </div>
  );
}
