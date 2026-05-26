import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

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
    const { username, email, currentPassword, newPassword } = input

    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Password change validation
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
    }

    // Email uniqueness check
    if (typeof email === 'string' && email.trim() !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: email.trim() } })
      if (existing) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 409 })
      }
    }

    const data: Record<string, string> = {}
    if (typeof username === 'string' && username.trim().length > 0) {
      data.username = username.trim()
    }
    if (typeof email === 'string' && email.trim().length > 0) {
      data.email = email.trim()
    }
    if (typeof newPassword === 'string' && newPassword.length > 0) {
      data.passwordHash = await bcrypt.hash(newPassword, 10)
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data,
      select: { id: true, email: true, username: true, createdAt: true, updatedAt: true },
    })

    return NextResponse.json({
      user: {
        ...updated,
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
