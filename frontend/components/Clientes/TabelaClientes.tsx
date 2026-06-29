"use client";

import { useEffect, useState } from "react";
import { Cliente } from "@/types/clientes";
import { getClientes, deleteCliente } from "@/app/(system)/clientes/actions";
import { notify } from "@/components/Notify";
import PopUpInclusaoEdicaoClientes from "./PopUpInclusaoEdicaoClientes";
import styles from "./Clientes.module.css";

export default function TabelaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [idSelecionado, setIdSelecionado] = useState<number | null | undefined>(null);

  const carregarClientes = async () => {
    setCarregando(true);
    const data = await getClientes({ nome: filtroNome, documento: filtroDocumento });
    setClientes(data);
    setCarregando(false);
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleNovo = () => {
    setIdSelecionado(null);
    setShowModal(true);
  };

  const handleEditar = (id: number | undefined) => {
    setIdSelecionado(id ?? null);
    setShowModal(true);
  };

  const handleExcluir = async (id: number | undefined) => {
    if (!id) return;
    if (!confirm("Confirma a exclusão deste cliente?")) return;
    try {
      await deleteCliente(id);
      notify("Cliente excluído com sucesso.", "success");
      carregarClientes();
    } catch {
      notify("Erro ao excluir cliente.", "danger");
    }
  };

  const handleSalvo = () => {
    setShowModal(false);
    carregarClientes();
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Clientes</h1>
          <p className={styles.subtitulo}>{clientes.length} cliente(s) encontrado(s)</p>
        </div>
        <button className={`btn btn-primary ${styles.btnNovo}`} onClick={handleNovo}>
          + Novo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nome..."
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por documento..."
          value={filtroDocumento}
          onChange={(e) => setFiltroDocumento(e.target.value)}
        />
        <button className="btn btn-outline-primary" onClick={carregarClientes}>
          Filtrar
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => { setFiltroNome(""); setFiltroDocumento(""); }}
        >
          Limpar
        </button>
      </div>

      {/* Tabela */}
      {carregando ? (
        <div className={styles.loading}>
          <div className="spinner-border text-primary" role="status" />
          <span>Carregando clientes...</span>
        </div>
      ) : (
        <div className={styles.tabelaWrapper}>
          <table className={`table table-hover ${styles.tabela}`}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Documento</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.vazio}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nome}</td>
                    <td className={styles.documento}>{c.documento || "—"}</td>
                    <td>{c.email || "—"}</td>
                    <td>{c.telefone || "—"}</td>
                    <td className={styles.acoes}>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEditar(c.id)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleExcluir(c.id)}
                      >
                        Excluir
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
      <PopUpInclusaoEdicaoClientes
        visible={showModal}
        codCliente={idSelecionado}
        onHide={() => setShowModal(false)}
        onSaveSuccess={handleSalvo}
      />
    </div>
  );
}
