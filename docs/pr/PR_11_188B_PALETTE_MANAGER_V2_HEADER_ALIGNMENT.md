# PR_11_188B — Palette Manager v2 Header Alignment

## Purpose
Correct Palette Manager v2 so it uses the same shared theme header mount as `/index.html`.

## Scope
- Palette Manager v2 only.
- Header alignment only.
- Require `<div id="shared-theme-header"></div>` in the Palette Manager v2 page.
- Reuse the existing `src/engine/theme` header behavior used by `/index.html`.
- Keep the existing accordion system.
- Keep `menuTool` and `menuWorkspace` responsibilities separate.

## Out of Scope
- No schema changes.
- No sample changes.
- No game changes.
- No Workspace Manager v1 work.
- No platformShell.
- No tools/shared/*.
- No assetUsageIntegration.
- No fallback/default data.
- No helper classes.
- No abstraction layers.
- No alias/pass-through variables.

## Implementation Constraints for Codex
- One tool only: Palette Manager v2.
- Single file / single class wherever the current v2 implementation allows it.
- Session-backed data only.
- The tool must not fetch, guess, or fallback.
- Do not copy old v1 code.
- Do not change SVG Asset Studio v2 in this PR.

## Expected Verification
- Palette Manager v2 page contains `id="shared-theme-header"`.
- Header image/title presentation matches `/index.html`.
- Palette Manager still reads session-backed data.
- Empty/error states still render explicitly.
- No legacy coupling is introduced.

## Expected Logs
- `[PALETTE_V2_ENTRY]`
- `[SESSION_CONTEXT_READ]`
- `[PALETTE_V2_CONTRACT_LOADED]`
