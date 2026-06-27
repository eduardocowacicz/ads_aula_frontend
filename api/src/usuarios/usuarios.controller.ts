import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuarioJwt } from '../compartilhado/decorators/usuario-jwt.decorator';
import { Usuario } from '../entidades/usuario.entidade';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('atual')
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  async atual(@UsuarioJwt() usuario: Usuario) {
    return this.usuariosService.obterAtual(usuario);
  }

  @Patch('atual')
  @ApiOperation({ summary: 'Atualiza nome e/ou e-mail do usuário autenticado' })
  async patchAtual(@UsuarioJwt() usuario: Usuario, @Body() dto: AtualizarUsuarioDto) {
    return this.usuariosService.atualizarAtual(usuario, dto);
  }

  @Patch('atual/senha')
  @ApiOperation({ summary: 'Redefine senha (requer senha atual)' })
  async patchSenha(@UsuarioJwt() usuario: Usuario, @Body() dto: RedefinirSenhaDto) {
    return this.usuariosService.redefinirSenha(usuario, dto);
  }
}
