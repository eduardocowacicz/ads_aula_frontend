"use client";

import { useEffect, useState } from "react";
import { Cliente } from "@/types/clientes";
import { createCliente, getCliente, updateCliente } from "@/app/(system)/clientes/actions";
import { notify } from "@/components/Notify";
import styles from "./Clientes.module.css";

type Props = {
  visible: boolean;
  codCliente: number | null | undefined;
  onHide: () => void;
  onSaveSuccess?: () => void;
};

export default function PopUpInclusaoEdicaoClientes({
  visible,
  codCliente,
  onHide,
  onSaveSuccess,
}: Props) {
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (codCliente) {
      getCliente(codCliente).then((c: Cliente) => {
        if (!c) return;
        setNome(c.nome ?? "");
        setDocumento(c.documento ?? "");
        setEmail(c.email ?? "");
        setTelefone(c.telefone ?? "");
        setObservacoes(c.observacoes ?? "");
      });
    } else {
      setNome("");
      setDocumento("");
      setEmail("");
      setTelefone("");
      setObservacoes("");
    }
  }, [visible, codCliente]);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      notify("Informe o nome do cliente.", "warning");
      return;
    }
    setSalvando(true);
    try {
      const payload = {
        nome: nome.trim(),
        documento: documento.trim() || undefined,
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      };
      if (codCliente) {
        await updateCliente(codCliente, payload);
        notify("Cliente atualizado com sucesso.", "success");
      } else {
        await createCliente(payload);
        notify("Cliente cadastrado com sucesso.", "success");
      }
      onSaveSuccess?.();
    } catch {
      notify("Erro ao salvar cliente.", "danger");
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
            {codCliente ? "Editar Cliente" : "Novo Cliente"}
          </h5>
          <button className={styles.btnFechar} onClick={onHide}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Nome *</label>
              <input
                className="form-control"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome / razão social"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Documento</label>
              <input
                className="form-control"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="CPF / CNPJ"
              />
            </div>
            <div className="col-md-7">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@cliente.com"
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">Telefone</label>
              <input
                className="form-control"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Observações</label>
              <textarea
                className="form-control"
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações opcionais"
              />
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
