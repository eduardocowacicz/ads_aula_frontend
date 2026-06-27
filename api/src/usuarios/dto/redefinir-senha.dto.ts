import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'senha atual é obrigatória' })
  senhaAtual: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'nova senha deve ter no mínimo 6 caracteres' })
  novaSenha: string;
}
