import styles from "./Layout.module.css";

export default function Rodape() {
  return (
    <footer className={styles.rodape}>
      <div className={styles.rodapeBarra}>
        <span>SENAC Orçamentos &copy; {new Date().getFullYear()}</span>
        <span className={styles.rodapeInfo}>Sistema de gestão de orçamentos</span>
      </div>
    </footer>
  );
}
