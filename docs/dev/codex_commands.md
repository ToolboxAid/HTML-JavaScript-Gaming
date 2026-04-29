# Codex Command — PR 11.71

Model: GPT-5.4
Reasoning: high

```text
Implement PR 11.71 exactly as documented.

Add scripts/PS/audit-sample-json-lockdown.ps1.

Requirements:
- Executable PowerShell only; no markdown/prose in the .ps1 file.
- Must run from repo root.
- Recursively scan samples/** sample leaf folders.
- Count all JSON files under samples/**.
- Determine referenced JSON files by scanning sample JS files for JSON filenames.
- Report:
  - JSON files scanned
  - Referenced
  - Missing reference
  - Palette-only sample folders
- Default mode: summary counts only.
- -Details mode: dump missing reference paths and palette-only paths.
- -Ci mode: exit 1 when Missing reference > 0, otherwise exit 0.
- Keep generated CSV at docs/dev/reports/sample_json_lockdown_audit.csv.
- Do not modify sample runtime code.
- Do not modify roadmap text except status marker only if execution-backed.
- Use targeted validation only; do not run full sample suite.

After implementation, run:
./scripts/PS/audit-sample-json-lockdown.ps1
./scripts/PS/audit-sample-json-lockdown.ps1 -Details
./scripts/PS/audit-sample-json-lockdown.ps1 -Ci

If -Ci fails because current repo still has missing references, document that expected blocker in docs/dev/reports/PR_11_71_validation.md and do not hide it.

Return repo-structured ZIP at tmp/PR_11_71_SAMPLE_JSON_LOCKDOWN.zip.
```
