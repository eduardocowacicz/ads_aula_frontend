import { PartialType } from '@nestjs/swagger';
import { CriarOrcamentoDto } from './criar-orcamento.dto';

export class AtualizarOrcamentoDto extends PartialType(CriarOrcamentoDto) {}
