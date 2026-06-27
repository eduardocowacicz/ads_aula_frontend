import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsuarioJwt } from '../compartilhado/decorators/usuario-jwt.decorator';
import { SituacaoOrcamento } from '../dominio/situacao-orcamento';
import { Usuario } from '../entidades/usuario.entidade';
import { AtualizarOrcamentoDto } from './dto/atualizar-orcamento.dto';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { OrcamentosService } from './orcamentos.service';

@ApiTags('orcamentos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('orcamentos')
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista orçamentos (filtros opcionais: mes, ano, situacao)',
  })
  @ApiQuery({
    name: 'mes',
    required: false,
    description: 'Filtra pelo mês (1–12)',
    schema: { type: 'integer', minimum: 1, maximum: 12 },
  })
  @ApiQuery({
    name: 'ano',
    required: false,
    description: 'Filtra pelo ano (ex.: 2026)',
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'situacao',
    required: false,
    enum: SituacaoOrcamento,
    description: 'Filtra pela situação do orçamento',
  })
  async listar(
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
    @Query('situacao') situacao?: SituacaoOrcamento,
  ) {
    const m = mes !== undefined ? parseInt(mes, 10) : undefined;
    const a = ano !== undefined ? parseInt(ano, 10) : undefined;
    return this.orcamentosService.listar({
      mes: Number.isFinite(m) ? m : undefined,
      ano: Number.isFinite(a) ? a : undefined,
      situacao,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do orçamento com itens' })
  async obter(@Param('id', ParseIntPipe) id: number) {
    return this.orcamentosService.obter(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria orçamento com itens (transação)' })
  async criar(@UsuarioJwt() usuario: Usuario, @Body() dto: CriarOrcamentoDto) {
    return this.orcamentosService.criar(usuario, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza orçamento; se enviar itens, substitui todas as linhas' })
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioJwt() usuario: Usuario,
    @Body() dto: AtualizarOrcamentoDto,
  ) {
    return this.orcamentosService.atualizar(id, usuario, dto);
  }
}
