# Animated cursor

Replaces the native cursor with the animated `[SB]` Windows cursor set from
`public/static/cursor`. Only mounts on desktop devices with a fine pointer
(mouse/trackpad), and respects `prefers-reduced-motion`.

## How it works

Browsers cannot render `.ani` files, so `scripts/generate-cursors.mjs` parses
each RIFF/ANI container, extracts its embedded `.cur` frames, decodes the 32-bit
BGRA bitmaps (plus hotspots), dedupes identical frames, and writes:

- `public/static/cursor/generated/*.png` — one horizontal sprite sheet per cursor
- `components/cursor/cursors.json` — frame steps, durations, hotspot, loop flag

Re-run it after changing the `.ani` files (it uses `sharp`, which ships with
Next.js):

```bash
npm run cursors
```

If you add a new `.ani` file, give it a short slug in the `SLUGS` map inside the
script so the state name stays stable.

## States

The state is chosen automatically for links, buttons, text fields, disabled
controls and project cards. Override it per element with `data-cursor`:

```html
<div data-cursor="person">…</div>
<a data-cursor="link">…</a>
```

Available values:

`normal`, `link`, `text`, `busy`, `working`, `unavailable`, `help`, `precision`,
`move`, `person`, `location`, `handwriting`, `alternate`, `resize-h`,
`resize-v`, `resize-d1`, `resize-d2`.

Aliases such as `pointer`, `default`, `drag`, `crosshair`, `pen`, `map`,
`profile`, `resize-x`, `resize-y` and `loading` also work.

## Forcing a state from code

Useful while a form submits or a long task runs:

```ts
import { setGlobalCursor } from "@/components/cursor/AnimatedCursor";

setGlobalCursor("busy");
// …
setGlobalCursor(null); // release the override
```

Navigation already forces the `working` cursor through `isNavigating`, and the
initial page load uses `busy` until `pageLoaded` is true.
