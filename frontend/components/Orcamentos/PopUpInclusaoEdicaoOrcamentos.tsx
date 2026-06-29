"use client";

import { useEffect, useState } from "react";
import type { Orcamento, SituacaoOrcamento } from "@/types/orcamentos";
import type { Cliente } from "@/types/clientes";
import type { Produto } from "@/types/produtos";
import {
  createOrcamento,
  getOrcamento,
  updateOrcamento,
} from "@/app/(system)/orcamentos/actions";
import { getClientes } from "@/app/(system)/clientes/actions";
import { getProdutos } from "@/app/(system)/produtos/actions";
import { notify } from "@/components/Notify";
import styles from "./Orcamentos.module.css";

type LinhaItem = {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
};

const SITUACOES: { value: SituacaoOrcamento; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "enviado", label: "Enviado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
  { value: "cancelado", label: "Cancelado" },
];

function linhaVazia(): LinhaItem {
  return { produtoId: 0, quantidade: 1, precoUnitario: 0 };
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Props = {
  visible: boolean;
  codOrcamento: number | null | undefined;
  onHide: () => void;
  onSaveSuccess?: () => void;
};

export default function PopUpInclusaoEdicaoOrcamentos({
  visible,
  codOrcamento,
  onHide,
  onSaveSuccess,
}: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [clienteId, setClienteId] = useState(0);
  const [situacao, setSituacao] = useState<SituacaoOrcamento>("pendente");
  const [validoAte, setValidoAte] = useState("");
  const [valorDesconto, setValorDesconto] = useState(0);
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<LinhaItem[]>([linhaVazia()]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!visible) return;
    getClientes().then(setClientes);
    getProdutos({ ativo: "true" }).then(setProdutos);

    if (codOrcamento) {
      getOrcamento(codOrcamento).then((o: Orcamento) => {
        if (!o) return;
        setClienteId(o.clienteId ?? 0);
        setSituacao(o.situacao ?? "pendente");
        setValidoAte(o.validoAte ? o.validoAte.slice(0, 10) : "");
        setValorDesconto(o.valorDesconto ?? 0);
        setObservacoes(o.observacoes ?? "");
        setItens(
          (o.itens ?? []).map((i) => ({
            produtoId: i.produtoId,
            quantidade: i.quantidade,
            precoUnitario: i.precoUnitarioRegistro ?? 0,
          })),
        );
      });
    } else {
      setClienteId(0);
      setSituacao("pendente");
      setValidoAte("");
      setValorDesconto(0);
      setObservacoes("");
      setItens([linhaVazia()]);
    }
  }, [visible, codOrcamento]);

  const handleProdutoChange = (index: number, produtoId: number) => {
    const produto = produtos.find((p) => p.id === produtoId);
    setItens((atual) =>
      atual.map((item, i) =>
        i === index
          ? {
              ...item,
              produtoId,
              precoUnitario: produto ? produto.precoUnitario : item.precoUnitario,
            }
          : item,
      ),
    );
  };

  const handleItemChange = (index: number, campo: keyof LinhaItem, valor: number) => {
    setItens((atual) =>
      atual.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)),
    );
  };

  const handleAdicionarItem = () => {
    setItens((atual) => [...atual, linhaVazia()]);
  };

  const handleRemoverItem = (index: number) => {
    setItens((atual) => atual.filter((_, i) => i !== index));
  };

  const subtotal = itens.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0);
  const total = Math.max(0, subtotal - valorDesconto);

  const handleSalvar = async () => {
    if (!clienteId) {
      notify("Selecione o cliente.", "warning");
      return;
    }
    const itensValidos = itens.filter((i) => i.produtoId && i.quantidade > 0);
    if (itensValidos.length === 0) {
      notify("Adicione ao menos um item com produto e quantidade.", "warning");
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        clienteId,
        situacao,
        valorDesconto,
        validoAte: validoAte || undefined,
        observacoes: observacoes.trim() || undefined,
        itens: itensValidos.map((i) => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario,
        })),
      };
      if (codOrcamento) {
        await updateOrcamento(codOrcamento, payload);
        notify("Orçamento atualizado com sucesso.", "success");
      } else {
        await createOrcamento(payload);
        notify("Orçamento cadastrado com sucesso.", "success");
      }
      onSaveSuccess?.();
    } catch {
      notify("Erro ao salvar orçamento.", "danger");
    } finally {
      setSalvando(false);
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={onHide}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitulo}>
            {codOrcamento ? "Editar Orçamento" : "Novo Orçamento"}
          </h5>
          <button className={styles.btnFechar} onClick={onHide}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Cliente *</label>
              <select
                className="form-select"
                value={clienteId}
                onChange={(e) => setClienteId(Number(e.target.value))}
              >
                <option value={0}>Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Situação</label>
              <select
                className="form-select"
                value={situacao}
                onChange={(e) => setSituacao(e.target.value as SituacaoOrcamento)}
              >
                {SITUACOES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Válido até</label>
              <input
                type="date"
                className="form-control"
                value={validoAte}
                onChange={(e) => setValidoAte(e.target.value)}
              />
            </div>
          </div>

          {/* Itens */}
          <div className={styles.itensHeader}>
            <h6 className={styles.itensTitulo}>Itens do orçamento</h6>
            <button className="btn btn-sm btn-outline-primary" onClick={handleAdicionarItem}>
              + Adicionar item
            </button>
          </div>

          <div className={styles.tabelaItens}>
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th style={{ width: "120px" }}>Qtd.</th>
                  <th style={{ width: "150px" }}>Preço unit.</th>
                  <th style={{ width: "140px" }}>Total</th>
                  <th style={{ width: "48px" }}></th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={item.produtoId}
                        onChange={(e) => handleProdutoChange(index, Number(e.target.value))}
                      >
                        <option value={0}>Selecione...</option>
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min={0}
                        step={1}
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, "quantidade", Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min={0}
                        step={0.01}
                        value={item.precoUnitario}
                        onChange={(e) => handleItemChange(index, "precoUnitario", Number(e.target.value))}
                      />
                    </td>
                    <td className={styles.totalLinha}>
                      {formatarMoeda(item.quantidade * item.precoUnitario)}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoverItem(index)}
                        disabled={itens.length === 1}
                        title="Remover item"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-8">
              <label className="form-label">Observações</label>
              <textarea
                className="form-control"
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações opcionais"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Desconto (R$)</label>
              <input
                type="number"
                className="form-control"
                min={0}
                step={0.01}
                value={valorDesconto}
                onChange={(e) => setValorDesconto(Number(e.target.value))}
              />
              <div className={styles.resumo}>
                <span>Subtotal</span>
                <span>{formatarMoeda(subtotal)}</span>
              </div>
              <div className={`${styles.resumo} ${styles.resumoTotal}`}>
                <span>Total</span>
                <span>{formatarMoeda(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className="btn btn-outline-secondary" onClick={onHide}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
