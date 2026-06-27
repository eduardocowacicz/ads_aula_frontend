import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AutenticacaoService } from './autenticacao.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('autenticacao')
@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login com e-mail e senha; retorna JWT' })
  async login(@Body() dto: LoginDto) {
    return this.autenticacaoService.validarLogin(dto);
  }
}
