/**
 * Hand-authored pixel-art sprites rendered as crisp SVG.
 *
 * A sprite is a list of equal-width rows of single-character palette keys
 * ('.' or ' ' = transparent). `PixelGrid` merges horizontal runs of the same
 * colour into <rect>s and renders with shape-rendering: crispEdges so the art
 * stays sharp at any size. Ragged rows are tolerated (padded to the widest).
 *
 * To swap a sprite for real pixel-art later, see ASSETS.md — drop a PNG into
 * public/sprites/<name>.png and flip its flag in PIXEL_PNG_SLOTS.
 */

export type Palette = Record<string, string>

/** Shared palette across garden sprites. '.'/' ' are transparent. */
const PAL: Palette = {
  x: '#243314', // dark outline
  o: '#3a2a16', // brown outline
  d: '#4A2D1A', // soil dark
  D: '#6B4226', // soil
  m: '#8B5E3C', // soil light
  g: '#2D5016', // stem dark
  G: '#3D6B1F', // stem
  l: '#5C9132', // leaf
  L: '#7DB14A', // leaf light
  k: '#9A7B4F', // dry / wilt
  b: '#7C5A2A', // dead brown
  y: '#C99A33', // gold dark
  Y: '#E8C060', // gold light
  w: '#FBF3DE', // cream petal
  p: '#E48AA6', // pink petal
  c: '#C0673E', // clay
  C: '#8A4628', // clay dark
  e: '#D98A5E', // clay light
  a: '#3F90C4', // water
  A: '#8FD0EE', // water light
  s: '#F3C98B', // sun soft
  S: '#E8C060', // sun gold
  h: '#FFFFFF', // highlight / sparkle
  n: '#6B4226', // wheat stalk
  N: '#D8B65A', // wheat grain
  u: '#B7E0F0', // cloud
  U: '#FFFFFF', // cloud light
  t: '#2D5016', // butterfly body
  q: '#E8C060', // butterfly wing
  Q: '#F3C98B', // butterfly wing light
}

interface SpriteDef {
  rows: string[]
  palette?: Palette
}

const SOIL = ['....mDDDDDDm....', '...dDDDDDDDDd...', '...dddddddddd...']

