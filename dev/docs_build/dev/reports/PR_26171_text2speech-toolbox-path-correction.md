# PR_26171 Text To Speech Toolbox Path Correction

## Summary
- Moved the rebuilt Text To Speech shell into the active toolbox path: `toolbox/text-to-speech/`.
- Replaced the placeholder `toolbox/text-to-speech/index.html` with the Theme V2 / Tool Template V2 shell.
- Added `toolbox/text-to-speech/text2speech.js` for provider-free message model, workflow, and adapter planning behavior.
- Removed the incorrect root `tools/text2speech/` path.
- Preserved the existing toolbox registration path `text-to-speech/index.html`.

## Scope
- Text To Speech page/module wiring only.
- Required reports and validation evidence only.
- No archived implementation was copied.
- No provider integration, fake generation, silent fallback, browser-owned product data, page-local CSS, or tool-local CSS was added.

## Corrected Paths
- Active page: `toolbox/text-to-speech/index.html`
- Active module: `toolbox/text-to-speech/text2speech.js`
- Removed path: `tools/text2speech/`

## Project Workspace Note
The validation command `npm run test:workspace-v2` retains a legacy command name. User-facing copy and reports refer to Project Workspace.
