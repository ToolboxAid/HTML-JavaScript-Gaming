# PR — Tool UAT Fix: Fullscreen Header/Intro + Asset Browser 0204

## Purpose

Fix two Tools UAT blockers before declaring tools closed:

1. Fullscreen Header and Intro must include the active tool name.
2. Asset Browser sample `0204` must show a clear, actionable state when no approved assets are loaded.

This PR is tools-only. Do not advance King of the Iceberg work.

---

## Scope

Target only shared tools/workspace UI and Asset Browser behavior.

Likely areas:
- Shared tool shell/header rendering
- Fullscreen mode header/intro rendering
- Asset Browser launch/empty-state handling
- Tool registry metadata if needed

Do not modify sample games, runtime game engine files, or `start_of_day` folders.

---

## 1. Fullscreen Header and Intro Tool Name

### Problem

The prior header rule focused on compact single-line text, but fullscreen mode still needs the tool name included in both:

- Header
- Intro

### Required Behavior

When a tool is in fullscreen mode:

- Header must include the active tool name.
- Intro must include the active tool name.
- Keep the information compact and single-line where possible.
- Do not use vague generic text like `Header and Intro` without tool context.
- Do not hide missing config behind fallback text.

### Required Format

Header:

```txt
<Tool Name> — <Short Description>
```

Intro:

```txt
<Tool Name>: <one-line usage/help text>
```

Example:

```txt
Vector Map Editor — Platform Layout & Tile Composition
Vector Map Editor: Create, select, inspect, and export map/platform layouts.
```

### Compactness Rule

- Header remains one line.
- Intro remains one line.
- Both may truncate with ellipsis if needed.
- Tooltip/title should show full text.

### Missing Config Rule

If required metadata is missing:

- Show actionable configuration error.
- Do not silently fall back to generic text.

---

## 2. Asset Browser Sample 0204

### Observed State

Sample `0204` displays:

```txt
Browse Approved Assets
Browse Assets launched from Shared Tools Surface. Choose a shared asset reference and publish it back to the active tool.

Category: All
Search: vector

0 approved assets | source checked and empty. Source: active-project-manifest.tools.asset-browser.assets. Checked: active-project-manifest.tools.asset-browser.assets.
No assets loaded
Import or create asset
```

### Problem

This may be technically accurate, but UAT needs to know whether this is:

- expected empty state, or
- missing manifest/config, or
- a workflow blocker.

### Required Behavior

For sample `0204`, Asset Browser must clearly state one of these:

1. Expected empty source:
   - The checked asset source exists and is empty.
   - Tell the user what to do next.

2. Missing source/config:
   - The asset source path is missing or invalid.
   - Tell the user what manifest/config field is required.

3. Load failure:
   - The source could not be read.
   - Show actionable error details.

### Required Empty-State Message

If the checked source exists but contains zero approved assets, show an actionable message like:

```txt
Asset Browser found zero approved assets in active-project-manifest.tools.asset-browser.assets. Import an asset or create an approved asset entry to make it available here.
```

### Required Validation Detail

The UI should expose:

- source path checked
- result count
- whether the source was present
- whether it was empty vs missing vs invalid
- next action

### No Silent Fallback

Do not auto-load sample/default assets when the source is empty.

---

## Acceptance Criteria

- Fullscreen header includes active tool name.
- Fullscreen intro includes active tool name.
- Header and intro remain compact/single-line with ellipsis and tooltip.
- Missing header/intro metadata produces actionable configuration error.
- Asset Browser sample `0204` clearly identifies whether the source is empty, missing, invalid, or failed.
- Asset Browser empty state tells the user what to do next.
- No silent fallback assets are loaded.
- No KOTI work is advanced.
- No sample games/runtime/start_of_day files are changed.

---

## Validation

Use targeted validation only.

Recommended checks:

```powershell
node --check tools/shared/platformShell.js
node --check tools/toolRegistry.js
```

Also run targeted browser/tool validation for:

- Fullscreen mode on the four target tools
- Asset Browser sample `0204`

Do not run long samples suite unless a changed file requires it.

---

## Report

Create:

```txt
docs/dev/reports/PR_tool_uat_fix_header_asset_browser_report.md
```

Include:

- PASS/FAIL
- Changed files
- Header/intro fullscreen validation notes
- Asset Browser 0204 validation notes
- Remaining issues