const SPRITES: Record<string, SpriteDef> = {
  'plant-seed': {
    rows: [
      ...Array(11).fill('................'),
      '.......bb.......',
      '......obbo......',
      ...SOIL,
    ],
  },
  'plant-sprout': {
    rows: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '.......GG.......',
      '.....LLGGLL.....',
      '....LlLGGLlL....',
      '.......GG.......',
      '.......GG.......',
      '.......GG.......',
      '......xGGx......',
      '......xGGx......',
      ...SOIL,
    ],
  },
  'plant-growing': {
    rows: [
      '................',
      '................',
      '.......GG.......',
      '.....LLGGLL.....',
      '....LlLGGLlL....',
      '.......GG.......',
      '.....LLGGLL.....',
      '....LlLGGLlL....',
      '.......GG.......',
      '.......GG.......',
      '......xGGx......',
      '......xGGx......',
      '......xGGx......',
      ...SOIL,
    ],
  },
  'plant-blooming': {
    rows: [
      '......yYy.......',
      '.....YwpwY.....',
      '.....YpwpY.....',
      '......yYy.......',
      '.......GG.......',
      '.....LLGGLL.....',
      '....LlLGGLlL....',
      '.......GG.......',
      '.....LLGGLL.....',
      '.......GG.......',
      '......xGGx......',
      '......xGGx......',
      '......xGGx......',
      ...SOIL,
    ],
  },
  'plant-wilting': {
    rows: [
      '................',
      '................',
      '.......kk.......',
      '.....kk..kk.....',
      '....k.kGGk.k....',
      '.......GG.......',
      '....kk.GG..k....',
      '.......GG.kk....',
      '.......GG.......',
      '......kGG.......',
      '......xGGx......',
      '......xGGx......',
      '......xGGx......',
      ...SOIL,
    ],
  },
  'plant-dead': {
    rows: [
      '................',
      '................',
      '................',
      '.......bb.......',
      '......b.bb......',
      '.......bb.......',
      '......bb.b......',
      '.......bb.......',
      '......b.bb......',
      '.......bb.......',
      '......obbo......',
      '......obbo......',
      '......obbo......',
      ...SOIL,
    ],
  },
  'plant-completed': {
    rows: [
      '..h...yYy...h..',
      '.....YYYYY.....',
      '.....YwYwY.....',
      '..h..YYYYY..h..',
      '......yYy......',
      '.......GG......',
      '.....LLGGLL....',
      '....LlLGGLlL...',
      '.......GG......',
      '.....LLGGLL....',
      '......xGGx.....',
      '......xGGx.....',
      '......xGGx.....',
      ...SOIL,
    ],
  },
  pot: {
    rows: [
      '................',
      '................',
      '................',
      '................',
      '..xeeeeeeeeeex..',
      '..xCCCCCCCCCCx..',
      '...xccccccccx...',
      '...xceccccecx...',
      '....xccccccx....',
      '....xccccccx....',
      '.....xccccx.....',
      '.....xCCCCx.....',
      '......xxxx......',
      '................',
      '................',
      '................',
    ],
  },
  sun: {
    rows: [
      '.......SS.......',
      '...S...SS...S...',
      '....S..SS..S....',
      '.......SS.......',
      '...SSSsssssSS...',
      '....ssSSSSss....',
      '..S.sSSSSSSs.S..',
      'SS..sSShSSSs..SS',
      'SS..sSSSSSSs..SS',
      '..S.sSSSSSSs.S..',
      '....ssSSSSss....',
      '...SSSsssssSS...',
      '.......SS.......',
      '....S..SS..S....',
      '...S...SS...S...',
      '.......SS.......',
    ],
  },
  cloud: {
    rows: [
      '................',
      '................',
      '.....UUUU.......',
      '...UUuuuuUU.....',
      '..UuuuuuuuuUU...',
      '.UuuuuuuuuuuuU..',
      '.UuuuuuuuuuuuU..',
      '..UUuuuuuuuUU...',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  butterfly: {
    rows: [
      '................',
      '................',
      '................',
      '..QQ..tt..QQ....',
      '.QqqQ.tt.QqqQ...',
      '.QqqqQttQqqqQ...',
      '..QqqQttQqqQ....',
      '...QQtttttQQ....',
      '..QqqQttQqqQ....',
      '.QqqqQttQqqqQ...',
      '.QqqQ.tt.QqqQ...',
      '..QQ..tt..QQ....',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  wheat: {
    rows: [
      '.......N.......',
      '......NNN......',
      '.....N.N.N.....',
      '....NN.N.NN....',
      '...N.N.N.N.N...',
      '....NN.N.NN....',
      '.....N.N.N.....',
      '......NNN......',
      '.......n.......',
      '......n.n......',
      '.....n..n.n....',
      '....n...n..n...',
      '...n....n...n..',
      '........n......',
      '........n......',
      '................',
    ],
  },
  // Brand sprout — used for logo/favicon.
  logo: {
    rows: [
      '................',
      '................',
      '.......GG.......',
      '.....LLGGLL.....',
      '....LlLGGLlL....',
      '....LlLGGLlL....',
      '.....LLGGLL.....',
      '.......GG.......',
      '.......GG.......',
      '......xGGx......',
      '.....mDDDDm.....',
      '....dDDDDDDd....',
      '....dddddddd....',
      '................',
      '................',
      '................',
    ],
  },

  // ── Avatar sprites (selectable profile icons) ──────────────────────────────
  'avatar-flower': {
    rows: [
      '................',
      '......ppp.......',
      '.....pYwYp......',
      '.....pwYwp......',
      '.....pYwYp......',
      '......ppp.......',
      '.......GG.......',
      '.....LLGGLL.....',
      '....LlLGGLlL....',
      '.......GG.......',
      '......xGGx......',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  'avatar-mushroom': {
    palette: { R: '#C2452F', r: '#9E3324' },
    rows: [
      '................',
      '.....RRRRRR.....',
      '...RRRRRRRRRR...',
      '..RRhRRRRRhRR..',
      '..RRRRRRRRRRRR.',
      '..rRRRRRRRRRRr.',
      '...rrrrrrrrrr..',
      '.....wwwwww.....',
      '.....whhhw w....',
      '.....wwwwww.....',
      '.....wwwwww.....',
      '......wwww......',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  'avatar-acorn': {
    rows: [
      '................',
      '.......g.......',
      '.......g.......',
      '....CCCCCCCC....',
      '...CCCCCCCCCC...',
      '...CCCCCCCCCC...',
      '....bbbbbbbb....',
      '....bbbbbbbb....',
      '....bbbbbbbb....',
      '....bbbbbbbb....',
      '.....bbbbbb.....',
      '......bbbb......',
      '.......bb.......',
      '................',
      '................',
      '................',
    ],
  },
  'avatar-cactus': {
    rows: [
      '................',
      '.......y.......',
      '......lll......',
      '....l.lLl.l....',
      '....lllLllll...',
      '....lLlLlLl....',
      '....lLlLlLl....',
      '..l.lLlLlLl....',
      '..lllLlLlLl....',
      '....lLlLlLl....',
      '.....lllll.....',
      '.....ccccc.....',
      '....ccccccc....',
      '....ccccccc....',
      '................',
      '................',
    ],
  },
  'avatar-leaf': {
    rows: [
      '................',
      '.........ll....',
      '........lLLl...',
      '.......lLLLl...',
      '......lLLLlg...',
      '.....lLLLlg....',
      '....lLLLlg.....',
      '...lLLLlg......',
      '...lLLlg.......',
      '..lLLlg........',
      '..lLlg.........',
      '...gg..........',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  'avatar-mountain': {
    palette: { M: '#7E8AA0', V: '#4E5A70' },
    rows: [
      '................',
      '................',
      '.......h.......',
      '......hVh......',
      '......hhh......',
      '.....VhhhV.....',
      '....MVhhhVM....',
      '....MMVhVMM....',
      '...MMMMVMMMM...',
      '...MMMMMMMMM...',
      '..MMMMMMMMMMM..',
      '..VMMMMMMMMMV..',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  'avatar-moon': {
    palette: { O: '#EDE8C6', v: '#C9C49E' },
    rows: [
      '................',
      '.....OOOO.......',
      '...OOOOOOO......',
      '..OOOO..OO......',
      '..OOOv..OO......',
      '.OOOOO...O......',
      '.OOOvOO..O......',
      '.OOOOOO..O......',
      '.OOOOO...O......',
      '..OOOv..OO......',
      '..OOOO..OO......',
      '...OOOOOOO......',
      '.....OOOO.......',
      '................',
      '................',
      '................',
    ],
  },
}

/** Selectable profile avatars (slug → display label). */
export const AVATAR_OPTIONS: { slug: string; label: string }[] = [
  { slug: 'sprout', label: 'Sprout' },
  { slug: 'sun', label: 'Sun' },
  { slug: 'flower', label: 'Flower' },
  { slug: 'mushroom', label: 'Mushroom' },
  { slug: 'acorn', label: 'Acorn' },
  { slug: 'cactus', label: 'Cactus' },
  { slug: 'leaf', label: 'Leaf' },
  { slug: 'butterfly', label: 'Butterfly' },
  { slug: 'mountain', label: 'Mountain' },
  { slug: 'moon', label: 'Moon' },
]

/** Maps an avatar slug to the sprite name that renders it (reusing some art). */
export const AVATAR_SPRITE: Record<string, string> = {
  sprout: 'logo',
  sun: 'sun',
  butterfly: 'butterfly',
  flower: 'avatar-flower',
  mushroom: 'avatar-mushroom',
  acorn: 'avatar-acorn',
  cactus: 'avatar-cactus',
  leaf: 'avatar-leaf',
  mountain: 'avatar-mountain',
  moon: 'avatar-moon',
}

/** Slots a user can override with a real PNG (see ASSETS.md). Flip to true
 * once public/sprites/<name>.png exists. */
export const PIXEL_PNG_SLOTS: Record<string, boolean> = {}

/**
 * Ordered catalog of every replaceable sprite. `id` is the registry key and the
 * exact PNG filename to drop into public/sprites/<id>.png. Single source of
 * truth for the admin Assets page and ASSETS.md.
 */
export const SPRITE_CATALOG: { id: string; description: string }[] = [
  { id: 'plant-seed', description: 'Plant — seed stage (just planted)' },
  { id: 'plant-sprout', description: 'Plant — sprout stage' },
  { id: 'plant-growing', description: 'Plant — growing stage (leafy)' },
  { id: 'plant-blooming', description: 'Plant — blooming stage (flowering)' },
  { id: 'plant-wilting', description: 'Plant — wilting (overdue / needs attention)' },
  { id: 'plant-dead', description: 'Plant — dead (bare brown twig)' },
  { id: 'plant-completed', description: 'Plant — harvested / completed (golden, sparkles)' },
  { id: 'pot', description: 'Clay pot — container for a pot task’s subtasks' },
  { id: 'sun', description: 'Sun — ambient sky, header streak badge; also the “sun” avatar' },
  { id: 'cloud', description: 'Cloud — ambient sky drift' },
  { id: 'butterfly', description: 'Butterfly — ambient drift; also the “butterfly” avatar' },
  { id: 'wheat', description: 'Wheat sheaf — Harvest page icon / empty state' },
  { id: 'logo', description: 'Sprout logo / brand mark; also the default “sprout” avatar' },
  { id: 'avatar-flower', description: 'Avatar — flower' },
  { id: 'avatar-mushroom', description: 'Avatar — mushroom' },
  { id: 'avatar-acorn', description: 'Avatar — acorn' },
  { id: 'avatar-cactus', description: 'Avatar — cactus' },
  { id: 'avatar-leaf', description: 'Avatar — leaf' },
  { id: 'avatar-mountain', description: 'Avatar — mountain' },
  { id: 'avatar-moon', description: 'Avatar — moon' },
]

export function spriteExists(name: string): boolean {
  return name in SPRITES
}

interface PixelGridProps {
  rows: string[]
  palette: Palette
  className?: string
  title?: string
}

/** Renders a sprite grid as crisp SVG rects (merged horizontal runs). */
export function PixelGrid({ rows, palette, className, title }: PixelGridProps) {
  const width = rows.reduce((max, r) => Math.max(max, r.length), 0)
  const height = rows.length
  const rects: React.ReactNode[] = []

  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      const fill = palette[ch]
      if (!fill) {
        x++
        continue
      }
      let run = 1
      while (x + run < row.length && row[x + run] === ch) run++
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} fill={fill} />)
      x += run
    }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      shapeRendering="crispEdges"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {rects}
    </svg>
  )
}

interface PixelSpriteProps {
  name: keyof typeof SPRITES | string
  className?: string
  title?: string
}

/**
 * Renders a named pixel sprite. Prefers a user-supplied PNG when its slot is
 * enabled in PIXEL_PNG_SLOTS, otherwise renders the built-in SVG sprite.
 */
export function PixelSprite({ name, className, title }: PixelSpriteProps) {
  if (PIXEL_PNG_SLOTS[name]) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/sprites/${name}.png`} alt={title ?? ''} className={`pixelated ${className ?? ''}`} />
  }
  const def = SPRITES[name]
  if (!def) return null
  return <PixelGrid rows={def.rows} palette={{ ...PAL, ...def.palette }} className={className} title={title} />
}
