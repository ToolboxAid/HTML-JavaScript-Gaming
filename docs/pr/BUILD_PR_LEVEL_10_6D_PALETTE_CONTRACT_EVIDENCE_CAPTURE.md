# BUILD_PR_LEVEL_10_6D_PALETTE_CONTRACT_EVIDENCE_CAPTURE

## Purpose
Capture exact palette-contract drift evidence before normalization.

This PR does not normalize code. Codex must provide the exact files and comparison report so ChatGPT can write explicit file-by-file normalization steps next.

## Scope
- identify palette JSON consumed by standalone tool samples
- identify tool-side palette contract/schema/adapter files
- compare sample manifest palette shape to tool input shape
- produce evidence report with exact paths and mismatches

## Do Not
- Do not change runtime behavior.
- Do not normalize palette files in this PR.
- Do not add fallback palette data.
- Do not introduce hardcoded asset paths.
- Do not edit start_of_day folders.
- Do not rewrite roadmap text.
- Do not perform repo-wide refactors.

## Required Codex Output
Create:

```text
tmp/BUILD_PR_LEVEL_10_6D_PALETTE_CONTRACT_EVIDENCE_CAPTURE.zip
```

The ZIP must include repo-relative copies under:

```text
docs/dev/reports/level_10_6d_palette_contract_evidence/
```

## Evidence To Capture
1. Sample-side palette JSON files used by failing or previously failing standalone samples.
2. Tool-side palette JSON files used by those same samples.
3. Manifest files that bind palette input into a tool.
4. Schema files that define palette input shape.
5. Tool files that read, validate, normalize, or reshape palette input.
6. Fresh output from:

```powershell
npm run test:sample-standalone:data-flow
```

## Required Report
Create:

```text
docs/dev/reports/level_10_6d_palette_contract_evidence/palette_contract_evidence_report.md
```

Include:
- command run
- timestamp
- test result summary
- palette-related samples checked
- sample manifest palette shape vs tool expected palette shape
- exact copied file paths
- exact mismatches found
- whether $schema, engine, paletteList, wrapper, alias, reshaping, fallback data, or hardcoded paths remain
- next-step recommendation limited to normalization only

## Acceptance
- Evidence ZIP exists at tmp/BUILD_PR_LEVEL_10_6D_PALETTE_CONTRACT_EVIDENCE_CAPTURE.zip
- No implementation/runtime files are modified
- Report identifies exact palette mismatch paths and shapes
- Roadmap is touched only for execution-backed status-only marker transitions
- Current data-flow test is run fresh
