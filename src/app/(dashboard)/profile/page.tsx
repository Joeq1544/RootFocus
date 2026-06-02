import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import type { User } from '@/types'
import { ProfileClient } from '@/components/profile/ProfileClient'

export default async function ProfilePage() {
  const cookieStore = cookies()
  const token = cookieStore.get('rootfocus-token')?.value
  if (!token) redirect('/login')

  let userId: string
  try {
    const payload = await verifyToken(token)
    userId = payload.userId
  } catch {
    redirect('/login')
  }

  const u = await prisma.user.findUnique({ where: { id: userId } })
  if (!u) redirect('/login')

  const user: User = {
    id: u.id,
    email: u.email,
    username: u.username,
    name: u.name,
    avatar: u.avatar,
    usernameChangedAt: u.usernameChangedAt ? u.usernameChangedAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }

  return <ProfileClient initialUser={user} />
}
