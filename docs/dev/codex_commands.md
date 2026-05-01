# Codex Commands — PR_11_193C

## Model
Use GPT-5.3-codex or available Codex implementation model.
Reasoning: high.

## Command
From repo root:

```powershell
cd C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming
```

Run Codex with this exact task:

```text
Implement PR_11_193C exactly as described in docs/pr/PR_11_193C_V2_HTML_FIRST_BATCH.md.

This is a V2 re-engineer batch, not legacy copy/paste.

You must write the implementation code. ChatGPT did not provide implementation files.

Scope only:
- Palette Manager V2
- SVG Asset Studio V2
- Vector Map Editor V2
- Tilemap Studio V2
- Asset Browser V2

Do not change schemas, samples, games, Workspace Manager v1, platformShell, assetUsageIntegration, tools/shared/*, or start_of_day folders.

Make each V2 tool HTML-first:
- tools/<tool>-v2/index.html owns CSS links, shared header mount, static layout, static state containers, menus, and module script tags.
- index.html must include <div id="shared-theme-header"></div>.
- index.js must be behavior-only: document title/dataset, session read, validation, event binding, dynamic render into existing DOM nodes.
- Remove JS-driven page construction such as document.body.innerHTML, document.head.insertAdjacentHTML style blocks, dynamic header script injection, and static layout template strings.
- Keep one class per tool file.
- No helper classes, no alias variables, no pass-through variables, no abstraction layers.
- No fallback/default data.
- Session-backed data only.
- Tool names must end with V2.

Validation required:
- Run syntax checks for each changed JS file.
- Run targeted tool launch/HTML validation available in the repo for these tools.
- Do not run full samples smoke unless you changed shared sample loader/framework code.
- Write validation evidence to docs/dev/reports/PR_11_193C_validation.md.

Before finishing:
- Review diff for unrelated changes and remove them.
- Confirm no implementation touched banned paths.
- Confirm no schema/sample/game changes.
- Create final Codex ZIP at tmp/PR_11_193C_20260501_Codex.zip preserving repo structure.
```

## Expected Evidence File
Codex must create:

```text
docs/dev/reports/PR_11_193C_validation.md
```

It must include:
- files changed
- tests run
- full smoke skipped/run decision and reason
- banned path check result
- V2 header compliance result
