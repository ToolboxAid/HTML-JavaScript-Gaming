# Codex Commands — PR_11_196

Model: GPT-5.4-codex
Reasoning: high

## Command

```text
You are implementing PR_11_196 — V2 Runtime Validation + Cleanup Pass.

Follow docs/pr/PR_11_196_V2_RUNTIME_VALIDATION_CLEANUP.md exactly.

Important:
- ChatGPT did not write implementation code in this bundle.
- You write the implementation fixes.
- Keep the PR testable.
- Do not modify schemas, samples, games, Workspace Manager v1, platformShell, or tools/shared/*.
- Do not copy/paste legacy tool code.
- Re-engineer only the V2 runtime structure.

Target tools:
- Palette Manager V2
- SVG Asset Studio V2
- Vector Map Editor V2
- Tilemap Studio V2
- Asset Browser V2

Required implementation behavior:
- HTML owns static layout, CSS links, shared header mount, and module script tags.
- JS owns session read, validation, DOM population, rendering, and empty/error states only.
- No fallback data.
- No default sample data.
- No v1 coupling.

After implementation:
1. Run targeted syntax checks for changed JS files.
2. Run text checks that verify target HTML and JS compliance.
3. Write report to docs/dev/reports/pr_11_196_v2_runtime_validation_cleanup_report.md.
4. Create final ZIP at tmp/PR_11_196.zip with repo-relative structure.
```
