# PR_26180_OWNER_017 Requirement Checklist

| Requirement | Result | Notes |
|---|---:|---|
| Base on `PR_26180_OWNER_016-remove-empty-root-shells` | PASS | Branch created from PR016. |
| Delete `assets/DemoGame-26168-001.gfsp` | PASS | Local ignored file deleted. |
| Remove `assets/` if empty after deletion | PASS | `assets/` removed after the demo file deletion. |
| Audit every tracked file under `src/` | PASS | 596 tracked `src/` files audited in the detailed audit report. |
| Decide destination for each `src/` file | PASS | Each audited file has proposed destination: `www/`, `api/`, `dev/`, or `archive/delete`. |
| Do not bulk-move `src/` blindly | PASS | No `src/` files moved. |
| Move only files with clear ownership | PASS | No source movement attempted because scoped reference updates are required. |
| If uncertain, document and hard stop before moving | PASS | Uncertain/mixed ownership documented; movement deferred. |
| Preserve runtime behavior | PASS | No runtime/product code moved or changed. |
| `git diff --check` | PASS | Whitespace validation passed. |
| `npm run validate:canonical-structure` | PASS | Canonical guardrail passed. |
| Targeted path/reference scan | PASS | No active `assets/DemoGame...` path references remain. |
| Targeted bootstrap check if paths move | PASS | Bootstrap check passed; no tracked startup paths moved. |
