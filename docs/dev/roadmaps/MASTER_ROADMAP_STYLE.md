
### STYLE_06 — Tool Shell Foundation + First Tool Migration

[ ] Shared tool shell exists in theme CSS
[ ] Tool shell uses full available page width
[ ] Left rail width is fixed
[ ] Right rail width is fixed
[ ] Center workspace is flexible
[ ] As viewport changes, only center grows/shrinks
[ ] One tool page migrated as proof slice
[ ] Migrated tool remains functional
[ ] No embedded `<style>` blocks on migrated tool page
[ ] No inline `style=""` on migrated tool page
[ ] No JS-driven styling used for layout
[ ] Header remains visually consistent with shared theme
[ ] Tool page is visually testable

#### STYLE_06 Test Section

[x] `tools/State Inspector/index.html` loads with shared theme CSS from `src/engine/theme/main.css`
[x] `src/engine/theme/tool-shell.css` provides fixed left/right + flexible center shell
[x] Migrated tool page keeps script wiring unchanged (`platformShell.js`, `main.js`)
[x] No embedded `<style>` or inline `style=""` added in migrated tool page

### STYLE_08 — Adaptive Tool Density

[x] Shared tool-shell CSS refined for denser layout
[x] Left/right rails use responsive `clamp()` sizing where appropriate
[x] Shell-level spacing reduced where safe
[x] Panel-level spacing reduced where safe
[x] Horizontal scrolling avoided at normal desktop widths for migrated shell tools
[x] Vertical scrolling reduced where practical in migrated shell tools
[x] Refined shell validated against migrated shell tools:
- `tools/State Inspector/index.html`
- `tools/Performance Profiler/index.html`
- `tools/Replay Visualizer/index.html`
- `tools/Physics Sandbox/index.html`
