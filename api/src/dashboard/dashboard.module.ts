import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacaoModule } from '../autenticacao/autenticacao.module';
import { Cliente } from '../entidades/cliente.entidade';
import { ItemOrcamento } from '../entidades/item-orcamento.entidade';
import { Orcamento } from '../entidades/orcamento.entidade';
import { Produto } from '../entidades/produto.entidade';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orcamento, Cliente, Produto, ItemOrcamento]),
    AutenticacaoModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
