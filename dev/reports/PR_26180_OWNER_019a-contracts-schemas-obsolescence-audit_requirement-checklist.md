# PR_26180_OWNER_019a-contracts-schemas-obsolescence-audit Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Base is PR018 | PASS | Branch created from `PR_26180_OWNER_018-move-src-browser-to-www`. |
| List every file under src/shared/contracts and src/shared/schemas | PASS | Detailed report and CSV list 89 tracked files. |
| Identify references from www | PASS | Exact and dynamic browser schema references captured. |
| Identify references from api | PASS | No direct active `api/` references found from requested surfaces. |
| Identify references from dev/tests | PASS | Test references captured per file. |
| Identify references from dev/scripts | PASS | Script references captured per file, including dynamic schema validation path. |
| Identify package script references | PASS | `package.json` scanned; no package refs found. |
| Classify every file | PASS | Classification totals: Active test/validation dependency: 64; Active browser/runtime dependency: 23; Unknown / needs Owner decision: 2. |
| Determine DB/API supersession | PASS | Per-file supersession recommendation documented. |
| Recommend exact action per file | PASS | Per-file action documented as move to www, move to dev, or keep temporarily. |
| Do not delete active runtime/test references | PASS | No files deleted. |
| Do not move browser-consumed files into api | PASS | No files moved; report recommends browser-consumed files move to `www/`. |
| Do not leave authoritative product data in browser-owned files | PASS | Audit recommends preserving boundary and does not add product data. |
| Preserve protected dev workspace | PASS | No protected workspace files moved. |
| git diff --check | PASS | Passed. |
| npm run validate:canonical-structure | PASS | Passed with 0 blocking violations. |
| Required reports and ZIP | PASS | Reports generated under `dev/reports/`; ZIP generated under `dev/workspace/zips/`. |
