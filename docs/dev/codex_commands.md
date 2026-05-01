# Codex Commands — PR_11_190

## Model

Use GPT-5.4 or GPT-5.3-codex.

Reasoning: high.

## Execute

```powershell
cd C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming
```

```powershell
codex --model gpt-5.4 --reasoning high "Apply docs/pr/PR_11_190_V2_REENGINEER_NAMING_HEADER_GUARD.md exactly. This is a re-engineer guard, not copy/paste. Update only the V2 tool lane needed for Palette Manager V2 and SVG Asset Studio V2 naming/header compliance. Do not change schemas, samples, games, Workspace Manager v1, platformShell, tools/shared, or legacy tools. Ensure every visible V2 tool name ends with V2. Ensure the V2 tools use the /index.html shared theme header mount <div id='shared-theme-header'></div>. Do not add fallback/default data. Do not introduce helper classes, abstraction layers, alias variables, or pass-through variables. Run targeted syntax checks only. Write validation notes to docs/dev/reports/PR_11_190_validation.md. Place the finished repo-structured ZIP at tmp/PR_11_190_20260501_01.zip."
```

## Required Output From Codex

Codex must create:

```text
tmp/PR_11_190_20260501_01.zip
docs/dev/reports/PR_11_190_validation.md
```

## Expected Evidence

The validation report must include:

```text
[REENGINEER_NOT_COPY_PASTE]
[V2_NAME_SUFFIX_ENFORCED]
[SHARED_THEME_HEADER_MOUNT]
[NO_PLATFORM_SHELL]
[NO_TOOLS_SHARED]
[NO_FALLBACK_DATA]
[TARGETED_VALIDATION_ONLY]
```
