import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { User } from '@/types'
import { SettingsClient } from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true, createdAt: true, updatedAt: true },
  })

  if (!user) redirect('/login')

  const initialUser: User = {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }

  return <SettingsClient initialUser={initialUser} />
}
