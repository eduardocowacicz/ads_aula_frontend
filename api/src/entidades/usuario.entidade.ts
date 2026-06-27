import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PerfilUsuario } from '../dominio/perfil-usuario';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'hash_senha', type: 'varchar', length: 255, select: false })
  hashSenha: string;

  @Column({ name: 'nome_completo', type: 'varchar', length: 200 })
  nomeCompleto: string;

  @Column({
    type: 'enum',
    enum: PerfilUsuario,
    enumName: 'tipo_perfil_usuario',
    default: PerfilUsuario.operador,
  })
  perfil: PerfilUsuario;

  @Column({ name: 'ativo', type: 'boolean', default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm: Date;
}
