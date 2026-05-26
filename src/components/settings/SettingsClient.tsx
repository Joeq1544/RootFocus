'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { formatDateGroup } from '@/lib/format'

interface SettingsClientProps {
  initialUser: User
}

// ── Shared UI helpers ──────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-soil/15 bg-white p-8 shadow-sm">
      <h2 className="font-playfair text-xl font-bold text-forest">{title}</h2>
      <div className="mt-1 h-px bg-soil/10" />
      <div className="mt-6">{children}</div>
    </section>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wider text-soil/60">{children}</label>
}

function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 w-full rounded-xl border border-soil/20 bg-mist px-4 py-2.5 text-sm text-forest placeholder:text-soil/30 focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/10"
    />
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm text-soil">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-forest' : 'bg-soil/20'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </label>
  )
}

function SaveButton({ saving, label = 'Save changes' }: { saving: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-mist transition-colors hover:bg-forest/80 disabled:opacity-50"
    >
      {saving ? 'Saving…' : label}
    </button>
  )
}

// ── Profile Section ────────────────────────────────────────────────────────────

function ProfileSection({ initialUser }: { initialUser: User }) {
  const [username, setUsername] = useState(initialUser.username)
  const [email, setEmail] = useState(initialUser.email)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      })
      const data = await res.json() as Record<string, unknown>
      if (!res.ok) {
        setProfileMsg({ type: 'err', text: typeof data.error === 'string' ? data.error : 'Failed to save' })
      } else {
        setProfileMsg({ type: 'ok', text: 'Saved!' })
        setTimeout(() => setProfileMsg(null), 3000)
      }
    } catch {
      setProfileMsg({ type: 'err', text: 'Network error' })
    } finally {
      setProfileSaving(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'err', text: 'New passwords do not match' })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json() as Record<string, unknown>
      if (!res.ok) {
        setPwMsg({ type: 'err', text: typeof data.error === 'string' ? data.error : 'Failed to update password' })
      } else {
        setPwMsg({ type: 'ok', text: 'Password updated!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPwMsg(null), 3000)
      }
    } catch {
      setPwMsg({ type: 'err', text: 'Network error' })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <SectionCard title="Profile">
      <form onSubmit={saveProfile} className="space-y-4">
        <div>
          <FieldLabel>Username</FieldLabel>
          <TextInput value={username} onChange={setUsername} />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput value={email} onChange={setEmail} type="email" />
        </div>
        <div className="flex items-center gap-4">
          <SaveButton saving={profileSaving} />
          {profileMsg && (
            <span className={`text-sm font-medium ${profileMsg.type === 'ok' ? 'text-forest' : 'text-red-600'}`}>
              {profileMsg.text}
            </span>
          )}
        </div>
        <p className="text-xs text-soil/40">
          Member since {formatDateGroup(initialUser.createdAt)}
        </p>
      </form>

      <div className="mt-8 border-t border-soil/10 pt-6">
        <p className="mb-4 text-sm font-semibold text-soil">Change password</p>
        <form onSubmit={savePassword} className="space-y-3">
          <div>
            <FieldLabel>Current password</FieldLabel>
            <TextInput value={currentPassword} onChange={setCurrentPassword} type="password" />
          </div>
          <div>
            <FieldLabel>New password</FieldLabel>
            <TextInput value={newPassword} onChange={setNewPassword} type="password" placeholder="Min. 8 characters" />
          </div>
          <div>
            <FieldLabel>Confirm new password</FieldLabel>
            <TextInput value={confirmPassword} onChange={setConfirmPassword} type="password" />
          </div>
          <div className="flex items-center gap-4">
            <SaveButton saving={pwSaving} label="Update password" />
            {pwMsg && (
              <span className={`text-sm font-medium ${pwMsg.type === 'ok' ? 'text-forest' : 'text-red-600'}`}>
                {pwMsg.text}
              </span>
            )}
          </div>
        </form>
      </div>
    </SectionCard>
  )
}

// ── Timer Prefs ────────────────────────────────────────────────────────────────

interface TimerPrefs {
  mode: 'pomodoro' | 'long' | 'custom'
  workMinutes: number
  breakMinutes: number
  soundEnabled: boolean
  autoStartBreak: boolean
}

const TIMER_DEFAULTS: TimerPrefs = {
  mode: 'pomodoro',
  workMinutes: 25,
  breakMinutes: 5,
  soundEnabled: true,
  autoStartBreak: false,
}

