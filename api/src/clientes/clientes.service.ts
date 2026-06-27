import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Usuario } from '../entidades/usuario.entidade';
import { Cliente } from '../entidades/cliente.entidade';
import { AtualizarClienteDto } from './dto/atualizar-cliente.dto';
import { CriarClienteDto } from './dto/criar-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async listar(filtros?: { nome?: string; documento?: string }) {
    const qb = this.clienteRepository.createQueryBuilder('c').orderBy('c.id', 'ASC');

    if (filtros?.nome?.trim()) {
      qb.andWhere('c.nome ILIKE :nome', { nome: `%${filtros.nome.trim()}%` });
    }
    if (filtros?.documento?.trim()) {
      qb.andWhere('c.documento ILIKE :doc', { doc: `%${filtros.documento.trim()}%` });
    }

    const lista = await qb.getMany();
    return lista.map((c) => this.serializar(c));
  }

  async obter(id: number) {
    const c = await this.clienteRepository.findOne({ where: { id } });
    if (!c) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return this.serializar(c);
  }

  async criar(dto: CriarClienteDto, usuario: Usuario) {
    if (dto.documento) {
      const dup = await this.clienteRepository.findOne({
        where: { documento: dto.documento },
      });
      if (dup) {
        throw new ConflictException('Documento já cadastrado');
      }
    }

    const cliente = this.clienteRepository.create({
      nome: dto.nome,
      documento: dto.documento ?? null,
      email: dto.email ?? null,
      telefone: dto.telefone ?? null,
      observacoes: dto.observacoes ?? null,
      usuarioCriadorId: usuario.id,
    });
    await this.clienteRepository.save(cliente);
    return this.serializar(cliente);
  }

  async atualizar(id: number, dto: AtualizarClienteDto) {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    if (dto.documento !== undefined && dto.documento !== cliente.documento) {
      if (dto.documento) {
        const dup = await this.clienteRepository.findOne({
          where: { documento: dto.documento },
        });
        if (dup && dup.id !== id) {
          throw new ConflictException('Documento já cadastrado');
        }
      }
      cliente.documento = dto.documento ?? null;
    }
    if (dto.nome !== undefined) cliente.nome = dto.nome;
    if (dto.email !== undefined) cliente.email = dto.email ?? null;
    if (dto.telefone !== undefined) cliente.telefone = dto.telefone ?? null;
    if (dto.observacoes !== undefined) cliente.observacoes = dto.observacoes ?? null;

    await this.clienteRepository.save(cliente);
    return this.serializar(cliente);
  }

  async remover(id: number) {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
    try {
      await this.clienteRepository.remove(cliente);
    } catch (e) {
      if (e instanceof QueryFailedError && (e as { driverError?: { code?: string } }).driverError?.code === '23503') {
        throw new ConflictException(
          'Não é possível excluir: existem orçamentos vinculados a este cliente',
        );
      }
      throw e;
    }
  }

  private serializar(c: Cliente) {
    return {
      id: c.id,
      nome: c.nome,
      documento: c.documento,
      email: c.email,
      telefone: c.telefone,
      observacoes: c.observacoes,
      usuarioCriadorId: c.usuarioCriadorId,
      criadoEm: c.criadoEm,
      atualizadoEm: c.atualizadoEm,
    };
  }
}
