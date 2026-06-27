import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Usuario } from '../entidades/usuario.entidade';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AutenticacaoService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async validarLogin(dto: LoginDto) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('u')
      .addSelect('u.hashSenha')
      .where('u.email = :email', { email: dto.email.toLowerCase().trim() })
      .getOne();

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const ok = await bcrypt.compare(dto.senha, usuario.hashSenha);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: usuario.id, email: usuario.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer' as const,
      usuario: this.serializarUsuario(usuario),
    };
  }

  serializarUsuario(u: Usuario) {
    return {
      id: u.id,
      email: u.email,
      nomeCompleto: u.nomeCompleto,
      perfil: u.perfil,
      ativo: u.ativo,
      criadoEm: u.criadoEm,
      atualizadoEm: u.atualizadoEm,
    };
  }

  async encontrarPorId(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { id } });
  }
}
