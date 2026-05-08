'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      await register(email, username, password)
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sunrise/20">
              <svg
                className="h-7 w-7 text-sunrise"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2s2-1 3-3c-1.5 1-3 2-4 3 0 0 2-4 6-4C21.93 1 17 8 17 8z" />
              </svg>
            </div>
          </div>

          <h1 className="font-playfair text-center text-3xl font-bold text-forest">
            Start Growing
          </h1>
          <p className="mt-2 text-center text-sm text-soil/60">
            Plant your first seed today.
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
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your gardener name"
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="secondary"
              disabled={isSubmitting}
              className="mt-2 w-full"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-soil/60">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-forest hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
