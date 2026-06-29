"use client";

import { useEffect, useState } from "react";
import type { Usuario } from "@/types/usuarios";
import {
  getUsuarioAtual,
  updateUsuarioAtual,
  alterarSenha,
} from "@/app/(system)/usuario/actions";
import { notify } from "@/components/Notify";

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // campos de edição do perfil
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [emailEdit, setEmailEdit] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  // campos de troca de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    getUsuarioAtual()
      .then((u) => {
        setUsuario(u);
        setNomeCompleto(u.nomeCompleto ?? "");
        setEmailEdit(u.email ?? "");
      })
      .catch(() => notify("Erro ao carregar dados do usuário.", "danger"))
      .finally(() => setCarregando(false));
  }, []);

  const handleSalvarPerfil = async () => {
    if (!nomeCompleto.trim()) {
      notify("O nome completo é obrigatório.", "warning");
      return;
    }
    setSalvandoPerfil(true);
    try {
      const atualizado = await updateUsuarioAtual({
        nomeCompleto: nomeCompleto.trim(),
        email: emailEdit.trim(),
      });
      setUsuario(atualizado);
      notify("Perfil atualizado com sucesso.", "success");
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Erro ao atualizar perfil.", "danger");
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      notify("Preencha todos os campos de senha.", "warning");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      notify("A nova senha e a confirmação não coincidem.", "warning");
      return;
    }
    if (novaSenha.length < 6) {
      notify("A nova senha deve ter no mínimo 6 caracteres.", "warning");
      return;
    }
    setSalvandoSenha(true);
    try {
      await alterarSenha({ senhaAtual, novaSenha });
      notify("Senha alterada com sucesso.", "success");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Erro ao alterar senha.", "danger");
    } finally {
      setSalvandoSenha(false);
    }
  };

  if (carregando) {
    return (
      <div className="d-flex align-items-center gap-3 justify-content-center p-5 text-secondary">
        <div className="spinner-border text-primary" role="status" />
        <span>Carregando perfil...</span>
      </div>
    );
  }

  if (!usuario) {
    return <div className="alert alert-danger">Não foi possível carregar os dados do usuário.</div>;
  }

  return (
    <div>
      <h1 className="fw-bold mb-4" style={{ color: "var(--color-primary-dark)" }}>
        Meu Perfil
      </h1>

      {/* Card de informações somente-leitura */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white fw-semibold border-bottom py-3">
          Informações da Conta
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3 text-secondary small">ID</div>
            <div className="col-md-9 fw-medium">{usuario.id}</div>
            <div className="col-md-3 text-secondary small">Perfil</div>
            <div className="col-md-9">
              <span className="badge bg-primary">{usuario.perfil}</span>
            </div>
            <div className="col-md-3 text-secondary small">Situação</div>
            <div className="col-md-9">
              <span className={`badge ${usuario.ativo ? "bg-success" : "bg-danger"}`}>
                {usuario.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="col-md-3 text-secondary small">Criado em</div>
            <div className="col-md-9">
              {new Date(usuario.criadoEm).toLocaleString("pt-BR")}
            </div>
            <div className="col-md-3 text-secondary small">Atualizado em</div>
            <div className="col-md-9">
              {new Date(usuario.atualizadoEm).toLocaleString("pt-BR")}
            </div>
          </div>
        </div>
      </div>

      {/* Card de edição de nome/email */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white fw-semibold border-bottom py-3">
          Editar Dados
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nome Completo *</label>
              <input
                className="form-control"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-control"
                value={emailEdit}
                onChange={(e) => setEmailEdit(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 d-flex justify-content-end">
            <button
              className="btn btn-primary"
              onClick={handleSalvarPerfil}
              disabled={salvandoPerfil}
            >
              {salvandoPerfil ? "Salvando..." : "Salvar Dados"}
            </button>
          </div>
        </div>
      </div>

      {/* Card de troca de senha */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-semibold border-bottom py-3">
          Alterar Senha
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Senha Atual *</label>
              <input
                type="password"
                className="form-control"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Nova Senha *</label>
              <input
                type="password"
                className="form-control"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Confirmar Nova Senha *</label>
              <input
                type="password"
                className="form-control"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="mt-3 d-flex justify-content-end">
            <button
              className="btn btn-warning text-dark fw-semibold"
              onClick={handleAlterarSenha}
              disabled={salvandoSenha}
            >
              {salvandoSenha ? "Alterando..." : "Alterar Senha"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
