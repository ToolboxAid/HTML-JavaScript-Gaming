# PR_26180_OWNER_008 Manual Validation Notes

## Manual Notes

`npm run dev:bootstrap -- --team owner` is a long-running local startup command that launches the Owner web/API runtime and may open a browser. It was documented as manual validation rather than left running during this Codex execution.

Expected manual verification:

1. Run `npm run dev:bootstrap -- --team owner`.
2. Confirm diagnostics show Owner/default ports:
   - Web URL: `http://127.0.0.1:5500`
   - API URL: `http://127.0.0.1:5501/api`
   - Browser launch: `http://127.0.0.1:5500/index.html`
3. Open:
   - `http://127.0.0.1:5500/index.html`
   - `http://127.0.0.1:5500/toolbox/index.html`
   - `http://127.0.0.1:5500/account/sign-in.html`
   - `http://127.0.0.1:5500/admin/system-health.html`
   - `http://127.0.0.1:5500/games/index.html`
4. Confirm public URLs remain unchanged while files are served from `www/`.

## Local Artifact Note

An ignored local file, `assets/DemoGame-26168-001.gfsp`, keeps a physical `assets/` folder visible in this checkout. It is not tracked and was not moved or committed.
