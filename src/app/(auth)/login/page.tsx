'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4 py-12">
      <div className="animate-fade-in w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl bg-white/80 px-8 py-10 shadow-lg shadow-soil/10 backdrop-blur-sm">
          {/* Leaf decoration */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
              <svg
                className="h-7 w-7 text-forest"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C8 2 5 5 5 9c0 3.5 2.5 6.5 6 7.4V20H9v2h6v-2h-2v-3.6c3.5-.9 6-3.9 6-7.4 0-4-3-7-7-7z" />
              </svg>
            </div>
          </div>

          <h1 className="font-playfair text-center text-3xl font-bold text-forest">
            Welcome back
          </h1>
          <p className="mt-2 text-center text-sm text-soil/60">
            Your garden has been waiting.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
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
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="mt-2 w-full"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-soil/60">
            New here?{' '}
            <Link href="/register" className="font-medium text-forest hover:underline">
              Start growing
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
