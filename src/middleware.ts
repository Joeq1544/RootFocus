import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? '')

const PROTECTED_PAGES = ['/garden']
const PROTECTED_API_PREFIX = '/api'
const PUBLIC_API_PREFIX = '/api/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedPage = PROTECTED_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
  const isProtectedApi =
    pathname.startsWith(PROTECTED_API_PREFIX) &&
    !pathname.startsWith(PUBLIC_API_PREFIX)

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next()
  }

  const token = request.cookies.get('rootfocus-token')?.value

  if (token) {
    try {
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch {
      // fall through to unauthenticated handling
    }
  }

  if (isProtectedApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/garden', '/garden/:path*', '/api/:path*'],
}
