# PR_10_27_DUPLICATE_CLASSIFICATION_AND_SAFE_CLEANUP Report

## Result
PASS

## Input
- Source audit: `docs/dev/reports/repo_duplicate_file_content_audit.json`
- Duplicate groups reviewed: `41`

## Classification Counts
| Classification | Groups |
|---|---:|
| duplicate-ssot | 0 |
| accidental-copy | 0 |
| report-evidence | 9 |
| generated-validation | 2 |
| template-intentional | 3 |
| sample-variant-intentional | 23 |
| ambiguous-no-action | 4 |

## Safe Cleanup Actions Applied
- Action performed: demoted runtime-looking report-evidence snapshot files (moved, not deleted).
- Files moved: `7`
  - `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-02/0213/sample.0213.palette.json` -> `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative_demoted_runtime_lookalikes/samples/phase-02/0213/sample.0213.palette.json`
  - `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-03/0308/sample.0308.palette.json` -> `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative_demoted_runtime_lookalikes/samples/phase-03/0308/sample.0308.palette.json`
  - `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-03/0313/sample.0313.palette.json` -> `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative_demoted_runtime_lookalikes/samples/phase-03/0313/sample.0313.palette.json`
  - `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/src/engine/paletteList.js` -> `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative_demoted_runtime_lookalikes/src/engine/paletteList.js`
  - `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/schemas/palette.schema.json` -> `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative_demoted_runtime_lookalikes/tools/schemas/palette.schema.json`
  - `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/schemas/tools/palette-browser.schema.json` -> `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative_demoted_runtime_lookalikes/tools/schemas/tools/palette-browser.schema.json`
  - `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/shared/paletteDocumentContract.js` -> `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative_demoted_runtime_lookalikes/tools/shared/paletteDocumentContract.js`

## Files Intentionally Kept
- All template duplicates (`template-intentional`) were kept unchanged.
- All sample-variant duplicates (`sample-variant-intentional`) were kept unchanged.
- All generated report/validation duplicates (`generated-validation`) were kept unchanged.
- Any unresolved groups were marked `ambiguous-no-action` and left untouched.

## Ambiguous Groups Left Untouched
| Hash (short) | Representative File | Reason |
|---|---|---|
| 971437553d34 | `docs/design/gdd/Capcom/Final Fight/gdd.txt` | Potential intentional/doc-specific duplication or unclear ownership |
| df859606f030 | `tools/palette-browser/tool.schema.json` | Potential intentional/doc-specific duplication or unclear ownership |
| f01a374e9c81 | `games/Pacman/assets/.gitkeep` | Potential intentional/doc-specific duplication or unclear ownership |
| e3b0c44298fc | `docs/design/gdd/Nameco/Galaga/gdd.txt` | Potential intentional/doc-specific duplication or unclear ownership |

