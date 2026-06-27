import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from '../../entidades/usuario.entidade';

export const UsuarioJwt = createParamDecorator((_: unknown, ctx: ExecutionContext): Usuario => {
  const request = ctx.switchToHttp().getRequest<{ user: Usuario }>();
  return request.user;
});
