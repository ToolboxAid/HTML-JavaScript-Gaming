# PR 11.50 — Controlled JSON Cleanup

## Purpose
Continue CONTROLLED CLEANUP MODE by removing exactly two verified tool-specific JSON files reported as NO by the audit script.

## Scope
- Run `scripts/PS/audit-sample-json-js-references.ps1`.
- Select exactly two safe NO JSON items from tool-specific sample/tool payloads.
- Do not touch `palette.json`.
- Do not touch `tile-map-editor-document.json`.
- Do not touch sample 1902.
- Do not modify roadmap text except status-only if execution-backed.
- Do not refactor loader/framework/shared code.

## Codex Execution Requirements
1. Run the audit script.
2. Capture audit output in `docs_build/dev/reports/PR_11_50_audit_before.txt`.
3. Pick exactly two clean NO items that are tool-specific and not shared.
4. Manually verify there are no JS references and no indirect references.
5. Remove only those two confirmed dead JSON files.
6. Run the audit script again.
7. Capture output in `docs_build/dev/reports/PR_11_50_audit_after.txt`.
8. Run targeted validation only.
9. Document full-suite skip reason.

## Acceptance
- Exactly two verified dead JSON files removed.
- Audit after output shows total count reduced by two.
- No shared payload files touched.
- No roadmap rewrite/deletion.
- Targeted tests documented.
