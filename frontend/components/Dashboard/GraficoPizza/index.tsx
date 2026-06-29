"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { DashboardOrcamentosPorStatus } from "@/types/dashboard";

ChartJS.register(ArcElement, Tooltip, Legend);

const CORES = [
  "#fef08a", // pendente - amarelo
  "#a7f3d0", // enviado - verde claro
  "#86efac", // aprovado - verde
  "#fca5a5", // rejeitado - vermelho
  "#cbd5e1", // cancelado - cinza
];

type Props = {
  dados: DashboardOrcamentosPorStatus[];
};

export default function GraficoPizza({ dados }: Props) {
  const data = {
    labels: dados.map((d) => d.situacao),
    datasets: [
      {
        data: dados.map((d) => d.total),
        backgroundColor: CORES,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <Pie
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
            },
          },
        },
      }}
    />
  );
}
