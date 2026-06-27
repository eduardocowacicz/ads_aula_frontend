import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_COOKIE = 'jwt-token'

/** Rotas que não exigem JWT. */
const PUBLIC_PATHS = new Set<string>(['/', '/login'])

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(JWT_COOKIE)?.value
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Evita rodar proxy em assets estáticos do Next e em arquivos comuns.
     * Ajuste se tiver outras extensões em /public.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
