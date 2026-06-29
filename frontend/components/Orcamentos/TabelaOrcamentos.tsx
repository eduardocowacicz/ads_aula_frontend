"use client";

import { useCallback, useEffect, useState } from "react";
import { getOrcamentos } from "@/app/(system)/orcamentos/actions";
import type { Orcamento, SituacaoOrcamento } from "@/types/orcamentos";
import PopUpInclusaoEdicaoOrcamentos from "./PopUpInclusaoEdicaoOrcamentos";
import styles from "./Orcamentos.module.css";

const MESES = [
  { value: "", label: "Todos os meses" },
  { value: "1",  label: "Janeiro" },
  { value: "2",  label: "Fevereiro" },
  { value: "3",  label: "Março" },
  { value: "4",  label: "Abril" },
  { value: "5",  label: "Maio" },
  { value: "6",  label: "Junho" },
  { value: "7",  label: "Julho" },
  { value: "8",  label: "Agosto" },
  { value: "9",  label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const SITUACOES = [
  { value: "",          label: "Todas as situações" },
  { value: "pendente",  label: "Pendente" },
  { value: "enviado",   label: "Enviado" },
  { value: "aprovado",  label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
  { value: "cancelado", label: "Cancelado" },
];

const LABEL_SITUACAO: Record<SituacaoOrcamento, string> = {
  pendente:  "Pendente",
  enviado:   "Enviado",
  aprovado:  "Aprovado",
  rejeitado: "Rejeitado",
  cancelado: "Cancelado",
};

function anoAtual() {
  return new Date().getFullYear();
}

function badgeSituacao(situacao: SituacaoOrcamento) {
  const map: Record<SituacaoOrcamento, string> = {
    pendente:  styles.badgePendente,
    enviado:   styles.badgeEnviado,
    aprovado:  styles.badgeAprovado,
    rejeitado: styles.badgeRecusado,
    cancelado: styles.badgeCancelado,
  };
  return map[situacao] ?? styles.badgePendente;
}

function formatarData(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatarMoeda(valor?: number) {
  if (valor === undefined || valor === null) return "—";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function TabelaOrcamentos() {
  const anoDefault = String(anoAtual());
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState(anoDefault);
  const [filtroSituacao, setFiltroSituacao] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [idSelecionado, setIdSelecionado] = useState<number | null | undefined>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await getOrcamentos({
        mes: filtroMes,
        ano: filtroAno,
        situacao: filtroSituacao,
      });
      setOrcamentos(data);
    } catch {
      setErro("Não foi possível carregar os orçamentos.");
    } finally {
      setCarregando(false);
    }
  }, [filtroMes, filtroAno, filtroSituacao]);

  useEffect(() => {
    void carregar();
  }, []);

  const handleFiltrar = () => carregar();

  const handleLimpar = () => {
    setFiltroMes("");
    setFiltroAno(anoDefault);
    setFiltroSituacao("");
  };

  const handleNovo = () => {
    setIdSelecionado(null);
    setShowModal(true);
  };

  const handleEditar = (id: number | undefined) => {
    setIdSelecionado(id ?? null);
    setShowModal(true);
  };

  const handleSalvo = () => {
    setShowModal(false);
    carregar();
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Orçamentos</h1>
          <p className={styles.subtitulo}>{orcamentos.length} orçamento(s) encontrado(s)</p>
        </div>
        <button className={`btn btn-primary ${styles.btnNovo}`} onClick={handleNovo}>
          + Novo Orçamento
        </button>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <select
          className="form-select"
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
        >
          {MESES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <input
          type="number"
          className="form-control"
          placeholder="Ano (ex: 2026)"
          value={filtroAno}
          onChange={(e) => setFiltroAno(e.target.value)}
          min={2000}
          max={2100}
        />

        <select
          className="form-select"
          value={filtroSituacao}
          onChange={(e) => setFiltroSituacao(e.target.value)}
        >
          {SITUACOES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <button className="btn btn-outline-primary" onClick={handleFiltrar}>
          Filtrar
        </button>
        <button className="btn btn-outline-secondary" onClick={handleLimpar}>
          Limpar
        </button>
      </div>

      {/* Estados */}
      {carregando && (
        <div className={styles.loading}>
          <div className="spinner-border text-primary" role="status" />
          <span>Carregando orçamentos...</span>
        </div>
      )}

      {erro && (
        <div className="alert alert-danger">{erro}</div>
      )}

      {/* Tabela */}
      {!carregando && !erro && (
        <div className={styles.tabelaWrapper}>
          <table className={`table table-hover ${styles.tabela}`}>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Total</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.vazio}>
                    Nenhum orçamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                orcamentos.map((o) => (
                  <tr key={o.id}>
                    <td className={styles.idCol}>#{o.id}</td>
                    <td>{o.cliente?.nome ?? `Cliente #${o.clienteId}`}</td>
                    <td>{formatarData(o.criadoEm)}</td>
                    <td className={styles.total}>{formatarMoeda(o.total)}</td>
                    <td>
                      <span className={`${styles.badge} ${badgeSituacao(o.situacao)}`}>
                        {LABEL_SITUACAO[o.situacao] ?? o.situacao}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEditar(o.id)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <PopUpInclusaoEdicaoOrcamentos
        visible={showModal}
        codOrcamento={idSelecionado}
        onHide={() => setShowModal(false)}
        onSaveSuccess={handleSalvo}
      />
    </div>
  );
}
