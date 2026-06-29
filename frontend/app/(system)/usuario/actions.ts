'use server';

import { apiServerFetch } from '@/lib/api-server';
import { Usuario } from '@/types/usuario';

export async function getUsuarioAtual(): Promise<Usuario> {
  const response = await apiServerFetch('/usuarios/atual');
  return response.json();
}

export async function updateUsuarioAtual(data: { nomeCompleto?: string; email?: string }) {
  const response = await apiServerFetch('/usuarios/atual', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function redefinirSenha(data: { senhaAtual: string; novaSenha: string }) {
  const response = await apiServerFetch('/usuarios/atual/senha', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const erro = await response.json().catch(() => null);
    throw new Error(erro?.message ?? 'Erro ao redefinir senha.');
  }
  return response.json().catch(() => ({}));
}
