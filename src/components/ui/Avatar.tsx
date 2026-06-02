import { PixelSprite, AVATAR_SPRITE } from '@/components/pixel/sprites'

interface AvatarProps {
  name?: string | null
  username?: string | null
  avatar?: string | null
  /** Tailwind sizing classes for the badge/sprite box. */
  className?: string
}

function firstLetter(name?: string | null, username?: string | null): string {
  const source = (name?.trim() || username?.trim() || '?')
  return source.charAt(0).toUpperCase()
}

/**
 * Renders the user's chosen pixel avatar sprite, or — when no avatar is set —
 * a square badge with the first letter of their name (falling back to
 * username, then "?").
 */
export function Avatar({ name, username, avatar, className = 'h-9 w-9' }: AvatarProps) {
  const spriteName = avatar ? AVATAR_SPRITE[avatar] : undefined

  if (spriteName) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-[4px] bg-forest/90 shadow-pixel-sm ${className}`}
      >
        <PixelSprite name={spriteName} className="h-[85%] w-[85%]" title={`${avatar} avatar`} />
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-[4px] bg-forest font-pixel font-bold text-mist shadow-pixel-sm ${className}`}
    >
      {firstLetter(name, username)}
    </span>
  )
}
