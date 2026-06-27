import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsuarioJwt } from '../compartilhado/decorators/usuario-jwt.decorator';
import { Usuario } from '../entidades/usuario.entidade';
import { ClientesService } from './clientes.service';
import { AtualizarClienteDto } from './dto/atualizar-cliente.dto';
import { CriarClienteDto } from './dto/criar-cliente.dto';

@ApiTags('clientes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os clientes (filtros opcionais: nome, documento)' })
  @ApiQuery({
    name: 'nome',
    required: false,
    description: 'Filtra por nome (parcial, sem distinguir maiúsculas/minúsculas)',
  })
  @ApiQuery({
    name: 'documento',
    required: false,
    description: 'Filtra por documento (parcial)',
  })
  async listar(
    @Query('nome') nome?: string,
    @Query('documento') documento?: string,
  ) {
    return this.clientesService.listar({ nome, documento });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do cliente' })
  async obter(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.obter(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastra cliente' })
  async criar(@UsuarioJwt() usuario: Usuario, @Body() dto: CriarClienteDto) {
    return this.clientesService.criar(dto, usuario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza cliente' })
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarClienteDto,
  ) {
    return this.clientesService.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove cliente' })
  async remover(@Param('id', ParseIntPipe) id: number) {
    await this.clientesService.remover(id);
    return { mensagem: 'Cliente removido' };
  }
}
