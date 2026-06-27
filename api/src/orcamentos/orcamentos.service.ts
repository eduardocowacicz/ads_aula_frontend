import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SituacaoOrcamento } from '../dominio/situacao-orcamento';
import { ItemOrcamento } from '../entidades/item-orcamento.entidade';
import { Orcamento } from '../entidades/orcamento.entidade';
import { Produto } from '../entidades/produto.entidade';
import { Usuario } from '../entidades/usuario.entidade';
import { Cliente } from '../entidades/cliente.entidade';
import { AtualizarOrcamentoDto } from './dto/atualizar-orcamento.dto';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { ItemOrcamentoInputDto } from './dto/item-orcamento-input.dto';

function arredondar2(n: number): number {
  return Math.round(n * 100) / 100;
}

@Injectable()
export class OrcamentosService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Orcamento)
    private readonly orcamentoRepository: Repository<Orcamento>,
    @InjectRepository(ItemOrcamento)
    private readonly itemOrcamentoRepository: Repository<ItemOrcamento>,
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async listar(filtros?: { mes?: number; ano?: number; situacao?: SituacaoOrcamento }) {
    const qb = this.orcamentoRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.itens', 'itens')
      .leftJoinAndSelect('o.cliente', 'cliente')
      .orderBy('o.id', 'ASC');

    if (filtros?.mes !== undefined && filtros?.ano !== undefined) {
      const inicio = new Date(filtros.ano, filtros.mes - 1, 1);
      const fim = new Date(filtros.ano, filtros.mes, 0, 23, 59, 59, 999);
      qb.andWhere('o.criadoEm BETWEEN :inicio AND :fim', { inicio, fim });
    }
    if (filtros?.situacao) {
      qb.andWhere('o.situacao = :sit', { sit: filtros.situacao });
    }

    const lista = await qb.getMany();
    return lista.map((o) => this.serializar(o));
  }

  async obter(id: number) {
    const o = await this.orcamentoRepository.findOne({
      where: { id },
      relations: ['itens', 'cliente', 'usuarioAutor'],
    });
    if (!o) {
      throw new NotFoundException('Orçamento não encontrado');
    }
    return this.serializar(o);
  }

  async criar(usuario: Usuario, dto: CriarOrcamentoDto) {
    const cliente = await this.clienteRepository.findOne({ where: { id: dto.clienteId } });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { subtotal, itensEntidade } = await this.montarItens(dto.itens);

      const valorDesconto = arredondar2(dto.valorDesconto ?? 0);
      const total = arredondar2(Math.max(0, subtotal - valorDesconto));

      const orcamento = queryRunner.manager.create(Orcamento, {
        clienteId: dto.clienteId,
        usuarioAutorId: usuario.id,
        situacao: dto.situacao ?? SituacaoOrcamento.pendente,
        subtotal: String(arredondar2(subtotal)),
        valorDesconto: String(valorDesconto),
        total: String(total),
        validoAte: dto.validoAte ? new Date(dto.validoAte) : null,
        observacoes: dto.observacoes ?? null,
      });

      await queryRunner.manager.save(orcamento);

      for (const item of itensEntidade) {
        item.orcamentoId = orcamento.id;
      }
      await queryRunner.manager.save(ItemOrcamento, itensEntidade);

      await queryRunner.commitTransaction();

      const completo = await this.orcamentoRepository.findOne({
        where: { id: orcamento.id },
        relations: ['itens', 'cliente', 'usuarioAutor'],
      });
      return this.serializar(completo!);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async atualizar(id: number, _usuario: Usuario, dto: AtualizarOrcamentoDto) {
    const orcamento = await this.orcamentoRepository.findOne({
      where: { id },
      relations: ['itens'],
    });
    if (!orcamento) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    if (dto.clienteId && dto.clienteId !== orcamento.clienteId) {
      const c = await this.clienteRepository.findOne({ where: { id: dto.clienteId } });
      if (!c) throw new NotFoundException('Cliente não encontrado');
      orcamento.clienteId = dto.clienteId;
    }

    if (dto.situacao !== undefined) orcamento.situacao = dto.situacao;
    if (dto.observacoes !== undefined) orcamento.observacoes = dto.observacoes;
    if (dto.validoAte !== undefined) {
      orcamento.validoAte = dto.validoAte ? new Date(dto.validoAte) : null;
    }

    let subtotal = Number(orcamento.subtotal);
    let valorDesconto = Number(orcamento.valorDesconto);

    if (dto.valorDesconto !== undefined) {
      valorDesconto = arredondar2(dto.valorDesconto);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.itens && dto.itens.length > 0) {
        await queryRunner.manager.delete(ItemOrcamento, { orcamentoId: id });
        const montado = await this.montarItens(dto.itens);
        subtotal = montado.subtotal;
        for (const item of montado.itensEntidade) {
          item.orcamentoId = id;
        }
        await queryRunner.manager.save(ItemOrcamento, montado.itensEntidade);
      }

      const total = arredondar2(Math.max(0, subtotal - valorDesconto));
      orcamento.subtotal = String(arredondar2(subtotal));
      orcamento.valorDesconto = String(valorDesconto);
      orcamento.total = String(total);

      await queryRunner.manager.save(Orcamento, orcamento);
      await queryRunner.commitTransaction();

      const completo = await this.orcamentoRepository.findOne({
        where: { id },
        relations: ['itens', 'cliente', 'usuarioAutor'],
      });
      return this.serializar(completo!);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  private async montarItens(itens: ItemOrcamentoInputDto[]): Promise<{
    subtotal: number;
    itensEntidade: ItemOrcamento[];
  }> {
    let subtotal = 0;
    const itensEntidade: ItemOrcamento[] = [];

    for (const linha of itens) {
      const produto = await this.produtoRepository.findOne({ where: { id: linha.produtoId } });
      if (!produto) {
        throw new NotFoundException(`Produto não encontrado: ${linha.produtoId}`);
      }
      if (!produto.ativo) {
        throw new BadRequestException(`Produto inativo: ${produto.nome}`);
      }

      const precoUnit = arredondar2(
        linha.precoUnitario !== undefined ? linha.precoUnitario : Number(produto.precoUnitario),
      );
      const qtd = linha.quantidade;
      const totalLinha = arredondar2(precoUnit * qtd);
      subtotal += totalLinha;

      const item = this.itemOrcamentoRepository.create({
        produtoId: produto.id,
        nomeProdutoRegistro: produto.nome,
        precoUnitarioRegistro: String(precoUnit),
        quantidade: String(qtd),
        totalLinha: String(totalLinha),
      });
      itensEntidade.push(item);
    }

    return { subtotal: arredondar2(subtotal), itensEntidade };
  }

  private serializar(o: Orcamento) {
    return {
      id: o.id,
      clienteId: o.clienteId,
      cliente: o.cliente
        ? {
            id: o.cliente.id,
            nome: o.cliente.nome,
            documento: o.cliente.documento,
            email: o.cliente.email,
            telefone: o.cliente.telefone,
          }
        : undefined,
      usuarioAutorId: o.usuarioAutorId,
      usuarioAutor: o.usuarioAutor
        ? {
            id: o.usuarioAutor.id,
            nomeCompleto: o.usuarioAutor.nomeCompleto,
            email: o.usuarioAutor.email,
          }
        : undefined,
      situacao: o.situacao,
      subtotal: Number(o.subtotal),
      valorDesconto: Number(o.valorDesconto),
      total: Number(o.total),
      validoAte: o.validoAte,
      observacoes: o.observacoes,
      criadoEm: o.criadoEm,
      atualizadoEm: o.atualizadoEm,
      itens: (o.itens ?? []).map((i) => ({
        id: i.id,
        produtoId: i.produtoId,
        nomeProdutoRegistro: i.nomeProdutoRegistro,
        precoUnitarioRegistro: Number(i.precoUnitarioRegistro),
        quantidade: Number(i.quantidade),
        totalLinha: Number(i.totalLinha),
      })),
    };
  }
}
