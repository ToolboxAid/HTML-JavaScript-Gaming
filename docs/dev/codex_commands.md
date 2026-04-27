# CODEX COMMANDS — LEVEL 10.6B Palette Contract Alignment

Model: GPT-5.4
Reasoning: high

## PR Purpose
Normalize palette payload contracts so palette data in manifest inputs and tool JSON inputs use the same canonical shape.

## Codex Command
```powershell
codex --model gpt-5.4 --reasoning high "Implement LEVEL_10_6B_PALETTE_CONTRACT_ALIGNMENT. One PR purpose only. Do not add new features, schemas, tools, fallback data, hardcoded asset paths, or silent default loading. Fix palette contract drift only. Ensure palette-bearing standalone samples pass explicit data flow: sample -> manifest -> normalized input -> tool -> UI/state. Manifest palette payloads and tool palette JSON files must share the same canonical palette object shape: schema, version, name, source, swatches. Remove legacy leading metadata such as $schema from runtime palette payloads where it causes mismatch. Replace source values such as engine/paletteList with manifest or another explicit manifest-derived source where appropriate. Palette Browser and palette-dependent tools must consume payload.palette directly, then bind state.palette to UI. Do not reshape, merge, inject defaults, or auto-load hidden palettes inside tools. Update the standalone data-flow report/status only as needed after running tests. Run npm run test:launch-smoke:games and npm run test:sample-standalone:data-flow."
```

## Required Validation
```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

## Report to Inspect
```powershell
docs/dev/reports/level_10_6_standalone_tool_data_flow_report.md
```

## Commit Comment
```text
Normalize palette contract to manifest SSoT and remove tool-level schema drift - PR 10.6B
```
