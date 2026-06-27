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
import { ProdutosService } from './produtos.service';
import { AtualizarProdutoDto } from './dto/atualizar-produto.dto';
import { CriarProdutoDto } from './dto/criar-produto.dto';

@ApiTags('produtos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista produtos (filtros opcionais: nome, ativo)' })
  @ApiQuery({
    name: 'nome',
    required: false,
    description: 'Filtra por nome do produto (parcial, sem distinguir maiúsculas/minúsculas)',
  })
  @ApiQuery({
    name: 'ativo',
    required: false,
    description: 'Filtra por status: true ou false',
    schema: { type: 'string', enum: ['true', 'false'] },
  })
  async listar(
    @Query('nome') nome?: string,
    @Query('ativo') ativo?: string,
  ) {
    let ativoBool: boolean | undefined;
    if (ativo === 'true') ativoBool = true;
    else if (ativo === 'false') ativoBool = false;
    return this.produtosService.listar({ nome, ativo: ativoBool });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do produto' })
  async obter(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.obter(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastra produto' })
  async criar(@Body() dto: CriarProdutoDto) {
    return this.produtosService.criar(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza produto' })
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarProdutoDto,
  ) {
    return this.produtosService.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove produto' })
  async remover(@Param('id', ParseIntPipe) id: number) {
    await this.produtosService.remover(id);
    return { mensagem: 'Produto removido' };
  }
}
