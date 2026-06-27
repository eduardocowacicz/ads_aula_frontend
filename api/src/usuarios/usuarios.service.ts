import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AutenticacaoService } from '../autenticacao/autenticacao.service';
import { Usuario } from '../entidades/usuario.entidade';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly autenticacaoService: AutenticacaoService,
  ) {}

  async obterAtual(usuario: Usuario) {
    return this.autenticacaoService.serializarUsuario(usuario);
  }

  async atualizarAtual(usuario: Usuario, dto: AtualizarUsuarioDto) {
    if (dto.email) {
      const existente = await this.usuarioRepository.findOne({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (existente && existente.id !== usuario.id) {
        throw new ConflictException('E-mail já em uso');
      }
      usuario.email = dto.email.toLowerCase().trim();
    }
    if (dto.nomeCompleto !== undefined) {
      usuario.nomeCompleto = dto.nomeCompleto;
    }
    await this.usuarioRepository.save(usuario);
    const atualizado = await this.usuarioRepository.findOneOrFail({ where: { id: usuario.id } });
    return this.autenticacaoService.serializarUsuario(atualizado);
  }

  async redefinirSenha(usuario: Usuario, dto: RedefinirSenhaDto) {
    const comHash = await this.usuarioRepository
      .createQueryBuilder('u')
      .addSelect('u.hashSenha')
      .where('u.id = :id', { id: usuario.id })
      .getOne();

    if (!comHash) {
      throw new UnauthorizedException();
    }

    const ok = await bcrypt.compare(dto.senhaAtual, comHash.hashSenha);
    if (!ok) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    comHash.hashSenha = await bcrypt.hash(dto.novaSenha, 10);
    await this.usuarioRepository.save(comHash);
    return { mensagem: 'Senha alterada com sucesso' };
  }
}
