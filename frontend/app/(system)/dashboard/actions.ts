'use server';

import { apiServerFetch } from '@/lib/api-server';
import type {
  DashboardResumo,
  DashboardOrcamentosPorStatus,
  DashboardOrcamentosPorMes,
  DashboardValorOrcadoPorMes,
  DashboardTopClientesOrcamentos,
  DashboardTopProdutosOrcados,
} from '@/types/dashboard';

export async function getDashboardResumo(): Promise<DashboardResumo> {
  const res = await apiServerFetch('/dashboard/resumo');
  return res.json();
}

export async function getDashboardOrcamentosPorStatus(): Promise<DashboardOrcamentosPorStatus[]> {
  const res = await apiServerFetch('/dashboard/orcamentos-por-status');
  return res.json();
}

export async function getDashboardOrcamentosPorMes(ano: number = new Date().getFullYear()): Promise<DashboardOrcamentosPorMes[]> {
  const res = await apiServerFetch(`/dashboard/orcamentos-por-mes?ano=${ano}`);
  return res.json();
}

export async function getDashboardValorOrcadoPorMes(ano: number = new Date().getFullYear()): Promise<DashboardValorOrcadoPorMes[]> {
  const res = await apiServerFetch(`/dashboard/valor-orcado-por-mes?ano=${ano}`);
  return res.json();
}

export async function getDashboardTopClientesOrcamentos(limit: number = 10): Promise<DashboardTopClientesOrcamentos[]> {
  const res = await apiServerFetch(`/dashboard/top-clientes-orcamentos?limit=${limit}`);
  return res.json();
}

export async function getDashboardTopProdutosOrcados(limit: number = 10): Promise<DashboardTopProdutosOrcados[]> {
  const res = await apiServerFetch(`/dashboard/top-produtos-orcados?limit=${limit}`);
  return res.json();
}
