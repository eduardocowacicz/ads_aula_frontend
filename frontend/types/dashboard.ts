export interface DashboardResumo {
  totalOrcamentos: number;
  valorTotalOrcado: number;
  totalClientes: number;
  totalProdutosAtivos: number;
}

export interface DashboardOrcamentosPorStatus {
  situacao: string;
  total: number;
}

export interface DashboardOrcamentosPorMes {
  mes: number;
  ano: number;
  total: number;
}

export interface DashboardValorOrcadoPorMes {
  mes: number;
  ano: number;
  total: number;
}

export interface DashboardTopClientesOrcamentos {
  clienteId: number;
  nome: string;
  totalOrcamentos: number;
}

export interface DashboardTopProdutosOrcados {
  produtoId: number;
  nome: string;
  totalOcorrencias: number;
}
