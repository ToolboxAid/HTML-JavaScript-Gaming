# PR_10_26_REPO_DUPLICATE_FILE_CONTENT_AUDIT Report

## Result
PASS

## Scope
- Repo-wide duplicate content audit by exact SHA-256 hash.
- No duplicate files were deleted, moved, or rewritten in this PR.

## Scan Configuration
- Excluded directories: .git, node_modules, tmp, dist, build, coverage, .cache, .next
- Scanned files: 5038

## Summary
- Duplicate groups: 41
- Duplicate files (in groups): 138
- Duplicate content bytes: 390107 (380.96 KB)
- Potential cleanup savings (extra copies only): 199957 (195.27 KB)

## Classification And Cleanup Risk
| Classification | Cleanup Risk | Groups | Files | Potential Savings |
|---|---|---:|---:|---:|
| runtime-or-source-duplicate | high | 27 | 109 | 125830 (122.88 KB) |
| report-evidence-snapshot-duplicate | low | 2 | 4 | 38864 (37.95 KB) |
| runtime-json-duplicate | high | 8 | 17 | 26807 (26.18 KB) |
| general-content-duplicate | medium | 1 | 2 | 7574 (7.40 KB) |
| report-artifact-duplicate | low | 2 | 4 | 681 (681 B) |
| documentation-duplicate | medium | 1 | 2 | 201 (201 B) |

## Top Duplicate Groups By Potential Savings
| Hash (short) | Count | File Size | Potential Savings | Classification | Risk | Representative File |
|---|---:|---:|---:|---|---|---|
| 6a0693de2150 | 2 | 97287 | 97287 | runtime-or-source-duplicate | high | docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/src/engine/paletteList.js |
| ef64cc68f2b5 | 2 | 36486 | 36486 | report-evidence-snapshot-duplicate | low | docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/docs/dev/reports/level_10_6d_palette_contract_evidence/test_sample_standalone_data_flow_output.txt |
| 4aec342e6ea9 | 2 | 21840 | 21840 | runtime-json-duplicate | high | samples/phase-02/0207/sample.0207.sprite-editor.json |
| 971437553d34 | 2 | 7574 | 7574 | general-content-duplicate | medium | docs/design/gdd/Capcom/Final Fight/gdd.txt |
| 84e9d7f94ad1 | 2 | 4456 | 4456 | runtime-or-source-duplicate | high | docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/shared/paletteDocumentContract.js |
| 162cc270514e | 7 | 658 | 3948 | runtime-or-source-duplicate | high | samples/phase-01/0101/index.js |
| e3faab082770 | 2 | 2378 | 2378 | report-evidence-snapshot-duplicate | low | docs/dev/reports/level_10_6d_palette_contract_evidence/palette_shape_diff.json |
| 937cb7d3e5c7 | 5 | 549 | 2196 | runtime-or-source-duplicate | high | samples/phase-04/0408/index.js |
| e473e39904ce | 5 | 450 | 1800 | runtime-or-source-duplicate | high | samples/phase-09/0902/index.js |
| 982e2b63afb7 | 2 | 1430 | 1430 | runtime-or-source-duplicate | high | samples/phase-12/1217/assets/data/vector/mario_style_learning_backdrop.svg |
| 167733ac880e | 2 | 1341 | 1341 | runtime-json-duplicate | high | docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-02/0213/sample.0213.palette.json |
| 7c3809e1621e | 2 | 1279 | 1279 | runtime-or-source-duplicate | high | samples/phase-12/1220/assets/data/parallax/mario_style_bushes_foreground.svg |
| 90b443049931 | 2 | 1225 | 1225 | runtime-json-duplicate | high | docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/schemas/palette.schema.json |
| 257ace0d8424 | 2 | 1208 | 1208 | runtime-or-source-duplicate | high | samples/phase-12/1220/assets/data/parallax/mario_style_clouds.svg |
| e76f7162ba07 | 3 | 585 | 1170 | runtime-or-source-duplicate | high | samples/phase-12/1218/assets/data/parallax/hero-proxy.svg |
| 2df11510e899 | 2 | 1081 | 1081 | runtime-or-source-duplicate | high | samples/phase-12/1218/assets/data/parallax/foreground-occluder.svg |
| ceb6a130e4bc | 2 | 1053 | 1053 | runtime-or-source-duplicate | high | samples/phase-12/1218/assets/data/parallax/cloud-bands.svg |
| d8022975b2f9 | 2 | 1012 | 1012 | runtime-or-source-duplicate | high | samples/phase-12/1215/assets/data/vector/sky_gradient_scene.svg |
| 83e6f07dfc44 | 3 | 412 | 824 | runtime-or-source-duplicate | high | samples/phase-12/1218/assets/data/parallax/sky-gradient.svg |
| 8bdc50fa968a | 2 | 812 | 812 | runtime-or-source-duplicate | high | samples/phase-12/1216/assets/data/vector/mountain_range_scene.svg |
| 2adef45cfa82 | 4 | 264 | 792 | runtime-or-source-duplicate | high | games/_template/assets/parallax/data/README.md |
| eaebc2a6b996 | 2 | 659 | 659 | report-artifact-duplicate | low | docs/dev/reports/asset_ownership_strategy_validation.txt |
| ff7a6cd3249e | 2 | 633 | 633 | runtime-json-duplicate | high | docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-03/0308/sample.0308.palette.json |
| 62df597da971 | 2 | 633 | 633 | runtime-json-duplicate | high | docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-03/0313/sample.0313.palette.json |
| 3a3c84dde6f2 | 2 | 624 | 624 | runtime-or-source-duplicate | high | samples/phase-12/1220/assets/data/parallax/mario_style_hills.svg |

## Notes
- Full duplicate group details are in `repo_duplicate_file_content_audit.json`.
- High-risk groups should be reviewed by code/data owners before any consolidation.
