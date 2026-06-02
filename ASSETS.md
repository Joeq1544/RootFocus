# RootFocus — Pixel-Art Asset Guide

RootFocus uses a **cozy pixel-art garden** look (Stardew-Valley-adjacent). Every
piece of thematic art is a sprite rendered by `PixelSprite`
([src/components/pixel/sprites.tsx](src/components/pixel/sprites.tsx)).

Right now those sprites are **hand-authored pixel-art SVG** (crisp `<rect>`
grids). They look intentionally pixelated and need no external files. When you
want richer, "realistic" pixel art, you can **drop in PNGs** — no component
changes required beyond flipping one flag.

---

## How the drop-in slot system works

`PixelSprite` resolves a sprite by `name` in this order:

1. If `PIXEL_PNG_SLOTS[name] === true` → it renders
   `<img src="/sprites/<name>.png" class="pixelated">` (crisp, no smoothing).
2. Otherwise → it renders the built-in SVG sprite for that name.

So to replace a sprite with real pixel art:

1. Generate the PNG (see prompts below).
2. Save it to **`public/sprites/<name>.png`** using the exact slot name.
3. In [src/components/pixel/sprites.tsx](src/components/pixel/sprites.tsx), set the
   flag in `PIXEL_PNG_SLOTS`, e.g.:
   ```ts
   export const PIXEL_PNG_SLOTS: Record<string, boolean> = {
     'plant-sprout': true,
     'plant-growing': true,
   }
   ```

That's it — the PNG appears everywhere that sprite is used (garden tiles, pots,
harvest cards, nav, hero, etc.). `image-rendering: pixelated` is already applied
so the pixels stay sharp at every size.

> Do **not** route these through `next/image` — its resizing smooths pixel art.
> The plain `<img class="pixelated">` path is intentional.

---

## Asset catalog (slot table)

This list mirrors `SPRITE_CATALOG` in
[src/components/pixel/sprites.tsx](src/components/pixel/sprites.tsx) and the
in-app **Admin → Assets** page (log in with a blank email + the admin password).
The `#` is just the order to work down the list; the **slug** is the exact
`public/sprites/<slug>.png` filename that replaces that asset.

| # | slug (`public/sprites/<slug>.png`) | size | description |
|---|---|---|---|
| 1 | `plant-seed` | 32×32 | Plant — seed stage (just planted) |
| 2 | `plant-sprout` | 32×32 | Plant — sprout stage |
| 3 | `plant-growing` | 32×32 | Plant — growing stage (leafy) |
| 4 | `plant-blooming` | 32×32 | Plant — blooming stage (flowering) |
| 5 | `plant-wilting` | 32×32 | Plant — wilting (overdue / needs attention) |
| 6 | `plant-dead` | 32×32 | Plant — dead (bare brown twig) |
| 7 | `plant-completed` | 32×32 | Plant — harvested / completed (golden, sparkles) |
| 8 | `pot` | 32×32 | Clay pot — container for a pot task's subtasks |
| 9 | `sun` | 32×32 | Sun — ambient sky, header streak badge; also the "sun" avatar |
| 10 | `cloud` | 32×16 | Cloud — ambient sky drift |
| 11 | `butterfly` | 16×16 | Butterfly — ambient drift; also the "butterfly" avatar |
| 12 | `wheat` | 32×32 | Wheat sheaf — Harvest page icon / empty state |
| 13 | `logo` | 32×32 | Sprout logo / brand mark; also the default "sprout" avatar |
| 14 | `avatar-flower` | 32×32 | Avatar — flower |
| 15 | `avatar-mushroom` | 32×32 | Avatar — mushroom |
| 16 | `avatar-acorn` | 32×32 | Avatar — acorn |
| 17 | `avatar-cactus` | 32×32 | Avatar — cactus |
| 18 | `avatar-leaf` | 32×32 | Avatar — leaf |
| 19 | `avatar-mountain` | 32×32 | Avatar — mountain |
| 20 | `avatar-moon` | 32×32 | Avatar — moon |

