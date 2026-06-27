import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entidade';
import { Orcamento } from './orcamento.entidade';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nome: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  documento: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefone: string | null;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @Column({ name: 'usuario_criador_id', type: 'int', nullable: true })
  usuarioCriadorId: number | null;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'usuario_criador_id' })
  usuarioCriador: Usuario | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm: Date;

  @OneToMany(() => Orcamento, (o) => o.cliente)
  orcamentos: Orcamento[];
}
