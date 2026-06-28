export interface Produto {
  id?: number;
  codigoSku: string;
  nome: string;
  descricao?: string;
  precoUnitario: number;
  unidade: string;
  ativo: boolean;
}
