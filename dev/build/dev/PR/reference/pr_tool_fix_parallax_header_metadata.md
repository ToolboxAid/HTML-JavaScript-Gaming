# PR — Fix Parallax Header Metadata and Toggle Label

## Purpose

Fix the remaining shared-shell header issues found after removing static `Header and Intro` labels.

This PR is tools-only.

---

## Observed Issues

### 1. Parallax Scene Studio configuration error

On page load:

```txt
Parallax Scene Studio — Configuration error (open title for details)
```

In fullscreen:

```txt
Parallax Scene Studio — Configuration error (open title for details)
```

This means the new no-fallback metadata rule is working, but Parallax Scene Studio is missing required metadata.

### 2. Exit fullscreen generic toggle text

After exiting fullscreen, the visible control text says:

```txt
Hide Header and Details
```

This is still generic and does not include the tool name.

---

## Scope

Target only:

- Parallax Scene Studio tool registry metadata
- Shared platform shell header/intro/toggle rendering
- Shared platform shell CSS if needed

Do not modify:

- King of the Iceberg files
- sample games
- runtime engine files
- `start_of_day` folders

---

## Required Behavior

### Parallax Scene Studio

On normal page load, visible header must show:

```txt
Parallax Scene Studio — <Short Description>
```

Visible intro must show:

```txt
Parallax Scene Studio: <one-line usage/help text>
```

In fullscreen, the same tool-specific header/intro must be visible.

No configuration error should appear when metadata is complete.

---

## Required Metadata

Add or verify registry fields for `parallax-scene-studio` or its actual tool id:

- `name`
- `shortDescription`
- `intro` or equivalent one-line usage/help text

Suggested values:

```js
name: "Parallax Scene Studio",
shortDescription: "Layered Scene & Depth Composition",
intro: "Parallax Scene Studio: compose layered backgrounds, midgrounds, and foreground scene depth."
```

Use existing naming conventions in `toolRegistry.js`.

---

## Toggle Label Requirement

Generic toggle text must not say:

```txt
Hide Header and Details
```

Instead, it must include the active tool name.

Preferred:

```txt
Hide <Tool Name> Details
Show <Tool Name> Details
```

The toggle label must update when:

- page loads
- tool metadata binds
- entering fullscreen
- exiting fullscreen
- collapse/expand changes

---

## Missing Metadata Rule

If any tool still lacks required metadata:

- show actionable configuration error
- identify the missing field
- include the tool id
- do not silently fall back to generic text

Example:

```txt
Parallax Scene Studio configuration error: missing shortDescription for tool id parallax-scene-studio.
```

---

## Acceptance Criteria

- Parallax Scene Studio no longer shows configuration error on page load.
- Parallax Scene Studio no longer shows configuration error in fullscreen.
- Parallax Scene Studio normal header includes tool name.
- Parallax Scene Studio fullscreen header includes tool name.
- Parallax Scene Studio intro includes tool name.
- Exiting fullscreen does not show generic `Hide Header and Details`.
- Toggle text includes active tool name.
- Missing metadata still produces actionable errors for genuinely incomplete tools.
- No CSS-only masking of stale generic labels.
- No KOTI/sample/runtime/start_of_day files change.

---

## Targeted Validation

Do not run long sample suites.

Run only relevant checks:

```powershell
node --check src/shared/toolbox/platformShell.js
node --check toolbox/toolRegistry.js
```

If another JS file changes, run `node --check` on that file only.

Browser validation:

- Open Parallax Scene Studio.
- Confirm normal header/intro text.
- Enter fullscreen.
- Confirm fullscreen header/intro text.
- Exit fullscreen.
- Confirm toggle label includes tool name.
- Search DOM/text for visible generic labels:
  - `Header and Intro`
  - `Hide Header and Details`
  - `Show Header and Details`

---

## Required Evidence

Create:

```txt
dev/workspace/artifacts/tmp/pr_tool_fix_parallax_header_metadata_validation.json
```

Include:

- tool id
- normal header text
- normal intro text
- fullscreen header text
- fullscreen intro text
- post-exit toggle text
- generic labels found/not found
- PASS/FAIL

---

## Required Report

Create:

```txt
dev/reports/PR_tool_fix_parallax_header_metadata_report.md
```

Include:

- PASS/FAIL
- changed files
- metadata fields added/fixed
- toggle label behavior
- validation commands/results
- remaining issues
