import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AtualizarUsuarioDto {
  @ApiPropertyOptional({ example: 'Maria Silva' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nomeCompleto?: string;

  @ApiPropertyOptional({ example: 'maria@empresa.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
