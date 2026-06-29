"use client";

import { useEffect, useState } from "react";
import type { Orcamento, SituacaoOrcamento } from "@/types/orcamentos";
import type { Cliente } from "@/types/clientes";
import type { Produto } from "@/types/produtos";
import {
  getOrcamento,
  createOrcamento,
  updateOrcamento,
  getClientesParaOrcamento,
  getProdutosParaOrcamento,
} from "@/app/(system)/orcamentos/actions";
import { notify } from "@/components/Notify";
import styles from "./Orcamentos.module.css";

type ItemForm = {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  usarPrecoProduto: boolean;
};

type Props = {
  visible: boolean;
  idOrcamento: number | null | undefined;
  onHide: () => void;
  onSaveSuccess?: () => void;
};

const SITUACOES: { value: SituacaoOrcamento; label: string }[] = [
  { value: "pendente",  label: "Pendente" },
  { value: "enviado",   label: "Enviado" },
  { value: "aprovado",  label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
  { value: "cancelado", label: "Cancelado" },
];

function itemVazio(): ItemForm {
  return { produtoId: 0, quantidade: 1, precoUnitario: 0, usarPrecoProduto: true };
}

export default function ModalOrcamento({ visible, idOrcamento, onHide, onSaveSuccess }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  const [clienteId, setClienteId] = useState(0);
  const [situacao, setSituacao] = useState<SituacaoOrcamento>("pendente");
  const [observacoes, setObservacoes] = useState("");
  const [valorDesconto, setValorDesconto] = useState(0);
  const [validoAte, setValidoAte] = useState("");
  const [itens, setItens] = useState<ItemForm[]>([itemVazio()]);
  const [salvando, setSalvando] = useState(false);

  // carrega clientes e produtos uma vez quando o modal abre
  useEffect(() => {
    if (!visible) return;
    setCarregandoDados(true);
    Promise.all([getClientesParaOrcamento(), getProdutosParaOrcamento()])
      .then(([cls, prods]) => {
        setClientes(cls);
        setProdutos(prods);
      })
      .catch(() => notify("Erro ao carregar dados.", "danger"))
      .finally(() => setCarregandoDados(false));
  }, [visible]);

  // preenche campos se for edição
  useEffect(() => {
    if (!visible) return;
    if (idOrcamento) {
      getOrcamento(idOrcamento).then((o: Orcamento) => {
        setClienteId(o.clienteId);
        setSituacao(o.situacao);
        setObservacoes(o.observacoes ?? "");
        setValorDesconto(o.valorDesconto ?? 0);
        setValidoAte(o.validoAte ? o.validoAte.slice(0, 10) : "");
        if (o.itens && o.itens.length > 0) {
          setItens(
            o.itens.map((it) => ({
              produtoId: it.produtoId,
              quantidade: it.quantidade,
              precoUnitario: (it as any).precoUnitarioRegistro || 0,
              usarPrecoProduto: false,
            }))
          );
        } else {
          setItens([itemVazio()]);
        }
      });
    } else {
      setClienteId(0);
      setSituacao("pendente");
      setObservacoes("");
      setValorDesconto(0);
      setValidoAte("");
      setItens([itemVazio()]);
    }
  }, [visible, idOrcamento]);

  const handleAddItem = () => setItens((prev) => [...prev, itemVazio()]);

  const handleRemoveItem = (idx: number) =>
    setItens((prev) => prev.filter((_, i) => i !== idx));

  const handleItemChange = (idx: number, field: keyof ItemForm, value: number | boolean) => {
    setItens((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const updated = { ...it, [field]: value };
        // se selecionou um produto e usa preço do produto, preenche o preço
        if (field === "produtoId" && updated.usarPrecoProduto) {
          const prod = produtos.find((p) => p.id === Number(value));
          if (prod) updated.precoUnitario = prod.precoUnitario;
        }
        if (field === "usarPrecoProduto" && value === true) {
          const prod = produtos.find((p) => p.id === updated.produtoId);
          if (prod) updated.precoUnitario = prod.precoUnitario;
        }
        return updated;
      })
    );
  };

  const handleSalvar = async () => {
    if (!clienteId) {
      notify("Selecione um cliente.", "warning");
      return;
    }
    const itensValidos = itens.filter((it) => it.produtoId > 0 && it.quantidade > 0);
    if (itensValidos.length === 0) {
      notify("Adicione pelo menos um item ao orçamento.", "warning");
      return;
    }
    setSalvando(true);
    try {
      const payload = {
        clienteId,
        situacao,
        observacoes: observacoes.trim() || undefined,
        valorDesconto: valorDesconto || undefined,
        validoAte: validoAte || undefined,
        itens: itensValidos.map((it) => ({
          produtoId: it.produtoId,
          quantidade: it.quantidade,
          precoUnitario: it.usarPrecoProduto ? undefined : it.precoUnitario,
        })),
      };
      if (idOrcamento) {
        await updateOrcamento(idOrcamento, payload);
        notify("Orçamento atualizado com sucesso.", "success");
      } else {
        await createOrcamento(payload);
        notify("Orçamento criado com sucesso.", "success");
      }
      onSaveSuccess?.();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Erro ao salvar orçamento.", "danger");
    } finally {
      setSalvando(false);
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={onHide}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitulo}>
            {idOrcamento ? `Editar Orçamento #${idOrcamento}` : "Novo Orçamento"}
          </h5>
          <button className={styles.btnFechar} onClick={onHide}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {carregandoDados ? (
            <div className="d-flex align-items-center gap-2 justify-content-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status" />
              <span>Carregando...</span>
            </div>
          ) : (
            <>
              {/* Cabeçalho do orçamento */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">Cliente *</label>
                  <select
                    className="form-select"
                    value={clienteId}
                    onChange={(e) => setClienteId(Number(e.target.value))}
                  >
                    <option value={0}>Selecione um cliente...</option>
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

                <div className="col-md-3">
                  <label className="form-label">Desconto (R$)</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    step={0.01}
                    value={valorDesconto}
                    onChange={(e) => setValorDesconto(Number(e.target.value))}
                  />
                </div>

                <div className="col-md-9">
                  <label className="form-label">Observações</label>
                  <input
                    className="form-control"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações opcionais"
                  />
                </div>
              </div>

              {/* Itens */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-semibold" style={{ color: "var(--color-primary-dark)" }}>
                  Itens do Orçamento
                </span>
                <button className="btn btn-sm btn-outline-primary" onClick={handleAddItem}>
                  + Adicionar Item
                </button>
              </div>

              <div className={styles.tabelaWrapper}>
                <table className={`table ${styles.itensTabela}`}>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th style={{ width: 90 }}>Qtd</th>
                      <th style={{ width: 130 }}>Preço Unit. (R$)</th>
                      <th style={{ width: 110 }}>Usar preço cadastro</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={it.produtoId}
                            onChange={(e) => handleItemChange(idx, "produtoId", Number(e.target.value))}
                          >
                            <option value={0}>Selecione...</option>
                            {produtos.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nome} ({p.codigoSku})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min={1}
                            value={it.quantidade}
                            onChange={(e) => handleItemChange(idx, "quantidade", Number(e.target.value))}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min={0}
                            step={0.01}
                            value={it.precoUnitario}
                            disabled={it.usarPrecoProduto}
                            onChange={(e) => handleItemChange(idx, "precoUnitario", Number(e.target.value))}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={it.usarPrecoProduto}
                            onChange={(e) => handleItemChange(idx, "usarPrecoProduto", e.target.checked)}
                          />
                        </td>
                        <td>
                          {itens.length > 1 && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-outline-secondary" onClick={onHide}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSalvar}
            disabled={salvando || carregandoDados}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
