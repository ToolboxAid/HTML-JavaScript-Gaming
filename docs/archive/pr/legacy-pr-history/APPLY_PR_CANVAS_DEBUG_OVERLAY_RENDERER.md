Toolbox Aid
David Quesenberry
04/05/2026
APPLY_PR_CANVAS_DEBUG_OVERLAY_RENDERER.md

# APPLY PR
Canvas Debug Overlay Renderer

## Objective
Apply the canvas HUD implementation produced from the build PR and lock the runtime behavior into one sample with minimal, isolated changes.

## Apply Scope
- Add `tools/dev/canvasDebugHudRenderer.js`
- Update `tools/dev/devConsoleIntegration.js`
- Update one sample entry file only
- Keep draw order world-first, HUD-last
- Preserve current combo keys:
  - Shift + ` => toggle console
  - Ctrl + Shift + ` => toggle overlay
  - Ctrl + Shift + R => reload
  - Ctrl + Shift + ] => next panel
  - Ctrl + Shift + [ => previous panel

## Apply Requirements
- No engine core file changes
- No F-key bindings
- No duplicate listeners or duplicate runtime instances
- Canvas state must use save()/restore()
- HUD must tolerate missing diagnostics
- Commit comment file must have no header

## Runtime Expectations
- HUD appears on-canvas when overlay is enabled
- HUD updates every frame
- HUD renders after gameplay content
- Panel switching is visible
- Reload combo does not trigger browser refresh

## Validation
- node --check tools/dev/canvasDebugHudRenderer.js
- node --check tools/dev/devConsoleIntegration.js
- node --check <selected sample file>
- Manual browser run
- Verify overlay visibility toggle
- Verify panel navigation
- Verify no console/runtime duplication after repeated toggles

## Deliverable
Codex applies the implementation and packages:
<project folder>/tmp/APPLY_PR_CANVAS_DEBUG_OVERLAY_RENDERER_delta.zip
