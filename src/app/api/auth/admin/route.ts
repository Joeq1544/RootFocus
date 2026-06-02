import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken } from '@/lib/auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin3901'
const COOKIE = 'rootfocus-admin'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { password } = body as Record<string, unknown>
  if (typeof password !== 'string' || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await signAdminToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return response
}
