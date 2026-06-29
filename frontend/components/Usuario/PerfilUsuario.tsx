"use client";

import { useEffect, useState } from "react";
import { Usuario } from "@/types/usuario";
import {
  getUsuarioAtual,
  updateUsuarioAtual,
  redefinirSenha,
} from "@/app/(system)/usuario/actions";
import { notify } from "@/components/Notify";
import styles from "./Usuario.module.css";

function formatarData(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [salvandoDados, setSalvandoDados] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    const data = await getUsuarioAtual();
    setUsuario(data);
    setNomeCompleto(data.nomeCompleto ?? "");
    setEmail(data.email ?? "");
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleSalvarDados = async () => {
    if (!nomeCompleto.trim() || !email.trim()) {
      notify("Preencha nome e e-mail.", "warning");
      return;
    }
    setSalvandoDados(true);
    try {
      await updateUsuarioAtual({ nomeCompleto: nomeCompleto.trim(), email: email.trim() });
      notify("Dados atualizados com sucesso.", "success");
      carregar();
    } catch {
      notify("Erro ao atualizar dados.", "danger");
    } finally {
      setSalvandoDados(false);
    }
  };

  const handleSalvarSenha = async () => {
    if (!senhaAtual || !novaSenha) {
      notify("Informe a senha atual e a nova senha.", "warning");
      return;
    }
    if (novaSenha.length < 6) {
      notify("A nova senha deve ter no mínimo 6 caracteres.", "warning");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      notify("A confirmação não confere com a nova senha.", "warning");
      return;
    }
    setSalvandoSenha(true);
    try {
      await redefinirSenha({ senhaAtual, novaSenha });
      notify("Senha alterada com sucesso.", "success");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch {
      notify("Não foi possível alterar a senha. Verifique a senha atual.", "danger");
    } finally {
      setSalvandoSenha(false);
    }
  };

  if (carregando) {
    return (
      <div className={styles.loading}>
        <div className="spinner-border text-primary" role="status" />
        <span>Carregando perfil...</span>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Meu Perfil</h1>
        <p className={styles.subtitulo}>Visualize e atualize seus dados de acesso</p>
      </div>

      <div className="row g-4">
        {/* Dados do usuário */}
        <div className="col-lg-7">
          <div className={styles.card}>
            <h5 className={styles.cardTitulo}>Dados cadastrais</h5>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Nome completo</label>
                <input
                  className="form-control"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button
                className="btn btn-primary"
                onClick={handleSalvarDados}
                disabled={salvandoDados}
              >
                {salvandoDados ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>

        {/* Informações da conta */}
        <div className="col-lg-5">
          <div className={styles.card}>
            <h5 className={styles.cardTitulo}>Informações da conta</h5>
            <ul className={styles.infoLista}>
              <li><span>ID</span><strong>#{usuario?.id}</strong></li>
              <li><span>Perfil</span><strong>{usuario?.perfil}</strong></li>
              <li>
                <span>Situação</span>
                <strong>{usuario?.ativo ? "Ativo" : "Inativo"}</strong>
              </li>
              <li><span>Criado em</span><strong>{formatarData(usuario?.criadoEm)}</strong></li>
              <li><span>Atualizado em</span><strong>{formatarData(usuario?.atualizadoEm)}</strong></li>
            </ul>
          </div>
        </div>

        {/* Troca de senha */}
        <div className="col-lg-7">
          <div className={styles.card}>
            <h5 className={styles.cardTitulo}>Alterar senha</h5>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Senha atual</label>
                <input
                  type="password"
                  className="form-control"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Nova senha</label>
                <input
                  type="password"
                  className="form-control"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Confirmar nova senha</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button
                className="btn btn-primary"
                onClick={handleSalvarSenha}
                disabled={salvandoSenha}
              >
                {salvandoSenha ? "Salvando..." : "Alterar senha"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
