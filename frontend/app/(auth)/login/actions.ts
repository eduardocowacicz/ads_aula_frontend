'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type LoginActionState = {
  error?: string
}

export async function login(
  _prevState: LoginActionState | undefined,
  formData: FormData,
): Promise<LoginActionState> {
  const emailRaw = formData.get('email')
  const senhaRaw = formData.get('password')

  if (typeof emailRaw !== 'string' || typeof senhaRaw !== 'string') {
    return { error: 'Dados do formulário inválidos.' }
  }

  const email = emailRaw.trim()
  const senha = senhaRaw

  if (!email || !senha) {
    return { error: 'Preencha email e senha.' }
  }

  const backendApiUrl = process.env.BACKEND_API_URL

  const response = await fetch(`${backendApiUrl}/autenticacao/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })

  if (!response.ok) {
    return { error: 'Credenciais inválidas' }
  }

  const data = (await response.json()) as { accessToken?: string }
  
  if (!data.accessToken) {
    return { error: 'Resposta inválida do servidor.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('jwt-token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  redirect('/home')
}
