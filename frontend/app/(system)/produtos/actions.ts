'use server';

import { apiServerFetch } from '@/lib/api-server';
import { Produto } from '@/types/produtos';

export async function getProdutos(params?: { nome?: string; ativo?: string }) {
  const query = new URLSearchParams();
  if (params?.nome) query.set('nome', params.nome);
  if (params?.ativo !== undefined && params.ativo !== '') query.set('ativo', params.ativo);
  const qs = query.toString();
  const response = await apiServerFetch(`/produtos${qs ? `?${qs}` : ''}`);
  return response.json();
}

export async function getProduto(id: number | null | undefined) {
  if (!id) return null;
  const response = await apiServerFetch(`/produtos/${id}`);
  return response.json();
}

export async function createProduto(data: Omit<Produto, 'id'>) {
  const response = await apiServerFetch('/produtos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateProduto(id: number, data: Partial<Produto>) {
  const response = await apiServerFetch(`/produtos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteProduto(id: number) {
  await apiServerFetch(`/produtos/${id}`, { method: 'DELETE' });
}
