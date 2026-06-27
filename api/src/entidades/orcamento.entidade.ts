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
import { SituacaoOrcamento } from '../dominio/situacao-orcamento';
import { Cliente } from './cliente.entidade';
import { Usuario } from './usuario.entidade';
import { ItemOrcamento } from './item-orcamento.entidade';

@Entity('orcamentos')
export class Orcamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cliente_id', type: 'int' })
  clienteId: number;

  @ManyToOne(() => Cliente, (c) => c.orcamentos, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'usuario_autor_id', type: 'int' })
  usuarioAutorId: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_autor_id' })
  usuarioAutor: Usuario;

  @Column({
    type: 'enum',
    enum: SituacaoOrcamento,
    enumName: 'tipo_situacao_orcamento',
    default: SituacaoOrcamento.pendente,
  })
  situacao: SituacaoOrcamento;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  subtotal: string;

  @Column({ name: 'valor_desconto', type: 'numeric', precision: 14, scale: 2, default: 0 })
  valorDesconto: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  total: string;

  @Column({ name: 'valido_ate', type: 'date', nullable: true })
  validoAte: Date | null;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm: Date;

  @OneToMany(() => ItemOrcamento, (i) => i.orcamento, { cascade: true })
  itens: ItemOrcamento[];
}
