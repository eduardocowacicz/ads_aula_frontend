"use client";

import { useEffect, useState } from "react";
import { Produto } from "@/types/produtos";
import { createProduto, getProduto, updateProduto } from "@/app/(system)/produtos/actions";
import { notify } from "@/components/Notify";
import styles from "./Produtos.module.css";

type Props = {
  visible: boolean;
  codProduto: number | null | undefined;
  onHide: () => void;
  onSaveSuccess?: () => void;
};

export default function PopUpInclusaoEdicaoProdutos({
  visible,
  codProduto,
  onHide,
  onSaveSuccess,
}: Props) {
  const [codigoSku, setCodigoSku] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoUnitario, setPrecoUnitario] = useState(0);
  const [unidade, setUnidade] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (codProduto) {
      getProduto(codProduto).then((p: Produto) => {
        if (!p) return;
        setCodigoSku(p.codigoSku ?? "");
        setNome(p.nome ?? "");
        setDescricao(p.descricao ?? "");
        setPrecoUnitario(p.precoUnitario ?? 0);
        setUnidade(p.unidade ?? "");
        setAtivo(p.ativo ?? true);
      });
    } else {
      setCodigoSku("");
      setNome("");
      setDescricao("");
      setPrecoUnitario(0);
      setUnidade("");
      setAtivo(true);
    }
  }, [visible, codProduto]);

  const handleSalvar = async () => {
    if (!nome.trim() || !codigoSku.trim()) {
      notify("Preencha pelo menos o SKU e o Nome.", "warning");
      return;
    }
    setSalvando(true);
    try {
      const payload = { codigoSku, nome, descricao, precoUnitario, unidade, ativo };
      if (codProduto) {
        await updateProduto(codProduto, payload);
        notify("Produto atualizado com sucesso.", "success");
      } else {
        await createProduto(payload);
        notify("Produto cadastrado com sucesso.", "success");
      }
      onSaveSuccess?.();
    } catch {
      notify("Erro ao salvar produto.", "danger");
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
            {codProduto ? "Editar Produto" : "Novo Produto"}
          </h5>
          <button className={styles.btnFechar} onClick={onHide}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">SKU *</label>
              <input
                className="form-control"
                value={codigoSku}
                onChange={(e) => setCodigoSku(e.target.value)}
                placeholder="Ex: PROD-001"
              />
            </div>
            <div className="col-md-8">
              <label className="form-label">Nome *</label>
              <input
                className="form-control"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do produto"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-control"
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição opcional"
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">Preço Unitário (R$)</label>
              <input
                type="number"
                className="form-control"
                min={0}
                step={0.01}
                value={precoUnitario}
                onChange={(e) => setPrecoUnitario(Number(e.target.value))}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Unidade</label>
              <input
                className="form-control"
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                placeholder="Ex: un, kg, m²"
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="chkAtivo"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="chkAtivo">
                  {ativo ? "Ativo" : "Inativo"}
                </label>
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
