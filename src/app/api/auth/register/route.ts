import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, username, password } = body as Record<string, unknown>

  if (!email || !username || !password) {
    return NextResponse.json({ error: 'Email, username, and password are required' }, { status: 400 })
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  if (typeof username !== 'string' || username.trim().length === 0) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, username: username.trim(), passwordHash },
      })
      await tx.wateringStreak.create({
        data: { userId: newUser.id, currentStreak: 0, longestStreak: 0 },
      })
      return newUser
    })

    const token = await signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, username: user.username } },
      { status: 201 },
    )
    response.cookies.set('rootfocus-token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
