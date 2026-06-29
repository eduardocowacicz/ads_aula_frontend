export type SituacaoOrcamento =
  | 'pendente'
  | 'enviado'
  | 'aprovado'
  | 'rejeitado'
  | 'cancelado';

export interface ItemOrcamento {
  id?: number;
  produtoId: number;
  nomeProdutoRegistro?: string;
  precoUnitarioRegistro?: number;
  quantidade: number;
  totalLinha?: number;
}

export interface Orcamento {
  id?: number;
  clienteId: number;
  situacao: SituacaoOrcamento;
  subtotal?: number;
  valorDesconto?: number;
  total?: number;
  validoAte?: string | null;
  observacoes?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
  cliente?: {
    id: number;
    nome: string;
    documento?: string | null;
    email?: string | null;
    telefone?: string | null;
  };
  itens?: ItemOrcamento[];
}

export interface OrcamentoPayload {
  clienteId: number;
  situacao?: SituacaoOrcamento;
  valorDesconto?: number;
  validoAte?: string;
  observacoes?: string;
  itens: { produtoId: number; quantidade: number; precoUnitario?: number }[];
}
