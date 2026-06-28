# PR_26180_OWNER_011-move-tests-and-validation Requirement Checklist

Generated: 2026-06-28T22:57:50.322Z

| Requirement | Result | Notes |
| --- | --- | --- |
| Ensure tests live under dev/tests/ | PASS | No tracked root tests/ path remains; moved tests now resolve repo root from dev/tests. |
| Update validation scripts for www/api/dev/local-runtime | PASS | Canonical validation now rejects legacy root paths and old dev/local-runtime entrypoints. |
| Fix remaining path assumptions | PASS | Updated old root tmp/, toolbox/, assets/, games/, and two-level repoRoot assumptions in tests. |
| Do not move www or api files | PASS | No www/api file moves were made. |
| Do not change product behavior | PASS | Changes are limited to tests, validation guardrails, and governance/status docs. |
| Required reports | PASS | Reports generated under dev/reports/. |
| Required ZIP | PASS | Repo-structured ZIP generated under dev/workspace/zips/. |
