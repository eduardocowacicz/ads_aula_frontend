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

	return fetch(`${base}${p}`, { ...init, headers })
}
