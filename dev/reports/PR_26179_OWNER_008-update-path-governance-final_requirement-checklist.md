# PR_26179_OWNER_008-update-path-governance-final Requirement Checklist

| Status | Item | Notes |
| --- | --- | --- |
| PASS | Find workflow references to node ./scripts/run-platform-validation-suite.mjs | Located one reference in .github/workflows/platform-validation.yml. |
| PASS | Update to node ./dev/scripts/run-platform-validation-suite.mjs | Updated only the moved CI script path. |
| PASS | Check for other GitHub Actions moved root scripts/ references | Targeted grep found no remaining old root ./scripts/ workflow calls. |
| PASS | Do not move files | No files moved. |
| PASS | Do not change runtime behavior | Only GitHub Actions workflow path and reports changed. |
| PASS | Do not change production pages | No production page files changed. |

Result: PASS
