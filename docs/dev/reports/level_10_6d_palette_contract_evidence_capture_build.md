# BUILD_PR_LEVEL_10_6D_PALETTE_CONTRACT_EVIDENCE_CAPTURE

## BUILD Instructions for Codex

Run diagnostics only.

## Commands
```powershell
cd C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming
git status
npm run test:sample-standalone:data-flow
```

## Required Work
1. Create:
```text
docs/dev/reports/level_10_6d_palette_contract_evidence/
```

2. Use targeted search only in:
```text
samples/
tools/
docs/dev/reports/
```

Search for:
```text
palette
paletteList
manifest.palette
$schema
engine
```

3. Copy relevant files into evidence subfolders:
```text
sample_manifests/
sample_palette_json/
tool_palette_contracts/
test_outputs/
```

4. Create:
```text
docs/dev/reports/level_10_6d_palette_contract_evidence/palette_contract_evidence_report.md
```

5. Package only repo-relative evidence/report files into:
```text
tmp/BUILD_PR_LEVEL_10_6D_PALETTE_CONTRACT_EVIDENCE_CAPTURE.zip
```

## Strict Rules
- Do not fix palette normalization.
- Do not edit runtime code.
- Do not invent or reshape palette data.
- Do not create fallback palette data.
- Do not use hardcoded asset paths.
- Do not rewrite roadmap text.

## Report Template
```markdown
# Level 10.6D Palette Contract Evidence Report

## Command Run
- npm run test:sample-standalone:data-flow

## Result Summary
- Pass/fail:
- Generic failure count:
- Palette-related failure count:

## Palette Samples Checked
| Sample | Manifest Path | Palette Path | Tool Input Binding |
|---|---|---|---|

## Contract Comparison
| Area | Workspace/Sample Shape | Tool Expected Shape | Match? | Notes |
|---|---|---|---|---|

## Wrapper/Alias Scan
| Signal | Present? | Path | Notes |
|---|---:|---|---|
| $schema | | | |
| engine | | | |
| paletteList | | | |
| manifest.palette reshape | | | |
| fallback palette data | | | |
| hardcoded palette path | | | |

## Copied Evidence Files
| Source Path | Evidence Copy Path | Reason |
|---|---|---|

## Exact Mismatches
-

## Next Normalization Recommendation
Only list the smallest normalization target. Do not implement it in this PR.
```