function TimerPrefsSection() {
  const [prefs, setPrefs] = useState<TimerPrefs>(TIMER_DEFAULTS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rootfocus.timerPrefs')
      if (raw) setPrefs({ ...TIMER_DEFAULTS, ...(JSON.parse(raw) as Partial<TimerPrefs>) })
    } catch {}
  }, [])

  function update(patch: Partial<TimerPrefs>) {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    try { localStorage.setItem('rootfocus.timerPrefs', JSON.stringify(next)) } catch {}
  }

  return (
    <SectionCard title="Timer Preferences">
      <div className="space-y-5">
        <div>
          <FieldLabel>Default mode</FieldLabel>
          <select
            value={prefs.mode}
            onChange={(e) => update({ mode: e.target.value as TimerPrefs['mode'] })}
            className="mt-1 w-full rounded-xl border border-soil/20 bg-mist px-4 py-2.5 text-sm text-forest focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/10"
          >
            <option value="pomodoro">Pomodoro (25 min / 5 min break)</option>
            <option value="long">Long Focus (50 min / 10 min break)</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {prefs.mode === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Work duration (min)</FieldLabel>
              <input
                type="number"
                min={1}
                max={120}
                value={prefs.workMinutes}
                onChange={(e) => update({ workMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
                className="mt-1 w-full rounded-xl border border-soil/20 bg-mist px-4 py-2.5 text-sm text-forest focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/10"
              />
            </div>
            <div>
              <FieldLabel>Break duration (min)</FieldLabel>
              <input
                type="number"
                min={1}
                max={60}
                value={prefs.breakMinutes}
                onChange={(e) => update({ breakMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
                className="mt-1 w-full rounded-xl border border-soil/20 bg-mist px-4 py-2.5 text-sm text-forest focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/10"
              />
            </div>
          </div>
        )}

        <Toggle checked={prefs.soundEnabled} onChange={(v) => update({ soundEnabled: v })} label="Sound on completion" />
        <Toggle checked={prefs.autoStartBreak} onChange={(v) => update({ autoStartBreak: v })} label="Auto-start break after session" />
      </div>
    </SectionCard>
  )
}

// ── Garden Prefs ───────────────────────────────────────────────────────────────

interface GardenPrefs {
  showUrgency: boolean
  showLastWatered: boolean
  plantSway: boolean
  sortBy: 'urgency' | 'alphabetical' | 'created'
}

const GARDEN_DEFAULTS: GardenPrefs = {
  showUrgency: true,
  showLastWatered: true,
  plantSway: true,
  sortBy: 'urgency',
}

function GardenPrefsSection() {
  const [prefs, setPrefs] = useState<GardenPrefs>(GARDEN_DEFAULTS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rootfocus.gardenPrefs')
      if (raw) setPrefs({ ...GARDEN_DEFAULTS, ...(JSON.parse(raw) as Partial<GardenPrefs>) })
    } catch {}
  }, [])

  function update(patch: Partial<GardenPrefs>) {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    try { localStorage.setItem('rootfocus.gardenPrefs', JSON.stringify(next)) } catch {}
  }

  return (
    <SectionCard title="Garden Preferences">
      <div className="space-y-5">
        <Toggle checked={prefs.showUrgency} onChange={(v) => update({ showUrgency: v })} label="Show urgency score on plants" />
        <Toggle checked={prefs.showLastWatered} onChange={(v) => update({ showLastWatered: v })} label="Show last watered time" />
        <Toggle checked={prefs.plantSway} onChange={(v) => update({ plantSway: v })} label="Plant sway animation" />

        <div>
          <FieldLabel>Sort plots by</FieldLabel>
          <select
            value={prefs.sortBy}
            onChange={(e) => update({ sortBy: e.target.value as GardenPrefs['sortBy'] })}
            className="mt-1 w-full rounded-xl border border-soil/20 bg-mist px-4 py-2.5 text-sm text-forest focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/10"
          >
            <option value="urgency">Urgency (most urgent first)</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="created">Date created</option>
          </select>
        </div>
      </div>
    </SectionCard>
  )
}

// ── Danger Zone ────────────────────────────────────────────────────────────────

function DangerZoneSection() {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch('/api/tasks/completed', { method: 'DELETE' })
      const data = await res.json() as Record<string, unknown>
      if (!res.ok) {
        setResult(typeof data.error === 'string' ? data.error : 'Failed to delete')
        setConfirming(false)
      } else {
        const count = typeof data.deletedCount === 'number' ? data.deletedCount : 0
        setResult(`Deleted ${count} harvested plant${count === 1 ? '' : 's'} from your garden.`)
        setConfirming(false)
        setTimeout(() => { window.location.href = '/garden' }, 1500)
      }
    } catch {
      setResult('Network error')
      setConfirming(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-red-200 bg-red-50/50 p-8 shadow-sm">
      <h2 className="font-playfair text-xl font-bold text-red-800">Danger Zone</h2>
      <div className="mt-1 h-px bg-red-200/60" />
      <div className="mt-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-red-800">Delete all completed tasks</p>
          <p className="mt-0.5 text-xs text-red-700/70">
            Permanently removes all harvested plants and their focus sessions. This cannot be undone.
          </p>
        </div>

        {!confirming && !result && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-700 transition-colors hover:border-red-500 hover:bg-red-100"
          >
            Delete harvested plants
          </button>
        )}

        {confirming && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-100/60 px-4 py-3">
            <p className="text-sm text-red-800">Are you sure? This cannot be undone.</p>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Cancel
            </button>
          </div>
        )}

        {result && (
          <p className="text-sm font-medium text-red-800">{result}</p>
        )}
      </div>
    </section>
  )
}

// ── Root export ────────────────────────────────────────────────────────────────

export function SettingsClient({ initialUser }: SettingsClientProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="font-playfair text-3xl font-bold text-forest sm:text-4xl">Settings</h1>
        <p className="mt-1 text-sm text-soil/70">Manage your profile and preferences</p>
      </header>

      <ProfileSection initialUser={initialUser} />
      <TimerPrefsSection />
      <GardenPrefsSection />
      <DangerZoneSection />
    </div>
  )
}
