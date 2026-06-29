"use client";

import styles from "../Dashboard.module.css";

type Props = {
  titulo: string;
  valor: string;
  icone: string;
  cor?: "azul" | "verde" | "laranja" | "roxo";
};

export default function Indicador({ titulo, valor, icone, cor = "azul" }: Props) {
  return (
    <div className={`${styles.card} ${styles[cor]}`}>
      <div className={styles.cardIcone}>{icone}</div>
      <div className={styles.cardInfo}>
        <span className={styles.cardTitulo}>{titulo}</span>
        <span className={styles.cardValor}>{valor}</span>
      </div>
    </div>
  );
}
