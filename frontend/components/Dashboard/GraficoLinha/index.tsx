"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { DashboardOrcamentosPorMes, DashboardValorOrcadoPorMes } from "@/types/dashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MESES_LABEL = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

type Props =
  | { tipo: "quantidade"; dados: DashboardOrcamentosPorMes[] }
  | { tipo: "valor";      dados: DashboardValorOrcadoPorMes[] };

export default function GraficoLinha({ tipo, dados }: Props) {
  const labels = dados.map((d) => `${MESES_LABEL[d.mes - 1]}/${d.ano}`);

  const valores =
    tipo === "quantidade"
      ? (dados as DashboardOrcamentosPorMes[]).map((d) => d.total)
      : (dados as DashboardValorOrcadoPorMes[]).map((d) => d.total);

  const data = {
    labels,
    datasets: [
      {
        label: tipo === "quantidade" ? "Orçamentos" : "Valor Orçado (R$)",
        data: valores,
        backgroundColor: tipo === "quantidade" ? "#93c5fd" : "#6ee7b7",
        borderColor:     tipo === "quantidade" ? "#1d4ed8" : "#059669",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                tipo === "valor"
                  ? ` R$ ${Number(ctx.parsed.y).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : ` ${ctx.parsed.y} orçamento(s)`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
          x: { grid: { display: false } },
        },
      }}
    />
  );
}
