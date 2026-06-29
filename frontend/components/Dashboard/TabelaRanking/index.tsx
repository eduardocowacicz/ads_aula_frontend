"use client";

import styles from "../Dashboard.module.css";
import type {
  DashboardTopClientesOrcamentos,
  DashboardTopProdutosOrcados,
} from "@/types/dashboard";

type Props =
  | { tipo: "clientes"; dados: DashboardTopClientesOrcamentos[] }
  | { tipo: "produtos";  dados: DashboardTopProdutosOrcados[] };

export default function TabelaRanking({ tipo, dados }: Props) {
  return (
    <table className={`table ${styles.tabelaRanking}`}>
      <thead>
        <tr>
          <th>#</th>
          <th>{tipo === "clientes" ? "Cliente" : "Produto"}</th>
          <th>{tipo === "clientes" ? "Orçamentos" : "Qtd. Orçada"}</th>
        </tr>
      </thead>
      <tbody>
        {dados.length === 0 ? (
          <tr>
            <td colSpan={3} className={styles.vazio}>Sem dados.</td>
          </tr>
        ) : (
          dados.map((item, i) => (
            <tr key={i}>
              <td className={styles.rankPos}>#{i + 1}</td>
              <td>
                {(item as any).nome}
              </td>
              <td className={styles.rankValor}>
                {tipo === "clientes"
                  ? (item as DashboardTopClientesOrcamentos).totalOrcamentos
                  : (item as DashboardTopProdutosOrcados).totalOcorrencias}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
