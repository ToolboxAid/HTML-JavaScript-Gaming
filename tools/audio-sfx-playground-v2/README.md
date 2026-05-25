# Audio / SFX Playground V2

First-Class Tool V2 surface for browser-generated game sound effects.

## Scope

- Tune oscillator waveform, frequency, pitch sweep, duration, envelope, volume, and optional noise transient.
- Audition the current SFX with the Web Audio API from an explicit user action.
- Inspect and copy/export a toolState-shaped JSON payload.
- Launch directly from `tools/audio-sfx-playground-v2/index.html` or through Workspace Manager V2.

## Contracts

- HTML uses external JavaScript and CSS only.
- No inline event handlers.
- No `tools/shared` runtime dependency.
- Persisted JSON uses structured fields only; no `imageDataUrl`.
- Browser audio starts only after the user presses Play.

## Validation

- Run targeted syntax/static checks for this tool's HTML, CSS, and JavaScript.
- Run `npm run test:workspace-v2`.
- Playwright should verify the Workspace V2 tile appears, launches this tool, and produces no console errors on launch.
