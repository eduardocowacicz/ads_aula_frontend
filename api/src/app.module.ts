import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { ClientesModule } from './clientes/clientes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { Cliente } from './entidades/cliente.entidade';
import { ItemOrcamento } from './entidades/item-orcamento.entidade';
import { Orcamento } from './entidades/orcamento.entidade';
import { Produto } from './entidades/produto.entidade';
import { Usuario } from './entidades/usuario.entidade';
import { OrcamentosModule } from './orcamentos/orcamentos.module';
import { ProdutosModule } from './produtos/produtos.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: parseInt(config.get<string>('DATABASE_PORT', '5432'), 10),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: config.get<string>('DATABASE_NAME', 'sistema_pequena_empresa'),
        entities: [Usuario, Cliente, Produto, Orcamento, ItemOrcamento],
        synchronize: config.get<string>('TYPEORM_SYNC', 'false') === 'true',
        logging: config.get<string>('TYPEORM_LOGGING', 'false') === 'true',
        retryAttempts: parseInt(
          config.get<string>('DATABASE_RETRY_ATTEMPTS', '20'),
          10,
        ),
        retryDelay: parseInt(
          config.get<string>('DATABASE_RETRY_DELAY_MS', '3000'),
          10,
        ),
      }),
    }),
    AutenticacaoModule,
    UsuariosModule,
    ClientesModule,
    ProdutosModule,
    OrcamentosModule,
    DashboardModule,
  ],
})
export class AppModule {}
