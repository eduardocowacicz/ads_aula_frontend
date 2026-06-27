import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CriarClienteDto {
  @ApiProperty({ example: 'Cliente Exemplo LTDA' })
  @IsString()
  @MaxLength(200)
  nome: string;

  @ApiPropertyOptional({ example: '12345678000199' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  documento?: string;

  @ApiPropertyOptional({ example: 'contato@cliente.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
