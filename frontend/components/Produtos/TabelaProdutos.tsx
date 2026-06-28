"use client";

import { useEffect, useState } from "react";
import { Produto } from "@/types/produtos";
import { getProdutos, deleteProduto } from "@/app/(system)/produtos/actions";
import { notify } from "@/components/Notify";
import PopUpInclusaoEdicaoProdutos from "./PopUpInclusaoEdicaoProdutos";
import styles from "./Produtos.module.css";

export default function TabelaProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [idSelecionado, setIdSelecionado] = useState<number | null | undefined>(null);
  const [idExcluindo, setIdExcluindo] = useState<number | null>(null);

  const carregarProdutos = async () => {
    setCarregando(true);
    const data = await getProdutos({ nome: filtroNome, ativo: filtroAtivo });
    setProdutos(data);
    setCarregando(false);
  };

  useEffect(() => {
    carregarProdutos();
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
    if (!confirm("Confirma a exclusão deste produto?")) return;
    try {
      await deleteProduto(id);
      notify("Produto excluído com sucesso.", "success");
      carregarProdutos();
    } catch {
      notify("Erro ao excluir produto.", "danger");
    }
  };

  const handleSalvo = () => {
    setShowModal(false);
    carregarProdutos();
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Produtos</h1>
          <p className={styles.subtitulo}>{produtos.length} produto(s) encontrado(s)</p>
        </div>
        <button className={`btn btn-primary ${styles.btnNovo}`} onClick={handleNovo}>
          + Novo Produto
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
        <select
          className="form-select"
          value={filtroAtivo}
          onChange={(e) => setFiltroAtivo(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <button className="btn btn-outline-primary" onClick={carregarProdutos}>
          Filtrar
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => { setFiltroNome(""); setFiltroAtivo(""); }}
        >
          Limpar
        </button>
      </div>

      {/* Tabela */}
      {carregando ? (
        <div className={styles.loading}>
          <div className="spinner-border text-primary" role="status" />
          <span>Carregando produtos...</span>
        </div>
      ) : (
        <div className={styles.tabelaWrapper}>
          <table className={`table table-hover ${styles.tabela}`}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nome</th>
                <th>Preço Unit.</th>
                <th>Unidade</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.vazio}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                produtos.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.sku}>{p.codigoSku}</td>
                    <td>{p.nome}</td>
                    <td>
                      {p.precoUnitario.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td>{p.unidade}</td>
                    <td>
                      <span className={`badge ${p.ativo ? styles.badgeAtivo : styles.badgeInativo}`}>
                        {p.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className={styles.acoes}>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEditar(p.id)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleExcluir(p.id)}
                        disabled={idExcluindo === p.id}
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
      <PopUpInclusaoEdicaoProdutos
        visible={showModal}
        codProduto={idSelecionado}
        onHide={() => setShowModal(false)}
        onSaveSuccess={handleSalvo}
      />
    </div>
  );
}
