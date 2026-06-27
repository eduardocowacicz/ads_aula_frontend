import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../entidades/usuario.entidade';
import { AutenticacaoController } from './autenticacao.controller';
import { AutenticacaoService } from './autenticacao.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(
            config.get<string>('JWT_EXPIRES_SEGUNDOS', String(7 * 24 * 60 * 60)),
            10,
          ),
        },
      }),
    }),
  ],
  controllers: [AutenticacaoController],
  providers: [AutenticacaoService, JwtStrategy],
  exports: [AutenticacaoService, JwtModule, JwtStrategy],
})
export class AutenticacaoModule {}
