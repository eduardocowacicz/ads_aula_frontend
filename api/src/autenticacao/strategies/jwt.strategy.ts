import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Usuario } from '../../entidades/usuario.entidade';

export type JwtPayload = { sub: string | number; email: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<Usuario> {
    const id = typeof payload.sub === 'number' ? payload.sub : parseInt(String(payload.sub), 10);
    if (!Number.isInteger(id) || id < 1) {
      throw new UnauthorizedException('Sessão inválida');
    }
    const usuario = await this.usuarioRepository.findOne({
      where: { id, ativo: true },
    });
    if (!usuario) {
      throw new UnauthorizedException('Sessão inválida');
    }
    return usuario;
  }
}
