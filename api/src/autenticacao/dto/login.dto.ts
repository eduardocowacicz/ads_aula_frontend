import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'demo@sistema.local' })
  @IsEmail({}, { message: 'email inválido' })
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 1 })
  @IsString()
  @MinLength(1, { message: 'senha é obrigatória' })
  senha: string;
}
