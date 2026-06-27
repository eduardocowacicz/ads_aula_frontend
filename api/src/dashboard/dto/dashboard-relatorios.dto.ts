import { ApiProperty } from '@nestjs/swagger';
import { SituacaoOrcamento } from '../../dominio/situacao-orcamento';

export class DashboardResumoDto {
  @ApiProperty({ example: 25 })
  totalOrcamentos: number;

  @ApiProperty({ example: 12 })
  totalClientes: number;

  @ApiProperty({ example: 10 })
  totalProdutosAtivos: number;
}

export class OrcamentosPorStatusDto {
  @ApiProperty({ enum: SituacaoOrcamento, example: SituacaoOrcamento.pendente })
  situacao: SituacaoOrcamento;

  @ApiProperty({ example: 8 })
  total: number;
}

export class SerieMensalQuantidadeDto {
  @ApiProperty({ example: 2026 })
  ano: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 12 })
  mes: number;

  @ApiProperty({ example: 6 })
  total: number;
}

export class SerieMensalValorDto {
  @ApiProperty({ example: 2026 })
  ano: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 12 })
  mes: number;

  @ApiProperty({ example: 12500.5 })
  total: number;
}

export class TopClienteOrcamentosDto {
  @ApiProperty({ example: 3 })
  clienteId: number;

  @ApiProperty({ example: 'Móveis Planejados Costa' })
  nome: string;

  @ApiProperty({ example: 9 })
  totalOrcamentos: number;
}

export class TopProdutoOrcadoDto {
  @ApiProperty({ example: 1 })
  produtoId: number;

  @ApiProperty({ example: 'MDF 18mm branco 2,75x1,84m' })
  nome: string;

  @ApiProperty({ example: 12 })
  totalOcorrencias: number;
}
