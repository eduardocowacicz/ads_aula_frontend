import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Orcamento } from './orcamento.entidade';
import { Produto } from './produto.entidade';

@Entity('itens_orcamento')
export class ItemOrcamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'orcamento_id', type: 'int' })
  orcamentoId: number;

  @ManyToOne(() => Orcamento, (o) => o.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orcamento_id' })
  orcamento: Orcamento;

  @Column({ name: 'produto_id', type: 'int' })
  produtoId: number;

  @ManyToOne(() => Produto, (p) => p.itensOrcamento, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'produto_id' })
  produto: Produto;

  @Column({ name: 'nome_produto_registro', type: 'varchar', length: 200 })
  nomeProdutoRegistro: string;

  @Column({ name: 'preco_unitario_registro', type: 'numeric', precision: 14, scale: 2 })
  precoUnitarioRegistro: string;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  quantidade: string;

  @Column({ name: 'total_linha', type: 'numeric', precision: 14, scale: 2 })
  totalLinha: string;
}
