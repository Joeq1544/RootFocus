import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { AVATAR_OPTIONS } from '@/components/pixel/sprites'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/
const AVATAR_SLUGS = AVATAR_OPTIONS.map((a) => a.slug)
const USERNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const input = body as Record<string, unknown>
    const { name, username, avatar, currentPassword, newPassword } = input

    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}

    // Display name (free to change)
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      }
      data.name = name.trim()
    }

    // Avatar (slug or null)
    if (avatar !== undefined) {
      if (avatar === null || avatar === '') {
        data.avatar = null
      } else if (typeof avatar === 'string' && AVATAR_SLUGS.includes(avatar)) {
        data.avatar = avatar
      } else {
        return NextResponse.json({ error: 'Invalid avatar' }, { status: 400 })
      }
    }

    // Username — unique + rate-limited to once / 30 days
    if (typeof username === 'string' && username.trim() !== user.username) {
      const next = username.trim()
      if (!USERNAME_REGEX.test(next)) {
        return NextResponse.json(
          { error: 'Username must be 3–20 letters, numbers, or underscores' },
          { status: 400 },
        )
      }
      if (user.usernameChangedAt) {
        const elapsed = Date.now() - user.usernameChangedAt.getTime()
        if (elapsed < USERNAME_COOLDOWN_MS) {
          const nextChangeAt = new Date(user.usernameChangedAt.getTime() + USERNAME_COOLDOWN_MS)
          return NextResponse.json(
            { error: 'You can only change your username once every 30 days', nextChangeAt: nextChangeAt.toISOString() },
            { status: 429 },
          )
        }
      }
      const existing = await prisma.user.findUnique({ where: { username: next } })
      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
      data.username = next
      data.usernameChangedAt = new Date()
    }

    // Password change
    if (newPassword !== undefined && newPassword !== null) {
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
      }
      if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 })
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 })
      }
      data.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        usernameChangedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      user: {
        ...updated,
        usernameChangedAt: updated.usernameChangedAt ? updated.usernameChangedAt.toISOString() : null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('[PATCH /api/users/me]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
