# PR 11.66 Expected Validation

Codex must report:

- Baseline audit counts:
  - JSON files scanned
  - Referenced
  - Missing reference
- Final audit counts:
  - JSON files scanned
  - Referenced
  - Missing reference
- Whether the missing reference count decreased.
- Exact remaining blockers, if any.

Validation command:

```powershell
.\scripts\PS\audit-sample-json-js-references.ps1
```

Full sample suite must remain skipped because this PR is asset/reference stabilization only.
