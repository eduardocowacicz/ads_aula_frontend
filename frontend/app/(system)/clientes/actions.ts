'use server';

import { apiServerFetch } from '@/lib/api-server';
import { Cliente } from '@/types/clientes';

export async function getClientes(params?: { nome?: string; documento?: string }) {
  const query = new URLSearchParams();
  if (params?.nome) query.set('nome', params.nome);
  if (params?.documento) query.set('documento', params.documento);
  const qs = query.toString();
  const response = await apiServerFetch(`/clientes${qs ? `?${qs}` : ''}`);
  return response.json();
}

export async function getCliente(id: number | null | undefined) {
  if (!id) return null;
  const response = await apiServerFetch(`/clientes/${id}`);
  return response.json();
}

export async function createCliente(data: Omit<Cliente, 'id'>) {
  const response = await apiServerFetch('/clientes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateCliente(id: number, data: Partial<Cliente>) {
  const response = await apiServerFetch(`/clientes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCliente(id: number) {
  await apiServerFetch(`/clientes/${id}`, { method: 'DELETE' });
}
