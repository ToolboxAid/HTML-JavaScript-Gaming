# Codex Commands — PR_11_191 Vector Map Editor V2

## Model
GPT-5.4-codex

## Reasoning
High

## Command
```powershell
codex --model gpt-5.4-codex --reasoning high "Apply PR_11_191 exactly as documented in docs/pr/PR_11_191_VECTOR_MAP_EDITOR_V2_REENGINEER_PLAN.md. Re-engineer Vector Map Editor V2 only. Do not copy/paste legacy tool code. Do not modify schemas, samples, games, Workspace Manager v1, platformShell, assetUsageIntegration, or tools/shared. Use session-backed data only. Visible tool name must end with V2. Header must use the /index.html shared theme header mount: <div id="shared-theme-header"></div>. Keep implementation to a single tool file and single class unless the existing repo entry file requires only wiring to that one class. No helper classes, no alias variables, no abstraction layers, no fallback/default data. Add targeted validation and write findings to docs/dev/reports/PR_11_191_VECTOR_MAP_EDITOR_V2_VALIDATION.md. Do not run full samples smoke test."
```

## Targeted Validation
```powershell
node --check tools/vector-map-editor-v2/index.js
```

If the exact file name differs after Codex creates the V2 lane structure, run `node --check` on the created Vector Map Editor V2 entry file only.

## Full Samples Smoke Test
Skipped by default. Reason: this PR is limited to one V2 tool and does not modify shared sample loader/framework.
