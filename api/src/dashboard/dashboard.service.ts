import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SituacaoOrcamento } from '../dominio/situacao-orcamento';
import { Cliente } from '../entidades/cliente.entidade';
import { ItemOrcamento } from '../entidades/item-orcamento.entidade';
import { Orcamento } from '../entidades/orcamento.entidade';
import { Produto } from '../entidades/produto.entidade';
import {
  DashboardResumoDto,
  OrcamentosPorStatusDto,
  SerieMensalQuantidadeDto,
  SerieMensalValorDto,
  TopClienteOrcamentosDto,
  TopProdutoOrcadoDto,
} from './dto/dashboard-relatorios.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Orcamento)
    private readonly orcamentoRepository: Repository<Orcamento>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectRepository(ItemOrcamento)
    private readonly itemOrcamentoRepository: Repository<ItemOrcamento>,
  ) {}

  async resumo(): Promise<DashboardResumoDto> {
    const [totalOrcamentos, totalClientes, totalProdutosAtivos] =
      await Promise.all([
        this.orcamentoRepository.count(),
        this.clienteRepository.count(),
        this.produtoRepository.count({ where: { ativo: true } }),
      ]);

    return { totalOrcamentos, totalClientes, totalProdutosAtivos };
  }

  async orcamentosPorStatus(): Promise<OrcamentosPorStatusDto[]> {
    const rows = await this.orcamentoRepository
      .createQueryBuilder('o')
      .select('o.situacao', 'situacao')
      .addSelect('COUNT(o.id)', 'total')
      .groupBy('o.situacao')
      .getRawMany<{ situacao: SituacaoOrcamento; total: string }>();

    const totais = new Map<SituacaoOrcamento, number>(
      rows.map((r) => [r.situacao, Number(r.total)]),
    );

    return Object.values(SituacaoOrcamento).map((situacao) => ({
      situacao,
      total: totais.get(situacao) ?? 0,
    }));
  }

  async orcamentosPorMes(ano = new Date().getFullYear()): Promise<SerieMensalQuantidadeDto[]> {
    const rows = await this.orcamentoRepository
      .createQueryBuilder('o')
      .select('EXTRACT(MONTH FROM o.criado_em)', 'mes')
      .addSelect('COUNT(o.id)', 'total')
      .where('o.criado_em >= :inicio AND o.criado_em < :fim', {
        inicio: new Date(ano, 0, 1),
        fim: new Date(ano + 1, 0, 1),
      })
      .groupBy('mes')
      .orderBy('mes', 'ASC')
      .getRawMany<{ mes: string; total: string }>();

    const totais = this.mapearTotaisMensais(rows);
    return this.serieMensal(ano, totais);
  }

  async valorOrcadoPorMes(ano = new Date().getFullYear()): Promise<SerieMensalValorDto[]> {
    const rows = await this.orcamentoRepository
      .createQueryBuilder('o')
      .select('EXTRACT(MONTH FROM o.criado_em)', 'mes')
      .addSelect('COALESCE(SUM(o.total), 0)', 'total')
      .where('o.criado_em >= :inicio AND o.criado_em < :fim', {
        inicio: new Date(ano, 0, 1),
        fim: new Date(ano + 1, 0, 1),
      })
      .groupBy('mes')
      .orderBy('mes', 'ASC')
      .getRawMany<{ mes: string; total: string }>();

    const totais = this.mapearTotaisMensais(rows);
    return this.serieMensal(ano, totais);
  }

  async topClientesOrcamentos(limit = 10): Promise<TopClienteOrcamentosDto[]> {
    const rows = await this.orcamentoRepository
      .createQueryBuilder('o')
      .innerJoin('o.cliente', 'cliente')
      .select('cliente.id', 'clienteId')
      .addSelect('cliente.nome', 'nome')
      .addSelect('COUNT(o.id)', 'totalOrcamentos')
      .groupBy('cliente.id')
      .addGroupBy('cliente.nome')
      .orderBy('COUNT(o.id)', 'DESC')
      .addOrderBy('cliente.nome', 'ASC')
      .limit(this.normalizarLimit(limit))
      .getRawMany<{
        clienteId: string;
        nome: string;
        totalOrcamentos: string;
      }>();

    return rows.map((r) => ({
      clienteId: Number(r.clienteId),
      nome: r.nome,
      totalOrcamentos: Number(r.totalOrcamentos),
    }));
  }

  async topProdutosOrcados(limit = 10): Promise<TopProdutoOrcadoDto[]> {
    const rows = await this.itemOrcamentoRepository
      .createQueryBuilder('i')
      .innerJoin('i.produto', 'produto')
      .select('produto.id', 'produtoId')
      .addSelect('produto.nome', 'nome')
      .addSelect('COUNT(i.id)', 'totalOcorrencias')
      .groupBy('produto.id')
      .addGroupBy('produto.nome')
      .orderBy('COUNT(i.id)', 'DESC')
      .addOrderBy('produto.nome', 'ASC')
      .limit(this.normalizarLimit(limit))
      .getRawMany<{
        produtoId: string;
        nome: string;
        totalOcorrencias: string;
      }>();

    return rows.map((r) => ({
      produtoId: Number(r.produtoId),
      nome: r.nome,
      totalOcorrencias: Number(r.totalOcorrencias),
    }));
  }

  private normalizarLimit(limit: number): number {
    if (!Number.isFinite(limit) || limit < 1) return 10;
    return Math.min(Math.trunc(limit), 50);
  }

  private mapearTotaisMensais(rows: { mes: string; total: string }[]): Map<number, number> {
    return new Map(rows.map((r) => [Number(r.mes), Number(r.total)]));
  }

  private serieMensal<T extends SerieMensalQuantidadeDto | SerieMensalValorDto>(
    ano: number,
    totais: Map<number, number>,
  ): T[] {
    return Array.from({ length: 12 }, (_, idx) => {
      const mes = idx + 1;
      return {
        ano,
        mes,
        total: totais.get(mes) ?? 0,
      } as T;
    });
  }
}
