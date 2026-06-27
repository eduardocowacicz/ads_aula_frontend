import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacaoModule } from '../autenticacao/autenticacao.module';
import { Cliente } from '../entidades/cliente.entidade';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente]), AutenticacaoModule],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
