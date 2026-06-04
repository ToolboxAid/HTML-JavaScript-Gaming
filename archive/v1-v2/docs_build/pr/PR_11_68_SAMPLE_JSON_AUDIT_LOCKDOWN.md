# PR 11.68 — Sample JSON Audit Lockdown

## Purpose
Lock the sample JSON reference audit after cleanup convergence so future work prevents regressions instead of continuing broad cleanup.

## Scope
- Update the audit script to be counts-only by default.
- Add an explicit details switch for diagnostic listing.
- Add a CI-safe failure mode that exits non-zero when missing references are present.
- Preserve CSV report generation at `docs_build/dev/reports/sample_json_js_reference_audit.csv`.
- Do not delete JSON files in this PR.
- Do not reconstruct palettes in this PR.
- Do not modify roadmap text except status marker transition if execution-backed.

## Codex Tasks
1. Open `scripts/PS/audit-sample-json-js-references.ps1`.
2. Add parameters if missing:
   - `[switch]$Details`
   - `[switch]$Ci`
3. Ensure default console output is only:
   - `Sample JSON reference audit complete.`
   - `JSON files scanned: <count>`
   - `Referenced: <count>`
   - `Missing reference: <count>`
   - `Report: docs_build/dev/reports/sample_json_js_reference_audit.csv`
4. Suppress detailed YES/NO listing unless `-Details` is supplied.
5. Keep CSV output complete regardless of console mode.
6. In `-Ci` mode, exit with code `1` if missing references are greater than zero; otherwise exit `0`.
7. Add a short report at `docs_build/dev/reports/PR_11_68_sample_json_audit_lockdown_report.md` with:
   - before counts
   - after counts
   - whether CI mode passed
   - whether full samples test was skipped and why

## Validation
Run:

```powershell
.\scripts\PS\audit-sample-json-js-references.ps1
.\scripts\PS\audit-sample-json-js-references.ps1 -Details
.\scripts\PS\audit-sample-json-js-references.ps1 -Ci
```

Expected:
- Default mode prints counts only.
- Details mode prints detailed listing plus counts/report.
- CI mode exits non-zero only when missing references remain.
- Full sample suite is skipped because this only changes the audit script/report behavior.

## Acceptance
- Counts-only default output works.
- Diagnostic details remain available.
- CSV remains generated.
- CI mode can guard future regressions.
- No unrelated files changed.
