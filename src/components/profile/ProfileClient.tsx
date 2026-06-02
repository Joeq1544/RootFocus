'use client'

import { useState } from 'react'
import type { User } from '@/types'
import { useAuth } from '@/components/providers/AuthProvider'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AVATAR_OPTIONS } from '@/components/pixel/sprites'
import { formatDateGroup } from '@/lib/format'

const USERNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000

interface ProfileClientProps {
  initialUser: User
}

type Msg = { type: 'ok' | 'err'; text: string } | null

async function patchUser(body: Record<string, unknown>): Promise<{ ok: boolean; user?: User; error?: string }> {
  const res = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  let data: Record<string, unknown> = {}
  try {
    data = await res.json()
  } catch {
    /* ignore */
  }
  if (!res.ok) return { ok: false, error: typeof data.error === 'string' ? data.error : 'Something went wrong' }
  return { ok: true, user: data.user as User }
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pixel-panel p-6 sm:p-8">
      <h2 className="font-pixel text-xl font-bold text-forest">{title}</h2>
      <div className="mt-2 h-0.5 bg-panel-border/40" />
      <div className="mt-5">{children}</div>
    </section>
  )
}

function MsgLine({ msg }: { msg: Msg }) {
  if (!msg) return null
  return (
    <span className={`font-pixel text-sm font-medium ${msg.type === 'ok' ? 'text-forest' : 'text-red-600'}`}>
      {msg.text}
    </span>
  )
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const { setUser } = useAuth()
  const [user, setLocalUser] = useState<User>(initialUser)

  function apply(updated: User) {
    setLocalUser(updated)
    setUser(updated)
  }

  // ── Name + avatar ───────────────────────────────────────────────────────
  const [name, setName] = useState(user.name ?? '')
  const [avatar, setAvatar] = useState<string | null>(user.avatar)
  const [identitySaving, setIdentitySaving] = useState(false)
  const [identityMsg, setIdentityMsg] = useState<Msg>(null)

  async function saveIdentity() {
    setIdentitySaving(true)
    setIdentityMsg(null)
    const res = await patchUser({ name, avatar })
    if (!res.ok) setIdentityMsg({ type: 'err', text: res.error! })
    else {
      apply(res.user!)
      setIdentityMsg({ type: 'ok', text: 'Saved!' })
      setTimeout(() => setIdentityMsg(null), 3000)
    }
    setIdentitySaving(false)
  }

  // ── Username (rate limited) ──────────────────────────────────────────────
  const [username, setUsername] = useState(user.username)
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameMsg, setUsernameMsg] = useState<Msg>(null)

  const changedAt = user.usernameChangedAt ? new Date(user.usernameChangedAt).getTime() : null
  const lockedUntil = changedAt && Date.now() - changedAt < USERNAME_COOLDOWN_MS
    ? new Date(changedAt + USERNAME_COOLDOWN_MS)
    : null

  async function saveUsername() {
    if (username.trim() === user.username) {
      setUsernameMsg({ type: 'err', text: 'That is already your username' })
      return
    }
    setUsernameSaving(true)
    setUsernameMsg(null)
    const res = await patchUser({ username: username.trim() })
    if (!res.ok) setUsernameMsg({ type: 'err', text: res.error! })
    else {
      apply(res.user!)
      setUsernameMsg({ type: 'ok', text: 'Username updated!' })
    }
    setUsernameSaving(false)
  }

  // ── Password ─────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<Msg>(null)

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'err', text: 'New passwords do not match' })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    const res = await patchUser({ currentPassword, newPassword })
    if (!res.ok) setPwMsg({ type: 'err', text: res.error! })
    else {
      setPwMsg({ type: 'ok', text: 'Password updated!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwMsg(null), 3000)
    }
    setPwSaving(false)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="font-pixel text-3xl font-bold text-forest drop-shadow-[2px_2px_0_rgba(255,255,255,0.6)] sm:text-4xl">
          Profile
        </h1>
        <p className="mt-1 font-pixel text-sm text-soil/80">Your gardener identity</p>
      </header>

      {/* Identity card */}
      <Panel title="Who you are">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            <Avatar name={name} username={user.username} avatar={avatar} className="h-20 w-20" />
            <p className="font-pixel text-xs text-bark/50">@{user.username}</p>
          </div>

          <div className="flex-1 space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />

            <div>
              <p className="font-pixel text-sm font-medium text-bark">Avatar</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setAvatar(null)}
                  title="Use my initial"
                  className={`flex h-10 w-10 items-center justify-center rounded-[4px] font-pixel text-sm font-bold transition-transform active:translate-y-0.5 ${
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
                    className={`flex h-10 w-10 items-center justify-center rounded-[4px] transition-transform active:translate-y-0.5 ${
                      avatar === opt.slug ? 'bg-forest shadow-pixel-sm' : 'bg-panel-inset'
                    }`}
                  >
                    <Avatar avatar={opt.slug} className="h-8 w-8 !bg-transparent !shadow-none" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button type="button" variant="primary" disabled={identitySaving} onClick={saveIdentity}>
                {identitySaving ? 'Saving…' : 'Save changes'}
              </Button>
              <MsgLine msg={identityMsg} />
            </div>

            <p className="font-pixel text-xs text-bark/40">
              {user.email} · member since {formatDateGroup(user.createdAt.slice(0, 10))}
            </p>
          </div>
        </div>
      </Panel>

      {/* Username card */}
      <Panel title="Username">
        <p className="mb-3 text-sm text-bark/60">
          Your handle for future social features. You can change it once every 30 days.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!!lockedUntil}
              placeholder="3–20 letters, numbers, _"
            />
          </div>
          <Button type="button" variant="primary" disabled={usernameSaving || !!lockedUntil} onClick={saveUsername}>
            {usernameSaving ? 'Saving…' : 'Change'}
          </Button>
        </div>
        <div className="mt-2">
          {lockedUntil ? (
            <p className="font-pixel text-xs text-bark/50">
              You can change your username again on {formatDateGroup(lockedUntil.toISOString().slice(0, 10))}.
            </p>
          ) : (
            <MsgLine msg={usernameMsg} />
          )}
        </div>
      </Panel>

      {/* Password card */}
      <Panel title="Change password">
        <form onSubmit={savePassword} className="space-y-3">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          <div className="flex items-center gap-4 pt-1">
            <Button type="submit" variant="primary" disabled={pwSaving}>
              {pwSaving ? 'Updating…' : 'Update password'}
            </Button>
            <MsgLine msg={pwMsg} />
          </div>
        </form>
      </Panel>
    </div>
  )
}
