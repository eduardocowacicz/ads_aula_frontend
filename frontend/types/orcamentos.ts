export type SituacaoOrcamento = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'CANCELADO';

export interface ItemOrcamento {
  id?: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  produto?: {
    id: number;
    nome: string;
    codigoSku: string;
    unidade: string;
  };
}

export interface Orcamento {
  id?: number;
  clienteId: number;
  situacao: SituacaoOrcamento;
  observacao?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
  total?: number;
  cliente?: {
    id: number;
    nome: string;
  };
  itens?: ItemOrcamento[];
}
