import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyToken } from '@/lib/auth'

export default async function HomePage() {
  const cookieStore = cookies()
  const token = cookieStore.get('rootfocus-token')?.value
  if (token) {
    try {
      await verifyToken(token)
      redirect('/garden')
    } catch {
      // invalid token — show landing page
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-forest">
      {/* Decorative leaf SVG — top right */}
      <svg
        className="absolute right-0 top-0 h-64 w-64 opacity-10 text-mist"
        viewBox="0 0 200 200"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M100 10 C140 10 190 50 190 100 C190 150 150 190 100 190 C60 190 10 150 10 100 C10 50 60 10 100 10 Z M100 30 C70 30 30 60 30 100 C30 140 60 170 100 170 C140 170 170 140 170 100 C170 60 140 30 100 30 Z" />
        <path d="M100 10 C100 10 100 190 100 190" strokeWidth="3" stroke="currentColor" fill="none" />
        <path d="M100 80 C80 60 40 70 30 100" strokeWidth="2" stroke="currentColor" fill="none" />
        <path d="M100 120 C120 100 160 110 170 100" strokeWidth="2" stroke="currentColor" fill="none" />
      </svg>

      {/* Decorative leaf SVG — bottom left */}
      <svg
        className="absolute bottom-0 left-0 h-48 w-48 opacity-10 text-sunrise rotate-180"
        viewBox="0 0 200 200"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20 180 C20 180 100 20 180 180 C140 160 60 160 20 180 Z" />
        <path d="M100 20 L100 180" strokeWidth="2" stroke="currentColor" fill="none" />
      </svg>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 animate-fade-in">
        {/* Hero */}
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <svg className="h-8 w-8 text-sunrise" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C8 2 5 5 5 9c0 3.5 2.5 6.5 6 7.4V20H9v2h6v-2h-2v-3.6c3.5-.9 6-3.9 6-7.4 0-4-3-7-7-7z" />
            </svg>
            <span className="font-playfair text-lg font-semibold text-sunrise tracking-widest uppercase">
              RootFocus
            </span>
          </div>

          <h1 className="font-playfair text-5xl font-bold text-mist leading-tight sm:text-6xl">
            Grow your focus.
            <br />
            <span className="text-sunrise">One task at a time.</span>
          </h1>

          <p className="mt-6 text-lg text-mist/70 max-w-md mx-auto">
            A garden for your goals — watch your tasks bloom as you tend to them with focused attention.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-sunrise px-8 py-3 font-semibold text-soil hover:bg-sunrise-light transition-colors duration-200"
            >
              Start Growing
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border-2 border-mist/40 px-8 py-3 font-semibold text-mist hover:border-mist hover:bg-mist/10 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid gap-6 sm:grid-cols-3 w-full max-w-3xl">
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 2C8 2 5 5 5 9c0 3.5 2.5 6.5 6 7.4V20H9v2h6v-2h-2v-3.6c3.5-.9 6-3.9 6-7.4 0-4-3-7-7-7z" />
              </svg>
            }
            title="Garden Dashboard"
            description="Each task is a plant. Watch them grow as you focus."
          />
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            }
            title="Focus Timer"
            description="Deep work sessions that water your garden."
          />
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2s2-1 3-3c-1.5 1-3 2-4 3 0 0 2-4 6-4C21.93 1 17 8 17 8z" />
              </svg>
            }
            title="Watering Streaks"
            description="Build daily habits that keep your garden alive."
          />
        </div>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-mist/10 bg-mist/5 p-6 text-center backdrop-blur-sm">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sunrise/20 text-sunrise">
        {icon}
      </div>
      <h3 className="font-playfair text-lg font-semibold text-mist">{title}</h3>
      <p className="mt-2 text-sm text-mist/60">{description}</p>
    </div>
  )
}
