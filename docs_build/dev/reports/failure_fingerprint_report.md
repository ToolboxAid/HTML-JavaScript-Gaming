# Failure Fingerprint Report

Generated: 2026-06-23T16:38:57.091Z
Status: WARN

## Summary

Deterministic setup failures: 0
Runtime failures: 1
Flaky/transient failures: 0
Infrastructure failures: 0

## Observed Failure Fingerprints

| Fingerprint | Category | Rule | Lane | Source | Retry Allowed | Diagnostic |
| --- | --- | --- | --- | --- | --- | --- |
| fc8ad6ba552baa70 | runtime failure | runtime-failure | workspace-contract | runtime command | Yes | workspace-contract command failed: "C:\\Program Files\\nodejs\\node.exe" C:\Users\davidq\Documents\github\GameFoundryStudio\node_modules\@playwright\test\cli.js test tests/playwright/tools/RootToolsFutureState.spec.mjs --project=playwright --workers=1 --reporter=list |

## Known Deterministic Fingerprint Rules

| Rule | Fingerprint | Source | Classification | Matches |
| --- | --- | --- | --- | --- |
| windows-quoting-issues | 723dd9796680da60 | runner preflight | deterministic setup failure | Windows quoting issues |
| invalid-grep-patterns | b797167c43bfbb0a | runner preflight | deterministic setup failure | Invalid grep patterns |
| ownership-violations | 056e19c830d32f2b | ownership validation | deterministic setup failure | Ownership violations |
| lane-compilation-failures | 2c78d5924d8213d9 | lane compilation | deterministic setup failure | Lane compilation failures |
| unresolved-fixtures-imports | 9694ec5c7f0974ed | fixture/import validation | deterministic setup failure | Unresolved fixtures/imports |
| invalid-manifest-lane-metadata | 2170af541ee92d01 | manifest validation | deterministic setup failure | Invalid manifest/lane metadata |
| invalid-dependency-graph | 5b2d112898b630c4 | dependency validation | deterministic setup failure | Invalid dependency graph |
| misplaced-test-helper-ownership | 48903803d56149b3 | structure audit | deterministic setup failure | Misplaced test/helper ownership |

## Classification Contract

- Deterministic setup failures block runtime before Playwright/browser startup.
- Runtime failures belong to the targeted lane that executed the failing command.
- Flaky/transient failures require explicit classification before any targeted retry is allowed.
- Infrastructure failures are not retried automatically until the infrastructure issue is corrected.
- Failure fingerprints are based on lane, source, rule, category, command, and diagnostic text.