> Note the reused sprites: `logo`, `sun`, and `butterfly` double as the
> "sprout", "sun", and "butterfly" profile avatars — replacing one PNG updates
> both places.

All sprites are square-ish and drawn on a transparent background. The plant
sprites are bottom-anchored (soil mound at the bottom rows) so they "sit" in the
soil bed; keep that baseline when redrawing.

Render sizes vary (16–80px on screen); author at the listed logical size and the
`pixelated` scaling keeps them crisp. Provide @2x (e.g. 64×64) if you want extra
fidelity — the `<img>` will downscale cleanly.

---

## Palette

Match generated art to the project palette so everything feels cohesive:

| Role | Hex |
|---|---|
| Forest (dark leaf / primary) | `#2D5016` |
| Leaf | `#3D6B1F` |
| Leaf bright | `#5C9132` / `#7DB14A` |
| Soil dark | `#4A2D1A` |
| Soil | `#6B4226` |
| Soil light | `#8B5E3C` |
| Wood | `#7B4A2B` (light `#9C6B3F`, dark `#5A3620`) |
| Bark (outline/ink) | `#3E2817` |
| Clay (pots) | `#C0673E` (dark `#8A4628`, light `#D98A5E`) |
| Gold / sunrise | `#D4A843` / `#E8C060` |
| Sky | `#A8D8E8` |
| Grass | `#5C9132` (dark `#3D6B1F`) |
| Parchment (panels) | `#F3E4C6` |
| Cream / petal highlight | `#FBF3DE` |

---

## Generation prompts

Use these with any pixel-art image generator (Midjourney, DALL·E, Stable
Diffusion + a pixel-art LoRA, Aseprite AI, etc.). Common suffix to append to
each:

> *"…detailed hi-bit pixel art, cozy farming-game style (à la Stardew Valley),
> clean readable silhouette, soft top-left light source, transparent
> background, no anti-aliasing, no text, centered."*

- **plant-seed** — "a small seed mound just sprouting in dark soil, tiny green
  tip poking out."
- **plant-sprout** — "a young seedling: a thin green stem with two small leaves
  in a soil mound."
- **plant-growing** — "a leafy young plant with four green leaves on an upright
  stem in a soil mound."
- **plant-blooming** — "a healthy plant topped with a single open flower (warm
  pink/gold petals, cream center), green leaves below."
- **plant-wilting** — "a drooping, slightly dry plant with yellow-green wilting
  leaves, sad but alive."
- **plant-dead** — "a bare brown dead twig in dry soil, no leaves."
- **plant-completed** — "a fully-grown golden flower glowing softly with a few
  sparkles, celebratory, leaves below."
- **pot** — "a terracotta clay flower pot, front 3/4 view, empty soil at the
  rim, warm clay tones." (Plant sprites are overlaid above the rim in-app.)
- **sun** — "a friendly round pixel sun with short rays, warm gold."
- **cloud** — "a soft fluffy white pixel cloud, wide."
- **butterfly** — "a small pixel butterfly with gold/cream wings, top-down."
- **wheat** — "a tied bundle of golden wheat stalks (a sheaf)."
- **logo** — "a single cheerful sprout in soil — simple, iconic, works as a
  16px app icon."

### Optional extras (not yet wired as slots)
If you generate these, add matching entries to `SPRITES`/`PIXEL_PNG_SLOTS`:
- A wider **garden vista** banner for the landing hero.
- **Plot category icons** (currently lucide line icons): leaf, briefcase,
  school, dumbbell, heart, lightbulb, book, home — as 16×16 pixel icons.
- A **favicon** (`public/favicon.ico`/`icon.png`) from the `logo` sprite.

---

## Conventions

- File type: PNG with alpha (transparent background).
- Even dimensions (16, 32, 48, 64). Square unless noted (cloud is 2:1).
- No anti-aliasing / no semi-transparent edges — hard pixels only.
- Naming: exactly the slot name, lowercase, e.g. `public/sprites/plant-blooming.png`.
- Keep a consistent light direction and the project palette across all sprites.
