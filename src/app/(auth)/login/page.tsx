'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PixelSprite } from '@/components/pixel/sprites'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      // Admin backdoor: blank email + admin password.
      if (email.trim() === '') {
        const res = await fetch('/api/auth/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        if (!res.ok) {
          setError('Invalid password')
          return
        }
        router.push('/admin')
        return
      }
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sky-scene px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <PixelSprite name="sun" className="sun-rays absolute right-10 top-10 h-20 w-20" />
        <PixelSprite name="cloud" className="animate-drift absolute left-[16%] top-20 h-12 w-24 opacity-85" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-20 bg-grass-dark shadow-[inset_0_4px_0_rgba(0,0,0,0.2)]" />

      <div className="animate-fade-in relative z-10 w-full max-w-md">
        <div className="pixel-panel px-8 py-9">
          <div className="mb-4 flex justify-center">
            <PixelSprite name="logo" className="h-16 w-16" />
          </div>

          <h1 className="text-center font-pixel text-3xl font-bold text-forest">Welcome back</h1>
          <p className="mt-2 text-center text-sm text-bark/60">Your garden has been waiting.</p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="rounded-[4px] bg-red-100 px-4 py-2.5 text-sm text-red-700 shadow-pixel-sm">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-bark/60">
            New here?{' '}
            <Link href="/register" className="font-pixel font-bold text-forest hover:underline">
              Start growing
            </Link>
          </p>
          <p className="mt-2 text-center text-[11px] text-bark/40">Admin? Leave email blank.</p>
        </div>
      </div>
    </div>
  )
}
