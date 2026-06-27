'use client'

// Página de login. É um Client Component ('use client') porque usa um hook do
// React (useActionState) para mostrar mensagem de erro sem recarregar a página.
//
// O formulário envia os dados para a server action `login` (em ./actions.ts),
// que valida as credenciais na API e grava o cookie `jwt-token`.
//
// O HTML usa classes do Bootstrap. Fique à vontade para restilizar.

import { useActionState } from 'react'
import { login } from './actions'

export default function Login() {
  // useActionState liga o formulário à server action e expõe o `state`
  // retornado por ela (aqui usamos para exibir o erro de login).
  const [state, formAction] = useActionState(login, undefined)

  return (
    <div className="card shadow border-0 rounded-4">
      <div className="card-body p-4">
        <h2 className="text-center mb-4">Login</h2>

        {state?.error && (
          <div className="alert alert-danger" role="alert">
            {state.error}
          </div>
        )}

        <form action={formAction}>
          <div className="mb-3">
            <label htmlFor="loginEmail" className="form-label">
              Email
            </label>
            <input
              id="loginEmail"
              name="email"
              type="email"
              autoComplete="email"
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="loginPassword" className="form-label">
              Senha
            </label>
            <input
              id="loginPassword"
              name="password"
              type="password"
              autoComplete="current-password"
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
