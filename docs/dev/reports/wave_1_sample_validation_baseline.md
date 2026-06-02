# Wave 1 Sample Validation Baseline

PR: PR_26152_156-wave-1-sample-validation-baseline
Date: 2026-06-02

## Scope

- Defined validation baseline for rebuilt Wave 1 samples.
- Defined valid payload expectations.
- Defined invalid payload expectations.
- Defined PASS/FAIL/WARN/SKIP rules.

## Valid Payload Expectations

| Target | Valid Expectation |
| --- | --- |
| Text to Speech V2 | Payload validates against `tools/schemas/tools/text2speech-V2.schema.json`; Tool State owns saved speech queue payload. |
| Asset Pipeline | Payload validates against `tools/schemas/tools/asset-pipeline.schema.json`; manifest references assets/project context explicitly. |
| Sprite Editor | Payload validates against `tools/schemas/tools/sprite-editor.schema.json` and includes required `spriteProject` structure. |
| Palette | Palette payload validates against `tools/schemas/tools/palette-browser.schema.json` or approved future palette ownership surface. |
| Tile Map Editor | Payload validates against `tools/schemas/tools/tile-map-editor.schema.json`; tilemap data belongs to Tool State. |
| Parallax Editor | Payload validates against `tools/schemas/tools/parallax-editor.schema.json`; image/layer asset references are file/path based. |
| SVG Asset Studio | Payload validates against `tools/schemas/tools/svg-asset-studio.schema.json`; vector/asset ownership is explicit. |
| Workspace all-tools sample | Uses active authoritative manifest/tool/ProjectWorkspace surfaces; does not depend on missing workspace schema. |

## Invalid Payload Expectations

Future rebuilt Wave 1 validation should reject:

- missing `manifestInput`
- missing `toolStateInput`
- ProjectWorkspace-owned saved payload data
- hidden fallback/sample bootstrap payloads
- `localStorage` or `sessionStorage` as source of truth
- persisted `imageDataUrl`
- schema references to missing `workspace.schema.json` or `workspace.manifest.schema.json`
- legacy `tool` / `payload` wrapper retained as final source of truth without an approved wrapper decision
- tool payload fields outside the selected authoritative schema

## PASS/FAIL/WARN/SKIP Rules

| Status | Rule |
| --- | --- |
| PASS | Rebuilt Wave 1 sample satisfies the exact static/schema/handoff validation requested by its execution PR. |
| FAIL | Rebuilt Wave 1 sample in scope violates selected schema, manifest, Tool State, or ProjectWorkspace boundary rules. |
| WARN | Rebuilt Wave 1 sample has a documented non-blocking follow-up that does not violate active validation. |
| SKIP | Sample is unrebuilt, outside Wave 1, outside active execution scope, or dependency-gated by a future schema decision. |

## Validation

Static validation review:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report validation baseline only.

## Lanes Skipped

- samples - no sample JSON changes and no sample launch validation.
- runtime - no runtime behavior changed.
- tool runtime validation - not run.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

Unrebuilt samples remain SKIP. Wave 1 rebuilt samples become PASS/FAIL targets only when future execution PRs modify them.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blocker for static validation baseline.
