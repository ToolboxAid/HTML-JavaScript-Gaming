# MASTER_ROADMAP_STYLE.md

## Purpose
Track the style-system migration for HTML-JavaScript-Gaming using Toolbox Aid as the visual baseline for shared page structure and styling direction.

## Source-of-Truth Rules
- Base visual direction comes from Toolbox Aid live site assets and CSS behavior, not from existing HTML-JavaScript-Gaming styling.
- Do not inspect old project CSS/HTML/embedded styles to preserve or translate them forward.
- Migration is additive and page-by-page.
- No big-bang rewrite.
- Each PR must be testable.
- No commit-only PRs.
- No embedded `<style>` in HTML.
- No inline `style=""` in HTML.
- No style strings injected from JS.
- Shared theme CSS lives under `src/engine/theme/`.
- Theme does not move into `src/engine/ui/`.

## Folder Responsibilities
### src/engine/theme/
Visual system only:
- reset/base
- tokens
- typography
- spacing
- layout primitives
- header/nav styling
- page shells
- accordion styling
- tool shell styling
- games/samples/tools section styling
- special-case CSS only when validated and needed

### src/engine/ui/
Behavior only:
- mount shared header if needed
- accordion interaction if CSS-only is insufficient
- host-shell launch behavior
- tool shell interaction
- minimal HTML-page JS only

## Platform Decisions
- Four main entry pages stay visually very close:
  - `/index.html`
  - `/samples/index.html`
  - `/games/index.html`
  - `/tools/index.html`
- Shared header + shared page intro/title area.
- Header image stretches side-to-side while preserving aspect ratio.
- Menu buttons use the existing Toolbox Aid overline/underline hover treatment where available in the Toolbox Aid CSS baseline.
- Existing vague selectors are not preserved by default.
- Do not depend on old classes or old ids.
- Add only the selectors needed by the new system.
- `hideme` is retired and replaced by `.is-collapsible`.
- Consistent spacing and margin rules are mandatory.
- Tools should use full available page width with:
  - fixed left column
  - flexible center column
  - fixed right column
  - only center grows/shrinks
- Minimal JS for HTML pages.

## UX Clarification
### Tool launch labels
- Open Tool = launch the tool directly/standalone
- Open In Host = launch the same tool inside a shared host shell/container

This explanation should be kept visible in related UI/help text so launch choices are understandable.

## Status Legend
- [ ] not started
- [.] in progress
- [x] complete

---

## Track A — Style System Foundation

### A1. Establish Toolbox Aid-derived base theme
[x] Create `src/engine/theme/main.css` as the shared base theme.
[.] Base tokens:
- colors
- spacing
- typography
- border radius
- shadows
- transition timings
[.] Base layout primitives:
- page shell
- content container
- full-width section
- intro/title block
- nav row
[.] Document which live Toolbox Aid behaviors are intentionally carried forward.
[ ] Do not pull from existing project styling.

### A2. Establish shared file layout
[.] Create/confirm:
- `src/engine/theme/main.css`
- `src/engine/theme/header.css` or fold into main if still clean
- `src/engine/theme/accordion.css`
- `src/engine/theme/tools.css`
- `src/engine/theme/games.css`
- `src/engine/theme/samples.css`
[x] Keep `main.css` foundational, not a dumping ground.

### A3. Shared selector hygiene
[.] Do not preserve existing project classes/ids unless intentionally adopted.
[.] Introduce new consistent naming where needed.
[.] Remove embedded styling from migrated pages only.
[x] Ban new embedded styling in HTML and JS.

---

## Track B — Shared Header System

### B1. Shared header source
[x] Pull the `<header>` from Toolbox Aid and store it in:
- `src/engine/theme/toolboxaid-header.html`
[.] Keep structure unchanged except:
- tagline becomes `HTML-JavaScript Gaming`
- menu becomes:
  - Home
  - Games
  - Samples
  - Tools

### B2. Shared header assets and styling
[x] Pull the required Toolbox Aid CSS needed to reproduce the header look.
[x] Keep the header image behavior:
- full-width feel
- maintain aspect ratio
- no distortion
[x] Preserve the visual structure:
- site title
- tagline
- nav row
- social area if retained
[.] Preserve the menu hover line effect from Toolbox Aid baseline.

### B3. Header loading
[x] Provide one shared import path.
[x] Avoid duplicating header markup across pages.
[x] Minimize JS required to place the shared header into HTML pages.
[x] Keep HTML-page JS minimal and boring.