## Group-by-Group Classification
| Hash (short) | Count | Classification | Action | Cleanup Risk | Representative File |
|---|---:|---|---|---|---|
| 6a0693de2150 | 2 | report-evidence | demoted-moved | high | `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/src/engine/paletteList.js` |
| ef64cc68f2b5 | 2 | report-evidence | kept-no-action | low | `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/docs/dev/reports/level_10_6d_palette_contract_evidence/test_sample_standalone_data_flow_output.txt` |
| 4aec342e6ea9 | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-02/0207/sample.0207.sprite-editor.json` |
| 971437553d34 | 2 | ambiguous-no-action | kept-no-action | medium | `docs/design/gdd/Capcom/Final Fight/gdd.txt` |
| 84e9d7f94ad1 | 2 | report-evidence | demoted-moved | high | `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/shared/paletteDocumentContract.js` |
| 162cc270514e | 7 | sample-variant-intentional | kept-no-action | high | `samples/phase-01/0101/index.js` |
| e3faab082770 | 2 | report-evidence | kept-no-action | low | `docs/dev/reports/level_10_6d_palette_contract_evidence/palette_shape_diff.json` |
| 937cb7d3e5c7 | 5 | sample-variant-intentional | kept-no-action | high | `samples/phase-04/0408/index.js` |
| e473e39904ce | 5 | sample-variant-intentional | kept-no-action | high | `samples/phase-09/0902/index.js` |
| 982e2b63afb7 | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1217/assets/data/vector/mario_style_learning_backdrop.svg` |
| 167733ac880e | 2 | report-evidence | demoted-moved | high | `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-02/0213/sample.0213.palette.json` |
| 7c3809e1621e | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1220/assets/data/parallax/mario_style_bushes_foreground.svg` |
| 90b443049931 | 2 | report-evidence | demoted-moved | high | `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/schemas/palette.schema.json` |
| 257ace0d8424 | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1220/assets/data/parallax/mario_style_clouds.svg` |
| e76f7162ba07 | 3 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1218/assets/data/parallax/hero-proxy.svg` |
| 2df11510e899 | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1218/assets/data/parallax/foreground-occluder.svg` |
| ceb6a130e4bc | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1218/assets/data/parallax/cloud-bands.svg` |
| d8022975b2f9 | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1215/assets/data/vector/sky_gradient_scene.svg` |
| 83e6f07dfc44 | 3 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1218/assets/data/parallax/sky-gradient.svg` |
| 8bdc50fa968a | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1216/assets/data/vector/mountain_range_scene.svg` |
| 2adef45cfa82 | 4 | template-intentional | kept-no-action | high | `games/_template/assets/parallax/data/README.md` |
| eaebc2a6b996 | 2 | generated-validation | kept-no-action | low | `docs/dev/reports/asset_ownership_strategy_validation.txt` |
| ff7a6cd3249e | 2 | report-evidence | demoted-moved | high | `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-03/0308/sample.0308.palette.json` |
| 62df597da971 | 2 | report-evidence | demoted-moved | high | `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-03/0313/sample.0313.palette.json` |
| 3a3c84dde6f2 | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1220/assets/data/parallax/mario_style_hills.svg` |
| 1a90c49b06ad | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-17/1708/main.js` |
| 680b3febde11 | 3 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1218/assets/data/parallax/mountain-ridge-short.svg` |
| 9feb79a83d78 | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1220/assets/data/parallax/mario_style_mountains.svg` |
| cf89bcd9035a | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-17/1709/main.js` |
| 2fb3e00d7762 | 3 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1218/assets/data/parallax/mountain-ridge-tall.svg` |
| 6435cd00ef69 | 9 | sample-variant-intentional | kept-no-action | high | `games/AITargetDummy/rules/gameFlowRules.js` |
| 9a97352ae4b6 | 9 | sample-variant-intentional | kept-no-action | high | `games/Pacman/rules/gameFlowRules.js` |
| df859606f030 | 3 | ambiguous-no-action | kept-no-action | high | `tools/palette-browser/tool.schema.json` |
| 9454a8b0c6e3 | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-12/1220/assets/data/parallax/mario_style_sky.svg` |
| 7fac6c68998c | 2 | report-evidence | demoted-moved | high | `docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/schemas/tools/palette-browser.schema.json` |
| 3a6e82fbca11 | 2 | template-intentional | kept-no-action | medium | `docs/operations/dev/templates/CODEX_AUTO_COMMAND.md` |
| a54340ac4b79 | 2 | template-intentional | kept-no-action | high | `games/vector-arcade-sample/assets/data/tilemaps/template-ui.tileset.json` |
| f01a374e9c81 | 24 | ambiguous-no-action | kept-no-action | high | `games/Pacman/assets/.gitkeep` |
| 1a6ff34ec366 | 2 | sample-variant-intentional | kept-no-action | high | `samples/phase-15/1505/assets/images/hero.png` |
| 29dc1886e7c3 | 2 | generated-validation | kept-no-action | low | `docs/dev/reports/tool_select_population_validation.md` |
| e3b0c44298fc | 4 | ambiguous-no-action | kept-no-action | high | `docs/design/gdd/Nameco/Galaga/gdd.txt` |

## Validation
- Confirmed runtime/tool/test code does not reference demoted evidence paths.
- Confirmed runtime/tool references to sample metadata still point to live SSoT (`samples/metadata/samples.index.metadata.json`).

## Constraints Check
- No start_of_day folders modified.
- No template/sample-variant/generated-validation files were deleted or rewritten.
- No runtime behavior changes introduced.
