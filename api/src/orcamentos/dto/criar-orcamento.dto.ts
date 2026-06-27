import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { SituacaoOrcamento } from '../../dominio/situacao-orcamento';
import { ItemOrcamentoInputDto } from './item-orcamento-input.dto';

export class CriarOrcamentoDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clienteId: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorDesconto?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validoAte?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional({ enum: SituacaoOrcamento })
  @IsOptional()
  @IsEnum(SituacaoOrcamento)
  situacao?: SituacaoOrcamento;

  @ApiProperty({ type: [ItemOrcamentoInputDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Informe ao menos um item' })
  @ValidateNested({ each: true })
  @Type(() => ItemOrcamentoInputDto)
  itens: ItemOrcamentoInputDto[];
}
