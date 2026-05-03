MODEL: gpt-5.3-codex
REASONING: medium

# PR_11_198 — Tilemap Studio V2 Completion + Validation

## Execute
Implement the smallest valid testable change for Tilemap Studio V2.

## Hard Boundaries
- Codex writes implementation code.
- Do not change schemas.
- Do not change samples.
- Do not change games.
- Do not touch Workspace Manager v1.
- Do not patch legacy tools.
- Do not use platformShell.
- Do not use tools/shared except the explicitly required theme/header mount path already used by the repo theme system.
- Do not copy old tool code. Re-engineer the V2 tool.

## Required Files To Inspect/Edit
- tools/tilemap-studio-v2/index.html
- tools/tilemap-studio-v2/index.js

If either file does not exist, create only the missing file required for this tool.

## Implementation Rules
1. `tools/tilemap-studio-v2/index.html` must own the static shell:
   - include theme CSS
   - include `<div id="shared-theme-header"></div>`
   - include static page shell/root container
   - include static menuTool section
   - include static menuWorkspace section
   - include `../../src/engine/theme/mount-shared-header.js`
   - include `./index.js`

2. `tools/tilemap-studio-v2/index.js` must be behavior-only:
   - single class
   - no helper classes
   - no alias/pass-through variables
   - no full-page `innerHTML` construction
   - no CSS injection
   - no dynamic header injection
   - read session only
   - update existing DOM nodes only
   - handle missing, invalid, and valid session states

3. Enforce naming:
   - visible name: `Tilemap Studio V2`
   - `document.title`: `Tilemap Studio V2`
   - `data-tool-id`: `tilemap-studio-v2`

4. Session rules:
   - no fallback data
   - no defaults
   - no fetch
   - no guessed payloads
   - no hidden samples

## Validation Commands
Run targeted validation only:

```powershell
node --check tools/tilemap-studio-v2/index.js
```

Manual validation:
- Open `tools/tilemap-studio-v2/index.html`.
- Confirm shared header renders in `#shared-theme-header`.
- Confirm missing session shows clear actionable state.
- Confirm valid session renders tilemap content.
- Confirm browser console has no errors.

## Evidence Report
Create or update:

```text
docs/dev/reports/PR_11_198_report.md
```

Report must include:
- files changed
- validation commands run
- pass/fail results
- manual test notes
- statement that full samples smoke was skipped and why

## Local ZIP Output
After validation, Codex must create:

```text
<project folder>/tmp/PR_11_198.zip
```

The ZIP must preserve repo-relative structure and include the final changed files plus docs/dev evidence.


---
PR_11_310

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_310 ..."
```


---
PR_11_311

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_311 ..."
```


---
PR_11_312

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_312 ..."
```


---
PR_11_313

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_313 ..."
```

---
PR_11_313 (Workspace V2 launcher + Asset Manager V2 UI labels)

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_313: Workspace V2 tool launcher UI + Asset Manager V2 user-facing rename."
```

---
PR_11_313 (single contract rename: asset-manager-v2)

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_313: rename legacy asset browser v2 id to asset-manager-v2 across tool ID, paths, payloads, registry links, tests, and docs with zero old references."
```

---
PR_11_314

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_314: persist valid Asset Manager V2 payloadJson.assetCatalog into Workspace V2 active session/export path and block invalid writes."
```

---
PR_11_315

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_315: Enable core asset management actions in Asset Manager V2 (add/remove entries) with strict required-field validation and workspace persistence."
```

---
PR_11_316

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_316: Harden Asset Manager V2 add/remove actions by rejecting duplicate ids, blank/whitespace fields, and missing remove ids with actionable status messages while preserving valid persistence behavior."
```

---
PR_11_317

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_317: Clarify Workspace V2 Asset Manager launcher with explicit no-session vs active-session state while preserving session-routed launch behavior."
```

---
PR_11_318

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_318: Add Asset Manager V2 row selection + details panel with UI-only selection state and no payload mutation."
```

---
PR_11_318A

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_318A: Remove test-to-test imports by extracting RuntimeSceneLoaderHotReload shared logic into tests/helpers and updating final/tool tests to consume helper."
```

---
PR_11_318B

```bash
npx @openai/codex run --model gpt-5.3-codex --reasoning medium "Implement PR_11_318B: Add first Playwright UI test for Workspace V2 launching Asset Manager V2, add/remove asset flow, and export verification."
```
