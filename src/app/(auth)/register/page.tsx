'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { PixelSprite, AVATAR_OPTIONS } from '@/components/pixel/sprites'

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (name.trim().length === 0) {
      setError('Please enter your name')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      await register({ name: name.trim(), username: username.trim(), email, password, avatar })
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
        <PixelSprite name="butterfly" className="animate-drift absolute left-[18%] top-24 h-10 w-10" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-20 bg-grass-dark shadow-[inset_0_4px_0_rgba(0,0,0,0.2)]" />

      <div className="animate-fade-in relative z-10 w-full max-w-md">
        <div className="pixel-panel px-8 py-9">
          <div className="mb-4 flex justify-center">
            <PixelSprite name="plant-sprout" className="h-16 w-16" />
          </div>

          <h1 className="text-center font-pixel text-3xl font-bold text-forest">Start Growing</h1>
          <p className="mt-2 text-center text-sm text-bark/60">Plant your first seed today.</p>

          {/* Avatar picker */}
          <div className="mb-5 flex flex-col items-center gap-2">
            <Avatar name={name} username={username} avatar={avatar} className="h-16 w-16" />
            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                type="button"
                onClick={() => setAvatar(null)}
                title="Use my initial"
                className={`flex h-9 w-9 items-center justify-center rounded-[4px] font-pixel text-sm font-bold transition-transform active:translate-y-0.5 ${
                  avatar === null ? 'bg-forest text-mist shadow-pixel-sm' : 'bg-panel-inset text-bark'
                }`}
              >
                {(name.trim()[0] ?? 'A').toUpperCase()}
              </button>
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.slug}
                  type="button"
                  onClick={() => setAvatar(opt.slug)}
                  title={opt.label}
                  className={`flex h-9 w-9 items-center justify-center rounded-[4px] transition-transform active:translate-y-0.5 ${
                    avatar === opt.slug ? 'bg-forest shadow-pixel-sm' : 'bg-panel-inset'
                  }`}
                >
                  <Avatar avatar={opt.slug} className="h-7 w-7 !bg-transparent !shadow-none" />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4" noValidate>
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              autoComplete="name"
              required
            />
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3–20 letters, numbers, _"
              autoComplete="username"
              required
            />
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
              <p className="rounded-[4px] bg-red-100 px-4 py-2.5 text-sm text-red-700 shadow-pixel-sm">
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

          <p className="mt-6 text-center text-sm text-bark/60">
            Already have an account?{' '}
            <Link href="/login" className="font-pixel font-bold text-forest hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
