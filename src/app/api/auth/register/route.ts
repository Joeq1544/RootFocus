import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { AVATAR_OPTIONS } from '@/components/pixel/sprites'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/
const AVATAR_SLUGS = AVATAR_OPTIONS.map((a) => a.slug)

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email, username, password, avatar } = body as Record<string, unknown>

  if (!name || !email || !username || !password) {
    return NextResponse.json({ error: 'Name, email, username, and password are required' }, { status: 400 })
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  if (typeof username !== 'string' || !USERNAME_REGEX.test(username.trim())) {
    return NextResponse.json(
      { error: 'Username must be 3–20 letters, numbers, or underscores' },
      { status: 400 },
    )
  }
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }
  let avatarValue: string | null = null
  if (avatar !== undefined && avatar !== null && avatar !== '') {
    if (typeof avatar !== 'string' || !AVATAR_SLUGS.includes(avatar)) {
      return NextResponse.json({ error: 'Invalid avatar' }, { status: 400 })
    }
    avatarValue = avatar
  }

  const trimmedUsername = username.trim()

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    const existingUsername = await prisma.user.findUnique({ where: { username: trimmedUsername } })
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          username: trimmedUsername,
          name: name.trim(),
          avatar: avatarValue,
          passwordHash,
        },
      })
      await tx.wateringStreak.create({
        data: { userId: newUser.id, currentStreak: 0, longestStreak: 0 },
      })
      return newUser
    })

    const token = await signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
        },
      },
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
