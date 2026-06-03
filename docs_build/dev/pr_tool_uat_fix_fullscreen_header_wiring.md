# PR — Tool UAT Fix: Fullscreen Header Wiring

## Purpose

Fix the remaining Tools UAT blocker where Header and Intro changes had no visible effect in fullscreen mode.

This PR is scoped only to fullscreen header/intro wiring.

---

## Problem

The prior PR updated tool-shell header/intro text, but fullscreen mode did not reflect the change.

Observed issue:

- Header and Intro had no visible effect in fullscreen.
- Likely cause: fullscreen mode uses a separate DOM/render path, cached content, or different selector than the normal tool shell.

---

## Scope

Target only:

- Fullscreen header rendering
- Fullscreen intro rendering
- Shared platform shell fullscreen path
- Tool metadata binding used by fullscreen mode

Do not modify:
- King of the Iceberg files
- sample games
- runtime engine files
- `start_of_day` folders
- Asset Browser source-state logic unless required by shared shell wiring

---

## Required Behavior

In fullscreen mode, the visible fullscreen DOM must show:

Header:

```txt
<Tool Name> — <Short Description>
```

Intro:

```txt
<Tool Name>: <one-line usage/help text>
```

Both must include the active tool name.

---

## Fullscreen-Specific Requirements

- Identify the actual fullscreen DOM elements used when entering fullscreen.
- Bind those elements to the active tool metadata.
- Ensure updates occur:
  - on tool launch
  - when entering fullscreen
  - when switching tools
  - when metadata changes during shell initialization
- Ensure fullscreen does not reuse stale normal-mode text.
- Ensure the validation reads the same visible DOM path the user sees.

---

## Metadata Requirements

The fullscreen path must use:

- `tool.name`
- `tool.shortDescription`
- `tool.intro` or equivalent one-line usage/help text

If intro metadata does not exist, add explicit registry metadata for affected tools.

Do not silently fall back to generic intro text.

If required metadata is missing, show an actionable configuration error.

---

## Affected Tools to Validate

Validate fullscreen header and intro for:

- Vector Map Editor
- Vector Asset Studio
- Sprite Editor
- State Inspector
- Asset Browser, if it uses the shared fullscreen shell

---

## Acceptance Criteria

- Enter fullscreen for each affected tool.
- Visible fullscreen header includes the correct active tool name.
- Visible fullscreen intro includes the correct active tool name.
- Header format is `<Tool Name> — <Short Description>`.
- Intro format is `<Tool Name>: <one-line usage/help text>`.
- Header and intro are compact/single-line with ellipsis and tooltip/title.
- Missing metadata produces actionable configuration error.
- Browser validation captures visible fullscreen DOM text.
- No KOTI, sample game, runtime, or `start_of_day` files change.

---

## Targeted Validation

Do not run long sample suites.

Run only:

```powershell
node --check toolbox/shared/platformShell.js
node --check toolbox/toolRegistry.js
```

If other JS files are changed, run `node --check` on those files only.

Perform browser validation:

- Launch each affected tool.
- Enter fullscreen.
- Capture visible fullscreen header text.
- Capture visible fullscreen intro text.
- Save evidence JSON under:

```txt
tmp/pr_tool_uat_fix_fullscreen_header_wiring_validation.json
```

---

## Required Report

Create:

```txt
docs_build/dev/reports/PR_tool_uat_fix_fullscreen_header_wiring_report.md
```

Report must include:

- PASS/FAIL
- changed files
- root cause found
- fullscreen DOM path fixed
- visible fullscreen header text per tool
- visible fullscreen intro text per tool
- validation commands/results
- remaining issues
