# Failure Fingerprint Report

Generated: 2026-06-11T16:59:02.802Z
Status: PASS

## Summary

Deterministic setup failures: 0
Runtime failures: 0
Flaky/transient failures: 0
Infrastructure failures: 0

## Observed Failure Fingerprints

| Fingerprint | Category | Rule | Lane | Source | Retry Allowed | Diagnostic |
| --- | --- | --- | --- | --- | --- | --- |
| none | none | none | none | none | No | No failures observed during deterministic classification. |

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
