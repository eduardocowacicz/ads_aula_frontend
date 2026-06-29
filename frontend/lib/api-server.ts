import 'server-only'

import { cookies } from 'next/headers'

/** Chamada autenticada ao backend (JWT em cookie `jwt-token`). Só no servidor. */
export async function apiServerFetch(
	path: string,
	init?: RequestInit,
): Promise<Response> {
	
	const base = (process.env.BACKEND_API_URL ?? '').replace(/\/$/, '')
	const p = path.startsWith('/') ? path : `/${path}`
	const jwt = (await cookies()).get('jwt-token')?.value ?? ''
	const headers = new Headers(init?.headers)
	headers.set('Authorization', `Bearer ${jwt}`)
	headers.set('Content-Type', 'application/json')

	try {
		return await fetch(`${base}${p}`, { ...init, headers })
	} catch {
		throw new Error('Não foi possível conectar à API. Verifique se o servidor está em execução.')
	}
}