---

## Track C — Main Entry Pages

### C1. Reset `/index.html`
[x] Remove dependencies on existing project page-local styling for `/index.html`.
[x] Move `/index.html` to Toolbox Aid-derived shared theme only.
[x] Add shared header.
[x] Add shared page intro/title area.
[x] Keep page structure simple and inspectable.
[x] Validate spacing consistency.
[x] Validate nav behavior.
[x] Validate responsive behavior.

### C2. Reset `/samples/index.html`
[x] Apply same shell and shared header.
[x] Keep page visually very close to `/index.html`.
[x] Use `samples.css` only for content-specific differences.

### C3. Reset `/games/index.html`
[x] Apply same shell and shared header.
[x] Keep page visually very close to `/index.html`.
[x] Use `games.css` only for content-specific differences.

### C4. Reset `/tools/index.html`
[x] Apply same shell and shared header.
[x] Keep page visually very close to `/index.html`.
[.] Use `tools.css` only for content-specific differences.

---

## Track D — Collapsible Pattern

### D1. Replace `hideme`
[x] Replace `hideme` usage on the four main index pages.
[x] Rename to `.is-collapsible`.

### D2. Shared accordion pattern
[x] Make `.is-collapsible` use the same accordion feel as `.tools-platform-frame__accordion-summary`.
[x] Prefer CSS-first.
[x] Add minimal JS only if needed for accessibility or state persistence.
[x] Use for shared header/page intro compaction where appropriate.

---

## Track E — Tool Shell UX

### E1. Shared tool layout
[x] Create full-width tool shell.
[x] Fixed left column.
[x] Flexible center column.
[x] Fixed right column.
[x] Center alone resizes with viewport.
[x] Validate at common desktop widths.

### E2. Tool shell migration
[x] Apply tool shell to one tool first as proof.
[.] Then roll out tool-by-tool.
[.] Keep header behavior compact enough not to crowd tool workspaces.

### E3. Launch clarity
[x] Add visible explanation near launch controls:
- Open Tool = launch the tool directly/standalone
- Open In Host = launch the same tool inside a shared host shell/container

---

## Track F — Spacing, Typography, and Consistency

### F1. Spacing scale
[ ] Define one spacing scale.
[ ] Apply consistently to:
- page shells
- section spacing
- cards/panels
- forms/buttons
- tool side rails
- intro/title blocks

### F2. Margin and padding audit
[ ] Standardize margin and padding rules on migrated pages.
[ ] Remove ad hoc spacing in migrated pages.

### F3. Typography
[ ] Standardize:
- page titles
- section titles
- body text
- nav text
- helper text
- tool labels

---

## Track G — Migration Rules

### G1. Per-PR migration rule
[ ] Each PR migrates one narrow slice.
[ ] Remove old CSS only where the new theme fully covers that slice.
[ ] Never orphan a page between systems.

### G2. Validation rule
[ ] Every style PR must be visually testable.
[ ] Every style PR must have rollback clarity.
[ ] Every style PR must avoid repo-wide churn.

### G3. Old-style retirement
[ ] Delete old page-local CSS only after migrated coverage is validated.
[ ] Delete embedded `<style>` only after migrated coverage is validated.
[ ] Delete JS styling only after migrated coverage is validated.

---

## Suggested Execution Order
[x] STYLE_01 — Reset `/index.html` using Toolbox Aid-derived base.
[x] STYLE_02 — Reset `/samples/index.html`.
[x] STYLE_03 — Reset `/games/index.html`.
[x] STYLE_04 — Reset `/tools/index.html`.
[x] STYLE_05 — Add `.is-collapsible` shared accordion behavior.
[x] STYLE_06 — Establish shared tool shell and migrate one tool.
[x] STYLE_07 — Clarify tool launch labels/help text.
[.] STYLE_08+ — Continue tool UX migration tool-by-tool.


---


### STYLE_06 â€” Tool Shell Foundation + First Tool Migration

[x] Shared tool shell exists in theme CSS
[x] Tool shell uses full available page width
[x] Left rail width is fixed
[x] Right rail width is fixed
[x] Center workspace is flexible
[x] As viewport changes, only center grows/shrinks
[x] One tool page migrated as proof slice
[x] Migrated tool remains functional
[x] No embedded `<style>` blocks on migrated tool page
[x] No inline `style=""` on migrated tool page
[x] No JS-driven styling used for layout
[x] Header remains visually consistent with shared theme
[x] Tool page is visually testable

