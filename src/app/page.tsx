import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyToken } from '@/lib/auth'
import { PixelSprite } from '@/components/pixel/sprites'

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
    <main className="relative min-h-screen overflow-hidden bg-sky-scene">
      {/* Pixel ambient sky */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <PixelSprite name="sun" className="sun-rays absolute right-8 top-8 h-24 w-24" />
        <PixelSprite name="cloud" className="animate-drift absolute left-[14%] top-16 h-16 w-28 opacity-90" />
        <PixelSprite name="cloud" className="animate-drift absolute right-[20%] top-40 h-12 w-20 opacity-80" />
        <PixelSprite name="butterfly" className="animate-drift absolute left-[24%] top-52 h-10 w-10" />
      </div>

      {/* Ground strip */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-grass-dark shadow-[inset_0_4px_0_rgba(0,0,0,0.2)]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 animate-fade-in">
        {/* Hero card */}
        <div className="pixel-panel max-w-xl px-8 py-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <PixelSprite name="logo" className="h-8 w-8" />
            <span className="font-pixel text-lg font-bold uppercase tracking-widest text-forest">
              RootFocus
            </span>
          </div>

          <h1 className="font-pixel text-4xl font-bold leading-tight text-forest sm:text-5xl">
            Grow your focus.
            <br />
            <span className="text-clay">One task at a time.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base text-bark/80">
            A garden for your goals — watch your tasks bloom as you tend to them with focused attention.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-[4px] bg-sunrise px-7 py-3 font-pixel font-bold text-bark shadow-pixel transition-transform active:translate-y-0.5"
            >
              Start Growing
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-[4px] bg-forest px-7 py-3 font-pixel font-bold text-mist shadow-pixel transition-transform active:translate-y-0.5"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature signs */}
        <div className="mt-16 grid w-full max-w-3xl gap-5 sm:grid-cols-3">
          <FeatureCard sprite="plant-growing" title="Garden Dashboard" description="Each task is a plant. Watch them grow as you focus." />
          <FeatureCard sprite="sun" title="Focus Timer" description="Deep work sessions that water your garden." />
          <FeatureCard sprite="plant-completed" title="Watering Streaks" description="Build daily habits that keep your garden alive." />
        </div>
      </div>
    </main>
  )
}

function FeatureCard({
  sprite,
  title,
  description,
}: {
  sprite: string
  title: string
  description: string
}) {
  return (
    <div className="pixel-panel pixel-panel-soft p-6 text-center">
      <PixelSprite name={sprite} className="mx-auto mb-2 h-12 w-12" />
      <h3 className="font-pixel text-lg font-bold text-forest">{title}</h3>
      <p className="mt-2 text-sm text-bark/70">{description}</p>
    </div>
  )
}
