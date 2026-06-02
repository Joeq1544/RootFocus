'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const TABS = [
  { href: '/admin', label: 'Users' },
  { href: '/admin/assets', label: 'Assets' },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/admin', { method: 'DELETE' })
    router.push('/login')
  }

  return (
    <nav className="flex items-center gap-1 border-b border-black/30 bg-black/5 px-4 py-2 text-sm">
      <strong className="mr-3">RootFocus Admin</strong>
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`rounded px-2 py-1 ${pathname === t.href ? 'bg-black text-white' : 'hover:bg-black/10'}`}
        >
          {t.label}
        </Link>
      ))}
      <button type="button" onClick={logout} className="ml-auto rounded border border-black/40 px-2 py-1 hover:bg-black/10">
        Log out
      </button>
    </nav>
  )
}
