# Launcher Pairing Contract

## Purpose
Define how launchers pass tool payload data and shared data objects without embedding shared data into tool payload files.

## Contract
`openTool(toolPayloadJson, dataObjects)`

### `toolPayloadJson`
- Source file pattern: `sample.<id>.<tool>.json`
- Shape: identical to the corresponding `tools[]` item shape used in workspace manifests
- Scope: tool payload only

### `dataObjects`
- Contains shared, externalized objects such as palette data and asset data
- Passed separately from `toolPayloadJson`

## Rules
- Do not embed palette objects inside tool payload JSON files.
- Do not embed shared asset objects inside tool payload JSON files.
- Keep one tool payload shape across sample and workspace launch paths.
- Launcher wiring composes `toolPayloadJson` with `dataObjects` at launch time.
