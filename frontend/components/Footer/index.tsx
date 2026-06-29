export default function Footer() {
  const ano = new Date().getFullYear();
  return (
    <footer
      className="mt-auto py-3 px-4 text-center"
      style={{
        background: "#1e293b",
        color: "#94a3b8",
        fontSize: "0.82rem",
        letterSpacing: "0.02em",
      }}
    >
      SENAC ORÇAMENTOS &copy; {ano} &mdash; Sistema de Gestão de Orçamentos
    </footer>
  );
}
