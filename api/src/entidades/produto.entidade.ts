import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ItemOrcamento } from './item-orcamento.entidade';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_sku', type: 'varchar', length: 80, unique: true, nullable: true })
  codigoSku: string | null;

  @Column({ type: 'varchar', length: 200 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ name: 'preco_unitario', type: 'numeric', precision: 14, scale: 2 })
  precoUnitario: string;

  @Column({ type: 'varchar', length: 20, default: 'UN' })
  unidade: string;

  @Column({ name: 'ativo', type: 'boolean', default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm: Date;

  @OneToMany(() => ItemOrcamento, (i) => i.produto)
  itensOrcamento: ItemOrcamento[];
}