#### STYLE_06 Test Section

[x] `tools/State Inspector/index.html` loads with shared theme CSS from `src/engine/theme/main.css`
[x] `src/engine/theme/tool-shell.css` provides fixed left/right + flexible center shell
[x] Migrated tool page keeps script wiring unchanged (`platformShell.js`, `main.js`)
[x] No embedded `<style>` or inline `style=""` added in migrated tool page

### STYLE_08 â€” Adaptive Tool Density

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

### STYLE_09 â€” Tool Height and Viewport Fit

[x] Shared tool-shell CSS refined for viewport-height fit
[x] Page-level vertical scrolling reduced where practical
[x] Scrolling localized to panel/readout regions where needed
[x] Shared CSS Grid shell structure preserved
[x] STYLE_08 adaptive density improvements preserved
[x] Refined shell validated against migrated shell tools:
- `tools/State Inspector/index.html`
- `tools/Performance Profiler/index.html`
- `tools/Replay Visualizer/index.html`
- `tools/Physics Sandbox/index.html`




### STYLE_07 â€” Clarify Tool Launch Labels / Help Text

[x] Visible explanation added near launch controls
[x] `Open Tool` explained as: launch the tool directly/standalone
[x] `Open In Host` explained as: launch the same tool inside a shared host shell/container
[x] Explanation is clear without requiring external docs
[x] No inline `style=""`
[x] No JS-driven layout changes
[x] Pages are visually testable

### STYLE_10 â€” Interaction & Flow

[ ] Primary actions accessible via keyboard (Enter)
[ ] Escape cancels or resets where applicable
[ ] Logical tab flow across panels (left â†’ center â†’ right)
[ ] Initial focus set correctly on load
[ ] Focus preserved after actions
[ ] Buttons reflect active/disabled state
[ ] No layout shift during interaction
[ ] Interaction patterns consistent across migrated tools
[ ] No inline `style=""`
[ ] No JS-driven layout changes
[ ] Pages are visually stable and usable

### STYLE_11 â€” Visual Hierarchy & Readability

[ ] Clear heading hierarchy across tools
[ ] Panel titles consistent in size and spacing
[ ] Section grouping visually obvious
[ ] Spacing rhythm consistent across panels
[ ] Labels and helper text clearly distinguishable
[ ] No visual clutter in dense layouts
[ ] No layout breakage
[ ] Pages remain easy to scan quickly

### STYLE_12 â€” Component Standardization

[ ] Buttons visually consistent across all tools
[ ] Inputs and textareas standardized
[ ] Labels aligned and consistently styled
[ ] Panels share common structure and spacing
[ ] Debug/readout areas visually consistent
[ ] No one-off component styling remains
[ ] No inline `style=""`
[ ] No layout regressions

### STYLE_13 â€” Color System & Theming

[ ] Semantic color tokens defined (primary, success, warning, danger)
[ ] Panel background layers consistent
[ ] Text contrast validated for readability
[ ] Accent usage consistent across tools
[ ] No arbitrary color usage in tool pages
[ ] Theme remains cohesive across all entry points

### STYLE_14 â€” Micro Polish & Feedback

[ ] Buttons have consistent hover states
[ ] Disabled states clearly visible
[ ] Subtle transitions applied (fast, non-distracting)
[ ] No visual jitter during updates
[ ] Feedback (status/messages) does not shift layout
[ ] Interaction feels responsive and immediate

### STYLE_15 â€” Tool UX Consistency Pass

[ ] All tools follow same layout pattern
[ ] Primary actions consistently placed
[ ] Secondary actions consistently placed
[ ] Panel ordering consistent across tools
[ ] No tool-specific UX deviations without justification
[ ] Navigation and interaction patterns unified

### STYLE_16 â€” Performance & Render Cleanliness

[ ] No unnecessary layout reflows detected
[ ] No layout thrashing during interaction
[ ] DOM updates efficient and minimal
[ ] No visual lag in tool interaction
[ ] No unnecessary repaint-heavy effects

### STYLE_17 â€” Final QA & Visual Audit

[ ] No horizontal overflow issues
[ ] No unexpected vertical scroll traps
[ ] Spacing consistent across all pages
[ ] Typography consistent across all pages
[ ] All tools visually aligned with system
[ ] No regressions from earlier STYLE phases
[ ] Pages production-ready

