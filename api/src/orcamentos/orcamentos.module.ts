import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacaoModule } from '../autenticacao/autenticacao.module';
import { Cliente } from '../entidades/cliente.entidade';
import { ItemOrcamento } from '../entidades/item-orcamento.entidade';
import { Orcamento } from '../entidades/orcamento.entidade';
import { Produto } from '../entidades/produto.entidade';
import { OrcamentosController } from './orcamentos.controller';
import { OrcamentosService } from './orcamentos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orcamento, ItemOrcamento, Produto, Cliente]),
    AutenticacaoModule,
  ],
  controllers: [OrcamentosController],
  providers: [OrcamentosService],
})
export class OrcamentosModule {}
