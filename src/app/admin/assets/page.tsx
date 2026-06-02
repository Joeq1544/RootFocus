import { PixelSprite, SPRITE_CATALOG, PIXEL_PNG_SLOTS } from '@/components/pixel/sprites'

export default function AdminAssetsPage() {
  return (
    <section>
      <h1 className="mb-1 text-lg font-bold">Assets ({SPRITE_CATALOG.length})</h1>
      <p className="mb-3 text-xs text-black/60">
        Each asset renders as its current SVG. Replace one by dropping a PNG at{' '}
        <code>public/sprites/&lt;slug&gt;.png</code> and flipping its flag in{' '}
        <code>PIXEL_PNG_SLOTS</code> (see ASSETS.md).
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
        {SPRITE_CATALOG.map((asset, i) => {
          const overridden = PIXEL_PNG_SLOTS[asset.id]
          return (
            <div key={asset.id} className="flex gap-3 border border-black/30 p-2">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%)',
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0,0 6px,6px -6px,-6px 0',
                }}
              >
                <PixelSprite name={asset.id} className="h-14 w-14" />
              </div>
              <div className="min-w-0 text-xs">
                <div className="font-bold">
                  #{i + 1}{' '}
                  <code className="rounded bg-black/10 px-1">{asset.id}</code>
                </div>
                <div className="mt-1 text-black/70">{asset.description}</div>
                <div className="mt-1 text-black/50">
                  slot: <code>public/sprites/{asset.id}.png</code>
                </div>
                <div className="mt-1">
                  {overridden ? (
                    <span className="rounded bg-green-200 px-1 text-green-900">PNG active</span>
                  ) : (
                    <span className="rounded bg-black/10 px-1 text-black/60">SVG (default)</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
