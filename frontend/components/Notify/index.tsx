'use client'

import { Toaster, toast } from 'sonner'

export type NotifyTipo = 'success' | 'danger' | 'warning'

/**
 * Exibe uma notificação na tela (requer `<Notify />` no layout).
 * Use apenas em Client Components ou em handlers no cliente.
 */
export function notify(
  mensagem: string,
  tipo: NotifyTipo = 'success',
  tempoExibicao = 4000,
) {
  const opts = { duration: tempoExibicao }
  if (tipo === 'success') {
    toast.success(mensagem, opts)
    return
  }
  if (tipo === 'danger') {
    toast.error(mensagem, opts)
    return
  }
  toast.warning(mensagem, opts)
}

/** Monta o container de toasts do Sonner (uma vez no `app/layout.tsx`). */
export default function Notify() {
  return (
    <Toaster
      richColors
      position="top-right"
      closeButton
      toastOptions={{ duration: 4000 }}
    />
  )
}
