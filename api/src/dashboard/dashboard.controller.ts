import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  DashboardResumoDto,
  OrcamentosPorStatusDto,
  SerieMensalQuantidadeDto,
  SerieMensalValorDto,
  TopClienteOrcamentosDto,
  TopProdutoOrcadoDto,
} from './dto/dashboard-relatorios.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo geral para cards do dashboard' })
  @ApiOkResponse({ type: DashboardResumoDto })
  async resumo() {
    return this.dashboardService.resumo();
  }

  @Get('orcamentos-por-status')
  @ApiOperation({ summary: 'Quantidade de orçamentos agrupada por status' })
  @ApiOkResponse({ type: [OrcamentosPorStatusDto] })
  async orcamentosPorStatus() {
    return this.dashboardService.orcamentosPorStatus();
  }

  @Get('orcamentos-por-mes')
  @ApiOperation({ summary: 'Quantidade mensal de orçamentos criados' })
  @ApiQuery({
    name: 'ano',
    required: false,
    description: 'Ano de referência. Se omitido, usa o ano atual.',
    schema: { type: 'integer', example: 2026 },
  })
  @ApiOkResponse({ type: [SerieMensalQuantidadeDto] })
  async orcamentosPorMes(@Query('ano') ano?: string) {
    return this.dashboardService.orcamentosPorMes(this.parseAno(ano));
  }

  @Get('valor-orcado-por-mes')
  @ApiOperation({ summary: 'Soma mensal do valor total dos orçamentos' })
  @ApiQuery({
    name: 'ano',
    required: false,
    description: 'Ano de referência. Se omitido, usa o ano atual.',
    schema: { type: 'integer', example: 2026 },
  })
  @ApiOkResponse({ type: [SerieMensalValorDto] })
  async valorOrcadoPorMes(@Query('ano') ano?: string) {
    return this.dashboardService.valorOrcadoPorMes(this.parseAno(ano));
  }

  @Get('top-clientes-orcamentos')
  @ApiOperation({ summary: 'Top clientes por quantidade de orçamentos' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Quantidade máxima de resultados (padrão 10, máximo 50).',
    schema: { type: 'integer', default: 10, minimum: 1, maximum: 50 },
  })
  @ApiOkResponse({ type: [TopClienteOrcamentosDto] })
  async topClientesOrcamentos(@Query('limit') limit?: string) {
    return this.dashboardService.topClientesOrcamentos(this.parseLimit(limit));
  }

  @Get('top-produtos-orcados')
  @ApiOperation({
    summary: 'Top produtos mais orçados por ocorrência em itens de orçamento',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Quantidade máxima de resultados (padrão 10, máximo 50).',
    schema: { type: 'integer', default: 10, minimum: 1, maximum: 50 },
  })
  @ApiOkResponse({ type: [TopProdutoOrcadoDto] })
  async topProdutosOrcados(@Query('limit') limit?: string) {
    return this.dashboardService.topProdutosOrcados(this.parseLimit(limit));
  }

  private parseAno(ano?: string): number | undefined {
    const n = ano !== undefined ? parseInt(ano, 10) : undefined;
    return Number.isFinite(n) ? n : undefined;
  }

  private parseLimit(limit?: string): number | undefined {
    const n = limit !== undefined ? parseInt(limit, 10) : undefined;
    return Number.isFinite(n) ? n : undefined;
  }
}
