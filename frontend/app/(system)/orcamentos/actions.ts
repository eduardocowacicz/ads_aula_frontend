'use server';

import { apiServerFetch } from '@/lib/api-server';
import type { Orcamento } from '@/types/orcamentos';

export async function getOrcamentos(params?: {
  mes?: string;
  ano?: string;
  situacao?: string;
}): Promise<Orcamento[]> {
  const query = new URLSearchParams();
  if (params?.mes) query.set('mes', params.mes);
  if (params?.ano) query.set('ano', params.ano);
  if (params?.situacao) query.set('situacao', params.situacao);
  const qs = query.toString();
  const response = await apiServerFetch(`/orcamentos${qs ? `?${qs}` : ''}`);
  return response.json();
}

export async function getOrcamento(id: number): Promise<Orcamento> {
  const response = await apiServerFetch(`/orcamentos/${id}`);
  return response.json();
}
