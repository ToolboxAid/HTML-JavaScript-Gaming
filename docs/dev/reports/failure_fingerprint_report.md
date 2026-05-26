# Failure Fingerprint Report

Generated: 2026-05-26T21:52:45.136Z
Status: WARN

## Summary

Deterministic setup failures: 4
Runtime failures: 0
Flaky/transient failures: 0
Infrastructure failures: 0

## Observed Failure Fingerprints

| Fingerprint | Category | Rule | Lane | Source | Retry Allowed | Diagnostic |
| --- | --- | --- | --- | --- | --- | --- |
| 8a34b1f6897ef32e | deterministic setup failure | lane-compilation-failures | invalid-targeted-closeout-lane | lane compilation | No | Unknown lane requested: invalid-targeted-closeout-lane |
| bfa111cdb8feb351 | deterministic setup failure | lane-compilation-failures | setup | lane compilation | No | Unknown lane requested: invalid-targeted-closeout-lane |
| e9a7db048b3390cb | deterministic setup failure | lane-compilation-failures | setup | dependency validation | No | Unknown lane requested before dependency gating: invalid-targeted-closeout-lane |
| d77953343f5cb155 | deterministic setup failure | lane-compilation-failures | setup | dependency validation | No | Lane compilation failed; dependency-gated runtime scheduling is blocked. |

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
