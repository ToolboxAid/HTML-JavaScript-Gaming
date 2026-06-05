# Targeted File Manifest Report

Generated: 2026-06-05T23:21:30.829Z
Status: PASS

## Manifest-Generated Lane Inputs

| Lane | Ownership | Status | Source | Tests | Helpers | Fixtures | Imports / Dependencies | Dependency Graph Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none | none | SKIP | none | none | none | none | none | none | none | No selected lanes produced manifests. |

## Discovery Expansion Control

Prevented discovery expansion: Yes
Prevented redundant scans: 0
Targeted file/helper reads: 0

## Runtime Savings Observations

- Each selected lane receives one deterministic manifest before runtime scheduling.
- Manifest inputs replace repeated recursive test, helper, and fixture discovery during targeted execution.
- Runtime command targets must be declared by the lane manifest before browser launch.
- Manifest hashes lock lane inputs so runtime lane mutation is detected before execution.
