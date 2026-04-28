# PR — Remove Static Header and Intro Labels

## Purpose

Remove hardcoded `Header and Intro` labels from tool `index.html` files and make the shared platform shell the source of truth for tool header/intro text.

This PR fixes the remaining mismatch where fullscreen may appear correct through CSS/attributes while the underlying per-tool markup still contains generic static text.

---

## Problem

Many tool pages contain static markup like:

```html
<summary class="is-collapsible__summary">Header and Intro</summary>
```

This means the source markup still contains generic text even though the shared shell is expected to provide tool-specific header/intro.

The desired behavior is not to mask `Header and Intro`; it should not be the source label for tools.

---

## Required Behavior

For every tool using the shared platform shell:

- Do not hardcode `Header and Intro` as the visible summary label.
- Header/intro text must be generated from shared tool metadata.
- The visible summary/header must include the active tool name.
- The visible intro must include the active tool name.
- The shared shell should remain the single source of truth.

---

## Required Format

Header:

```txt
<Tool Name> — <Short Description>
```

Intro:

```txt
<Tool Name>: <one-line usage/help text>
```

---

## Implementation Direction

Inspect all tool `index.html` files for:

```html
<summary class="is-collapsible__summary">Header and Intro</summary>
```

Replace static generic labels with a shared-shell-controlled placeholder, data binding, or empty mount point that the platform shell owns.

Acceptable approaches:

1. Replace static text with a shell-owned element, for example:

```html
<summary class="is-collapsible__summary" data-tools-platform-summary></summary>
```

2. Or keep the summary element for behavior but make its visible text fully controlled by shared shell JS.

3. Or centralize summary creation in `platformShell.js` if compatible with existing tools.

Do not rely only on CSS pseudo-elements to hide the old text.

---

## Metadata Requirements

Each affected tool must have enough registry metadata to render:

- `tool.name`
- `tool.shortDescription`
- `tool.intro` or equivalent one-line usage text

If metadata is missing, show an actionable configuration error.

Do not silently fall back to generic text.

---

## Scope

Target shared tool pages only.

Likely files:

- `tools/*/index.html`
- `tools/shared/platformShell.js`
- `tools/shared/platformShell.css`
- `tools/toolRegistry.js`

Do not modify:

- King of the Iceberg files
- sample games
- runtime game engine files
- `start_of_day` folders

---

## Acceptance Criteria

- No shared-shell tool `index.html` contains visible static text `Header and Intro` as a summary label.
- Fullscreen summary/header visibly includes the active tool name.
- Normal tool header visibly includes the active tool name.
- Intro visibly includes the active tool name where intro is shown.
- The shared platform shell owns the rendered text.
- Legacy behavior for collapse/fullscreen toggles still works.
- Missing metadata produces actionable configuration error.
- No CSS-only masking of the old generic text.
- No KOTI/sample/runtime/start_of_day changes.

---

## Targeted Validation

Do not run long sample suites.

Run:

```powershell
node --check tools/shared/platformShell.js
node --check tools/toolRegistry.js
```

If any per-tool JS changes, run `node --check` on those files only.

Run targeted browser validation:

- Open each affected shared-shell tool.
- Confirm raw visible summary/header text is tool-specific.
- Enter fullscreen.
- Confirm fullscreen summary/header is tool-specific.
- Confirm no visible `Header and Intro` remains.
- Confirm collapse/fullscreen toggles still work.

---

## Required Evidence

Create:

```txt
tmp/pr_tool_remove_static_header_intro_validation.json
```

It should include:

- tools checked
- files checked
- whether `Header and Intro` remains in visible source/DOM
- visible normal header text
- visible fullscreen header text
- visible intro text
- PASS/FAIL

---

## Required Report

Create:

```txt
docs/dev/reports/PR_tool_remove_static_header_intro_report.md
```

Include:

- PASS/FAIL
- changed files
- root cause
- tools/index files updated
- validation commands/results
- remaining issues
