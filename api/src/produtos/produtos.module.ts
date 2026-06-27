import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacaoModule } from '../autenticacao/autenticacao.module';
import { Produto } from '../entidades/produto.entidade';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Produto]), AutenticacaoModule],
  controllers: [ProdutosController],
  providers: [ProdutosService],
})
export class ProdutosModule {}
