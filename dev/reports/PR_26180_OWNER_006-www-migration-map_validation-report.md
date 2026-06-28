# PR_26180_OWNER_006-www-migration-map Validation Report

| Validation | Result | Notes |
| --- | --- | --- |
| git diff --check | PASS | No whitespace errors. |
| npm run validate:canonical-structure | PASS | Blocking violations: 0; approved legacy exceptions: 501. |
| Runtime/API/UI/database implementation change check | PASS | Only Project Instructions/backlog/reports changed. |
| Playwright | PASS | Not required; no browser files moved and no UI routes changed. |

## Commands Run

```text
git diff --check
npm run validate:canonical-structure
```
