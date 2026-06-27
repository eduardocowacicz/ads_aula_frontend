import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Produto } from '../entidades/produto.entidade';
import { AtualizarProdutoDto } from './dto/atualizar-produto.dto';
import { CriarProdutoDto } from './dto/criar-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
  ) {}

  async listar(filtros?: { nome?: string; ativo?: boolean }) {
    const qb = this.produtoRepository.createQueryBuilder('p').orderBy('p.id', 'ASC');

    if (filtros?.nome?.trim()) {
      qb.andWhere('p.nome ILIKE :nome', { nome: `%${filtros.nome.trim()}%` });
    }
    if (filtros?.ativo !== undefined) {
      qb.andWhere('p.ativo = :ativo', { ativo: filtros.ativo });
    }

    const lista = await qb.getMany();
    return lista.map((p) => this.serializar(p));
  }

  async obter(id: number) {
    const p = await this.produtoRepository.findOne({ where: { id } });
    if (!p) {
      throw new NotFoundException('Produto não encontrado');
    }
    return this.serializar(p);
  }

  async criar(dto: CriarProdutoDto) {
    if (dto.codigoSku) {
      const dup = await this.produtoRepository.findOne({
        where: { codigoSku: dto.codigoSku },
      });
      if (dup) {
        throw new ConflictException('Código SKU já cadastrado');
      }
    }

    const produto = this.produtoRepository.create({
      codigoSku: dto.codigoSku ?? null,
      nome: dto.nome,
      descricao: dto.descricao ?? null,
      precoUnitario: String(dto.precoUnitario),
      unidade: dto.unidade ?? 'UN',
      ativo: dto.ativo ?? true,
    });
    await this.produtoRepository.save(produto);
    return this.serializar(produto);
  }

  async atualizar(id: number, dto: AtualizarProdutoDto) {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (dto.codigoSku !== undefined && dto.codigoSku !== produto.codigoSku) {
      if (dto.codigoSku) {
        const dup = await this.produtoRepository.findOne({
          where: { codigoSku: dto.codigoSku },
        });
        if (dup && dup.id !== id) {
          throw new ConflictException('Código SKU já cadastrado');
        }
      }
      produto.codigoSku = dto.codigoSku ?? null;
    }
    if (dto.nome !== undefined) produto.nome = dto.nome;
    if (dto.descricao !== undefined) produto.descricao = dto.descricao ?? null;
    if (dto.precoUnitario !== undefined) produto.precoUnitario = String(dto.precoUnitario);
    if (dto.unidade !== undefined) produto.unidade = dto.unidade;
    if (dto.ativo !== undefined) produto.ativo = dto.ativo;

    await this.produtoRepository.save(produto);
    return this.serializar(produto);
  }

  async remover(id: number) {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }
    try {
      await this.produtoRepository.remove(produto);
    } catch (e) {
      if (e instanceof QueryFailedError && (e as { driverError?: { code?: string } }).driverError?.code === '23503') {
        throw new ConflictException(
          'Não é possível excluir: produto referenciado em orçamentos',
        );
      }
      throw e;
    }
  }

  private serializar(p: Produto) {
    return {
      id: p.id,
      codigoSku: p.codigoSku,
      nome: p.nome,
      descricao: p.descricao,
      precoUnitario: Number(p.precoUnitario),
      unidade: p.unidade,
      ativo: p.ativo,
      criadoEm: p.criadoEm,
      atualizadoEm: p.atualizadoEm,
    };
  }
}
