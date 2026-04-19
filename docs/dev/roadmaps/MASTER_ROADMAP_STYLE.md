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
[ ] Create `src/engine/theme/main.css` as the shared base theme.
[ ] Base tokens:
- colors
- spacing
- typography
- border radius
- shadows
- transition timings
[ ] Base layout primitives:
- page shell
- content container
- full-width section
- intro/title block
- nav row
[ ] Document which live Toolbox Aid behaviors are intentionally carried forward.
[ ] Do not pull from existing project styling.

### A2. Establish shared file layout
[ ] Create/confirm:
- `src/engine/theme/main.css`
- `src/engine/theme/header.css` or fold into main if still clean
- `src/engine/theme/accordion.css`
- `src/engine/theme/tools.css`
- `src/engine/theme/games.css`
- `src/engine/theme/samples.css`
[ ] Keep `main.css` foundational, not a dumping ground.

### A3. Shared selector hygiene
[ ] Do not preserve existing project classes/ids unless intentionally adopted.
[ ] Introduce new consistent naming where needed.
[ ] Remove embedded styling from migrated pages only.
[ ] Ban new embedded styling in HTML and JS.

---

## Track B — Shared Header System

### B1. Shared header source
[ ] Pull the `<header>` from Toolbox Aid and store it in:
- `src/engine/theme/toolboxaid-header.html`
[ ] Keep structure unchanged except:
- tagline becomes `HTML-JavaScript Gaming`
- menu becomes:
  - Home
  - Games
  - Samples
  - Tools

### B2. Shared header assets and styling
[ ] Pull the required Toolbox Aid CSS needed to reproduce the header look.
[ ] Keep the header image behavior:
- full-width feel
- maintain aspect ratio
- no distortion
[ ] Preserve the visual structure:
- site title
- tagline
- nav row
- social area if retained
[ ] Preserve the menu hover line effect from Toolbox Aid baseline.

### B3. Header loading
[ ] Provide one shared import path.
[ ] Avoid duplicating header markup across pages.
[ ] Minimize JS required to place the shared header into HTML pages.
[ ] Keep HTML-page JS minimal and boring.

---

## Track C — Main Entry Pages

### C1. Reset `/index.html`
[ ] Remove dependencies on existing project page-local styling for `/index.html`.
[ ] Move `/index.html` to Toolbox Aid-derived shared theme only.
[ ] Add shared header.
[ ] Add shared page intro/title area.
[ ] Keep page structure simple and inspectable.
[ ] Validate spacing consistency.
[ ] Validate nav behavior.
[ ] Validate responsive behavior.

### C2. Reset `/samples/index.html`
[ ] Apply same shell and shared header.
[ ] Keep page visually very close to `/index.html`.
[ ] Use `samples.css` only for content-specific differences.

### C3. Reset `/games/index.html`
[ ] Apply same shell and shared header.
[ ] Keep page visually very close to `/index.html`.
[ ] Use `games.css` only for content-specific differences.

### C4. Reset `/tools/index.html`
[ ] Apply same shell and shared header.
[ ] Keep page visually very close to `/index.html`.
[ ] Use `tools.css` only for content-specific differences.

---

## Track D — Collapsible Pattern

### D1. Replace `hideme`
[ ] Replace `hideme` usage on the four main index pages.
[ ] Rename to `.is-collapsible`.

### D2. Shared accordion pattern
[ ] Make `.is-collapsible` use the same accordion feel as `.tools-platform-frame__accordion-summary`.
[ ] Prefer CSS-first.
[ ] Add minimal JS only if needed for accessibility or state persistence.
[ ] Use for shared header/page intro compaction where appropriate.

---

## Track E — Tool Shell UX

### E1. Shared tool layout
[ ] Create full-width tool shell.
[ ] Fixed left column.
[ ] Flexible center column.
[ ] Fixed right column.
[ ] Center alone resizes with viewport.
[ ] Validate at common desktop widths.

### E2. Tool shell migration
[ ] Apply tool shell to one tool first as proof.
[ ] Then roll out tool-by-tool.
[ ] Keep header behavior compact enough not to crowd tool workspaces.

### E3. Launch clarity
[ ] Add visible explanation near launch controls:
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
[ ] STYLE_01 — Reset `/index.html` using Toolbox Aid-derived base.
[ ] STYLE_02 — Reset `/samples/index.html`.
[ ] STYLE_03 — Reset `/games/index.html`.
[ ] STYLE_04 — Reset `/tools/index.html`.
[ ] STYLE_05 — Add `.is-collapsible` shared accordion behavior.
[ ] STYLE_06 — Establish shared tool shell and migrate one tool.
[ ] STYLE_07 — Clarify tool launch labels/help text.
[ ] STYLE_08+ — Continue tool UX migration tool-by-tool.
