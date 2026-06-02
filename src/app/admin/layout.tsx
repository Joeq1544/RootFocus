import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAdminToken } from '@/lib/auth'
import { AdminNav } from '@/components/admin/AdminNav'

export const metadata = { title: 'RootFocus Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('rootfocus-admin')?.value
  if (!token || !(await verifyAdminToken(token))) redirect('/login')

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }} className="min-h-screen bg-white text-black">
      <AdminNav />
      <main className="p-4">{children}</main>
    </div>
  )
}
