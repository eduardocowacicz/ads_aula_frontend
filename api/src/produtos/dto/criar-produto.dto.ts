import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CriarProdutoDto {
  @ApiPropertyOptional({ example: 'SKU-001' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  codigoSku?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 99.9 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precoUnitario: number;

  @ApiPropertyOptional({ default: 'UN' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unidade?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  ativo?: boolean;
}
