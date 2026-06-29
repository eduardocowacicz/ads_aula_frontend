"use client";

import { useEffect, useState } from "react";
import Indicador from "./Indicador";
import GraficoPizza from "./GraficoPizza";
import GraficoLinha from "./GraficoLinha";
import TabelaRanking from "./TabelaRanking";
import styles from "./Dashboard.module.css";
import {
  getDashboardResumo,
  getDashboardOrcamentosPorStatus,
  getDashboardOrcamentosPorMes,
  getDashboardValorOrcadoPorMes,
  getDashboardTopClientesOrcamentos,
  getDashboardTopProdutosOrcados,
} from "@/app/(system)/dashboard/actions";
import { getOrcamentos } from "@/app/(system)/orcamentos/actions";
import type {
  DashboardResumo,
  DashboardOrcamentosPorStatus,
  DashboardOrcamentosPorMes,
  DashboardValorOrcadoPorMes,
  DashboardTopClientesOrcamentos,
  DashboardTopProdutosOrcados,
} from "@/types/dashboard";

export default function Dashboard() {
  const [carregando, setCarregando] = useState(true);
  const [resumo,         setResumo]         = useState<DashboardResumo | null>(null);
  const [porStatus,      setPorStatus]      = useState<DashboardOrcamentosPorStatus[]>([]);
  const [porMes,         setPorMes]         = useState<DashboardOrcamentosPorMes[]>([]);
  const [valorPorMes,    setValorPorMes]    = useState<DashboardValorOrcadoPorMes[]>([]);
  const [topClientes,    setTopClientes]    = useState<DashboardTopClientesOrcamentos[]>([]);
  const [topProdutos,    setTopProdutos]    = useState<DashboardTopProdutosOrcados[]>([]);

  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getDashboardResumo(),
      getDashboardOrcamentosPorStatus(),
      getDashboardOrcamentosPorMes(),
      getDashboardValorOrcadoPorMes(),
      getDashboardTopClientesOrcamentos(),
      getDashboardTopProdutosOrcados(),
      getOrcamentos({ situacao: "aprovado" })
    ]).then(([res, status, mes, _valorMes, clientes, produtos, orcamentosAprovados]) => {
      // Manual sum for approved budgets
      const totalOrcado = orcamentosAprovados.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
      
      // Manual chart data for approved budgets
      const anoAtual = new Date().getFullYear();
      const chartMap = new Map<number, number>();
      for (const o of orcamentosAprovados) {
        const d = new Date(o.criadoEm || o.dataCriacao || "");
        if (d.getFullYear() === anoAtual) {
           const m = d.getMonth() + 1;
           chartMap.set(m, (chartMap.get(m) || 0) + Number(o.total || 0));
        }
      }
      const valorMesCalculado = Array.from({ length: 12 }, (_, i) => ({
         mes: i + 1,
         ano: anoAtual,
         total: chartMap.get(i + 1) || 0
      }));

      setResumo({ ...res, valorTotalOrcado: totalOrcado });
      setPorStatus(status);
      setPorMes(mes);
      setValorPorMes(valorMesCalculado);
      setTopClientes(clientes);
      setTopProdutos(produtos);
    }).catch(() => {
      setErro("Não foi possível carregar o dashboard. Verifique se a API está em execução.");
    }).finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className={styles.loading}>
        <div className="spinner-border text-primary" role="status" />
        <span>Carregando dashboard...</span>
      </div>
    );
  }

  if (erro) {
    return <div className="alert alert-danger m-4">{erro}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.titulo}>Dashboard</h1>

      {/* Cards de resumo */}
      <div className={styles.cards}>
        <Indicador
          titulo="Total de Orçamentos"
          valor={String(resumo?.totalOrcamentos ?? 0)}
          icone="📋"
          cor="azul"
        />
        <Indicador
          titulo="Valor Total Orçado"
          valor={(resumo?.valorTotalOrcado ?? 0).toLocaleString("pt-BR", {
            style: "currency", currency: "BRL",
          })}
          icone="💰"
          cor="verde"
        />
        <Indicador
          titulo="Clientes"
          valor={String(resumo?.totalClientes ?? 0)}
          icone="👥"
          cor="laranja"
        />
        <Indicador
          titulo="Produtos"
          valor={String(resumo?.totalProdutosAtivos ?? 0)}
          icone="📦"
          cor="roxo"
        />
      </div>

      {/* Gráficos */}
      <div className={styles.graficos}>
        <div className={styles.graficoCard}>
          <h2 className={styles.graficoTitulo}>Orçamentos por Situação</h2>
          <div className={styles.graficoPizzaWrapper}>
            <GraficoPizza dados={porStatus} />
          </div>
        </div>

        <div className={styles.graficoCard}>
          <h2 className={styles.graficoTitulo}>Orçamentos por Mês</h2>
          <GraficoLinha tipo="quantidade" dados={porMes} />
        </div>

        <div className={styles.graficoCard}>
          <h2 className={styles.graficoTitulo}>Valor Orçado por Mês</h2>
          <GraficoLinha tipo="valor" dados={valorPorMes} />
        </div>
      </div>

      {/* Rankings */}
      <div className={styles.rankings}>
        <div className={styles.rankingCard}>
          <h2 className={styles.graficoTitulo}>🏆 Top Clientes</h2>
          <TabelaRanking tipo="clientes" dados={topClientes} />
        </div>
        <div className={styles.rankingCard}>
          <h2 className={styles.graficoTitulo}>🏆 Top Produtos</h2>
          <TabelaRanking tipo="produtos" dados={topProdutos} />
        </div>
      </div>
    </div>
  );
}
