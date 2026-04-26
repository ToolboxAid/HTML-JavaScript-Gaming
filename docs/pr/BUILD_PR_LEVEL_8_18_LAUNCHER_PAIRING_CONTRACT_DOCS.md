# BUILD_PR_LEVEL_8_18_LAUNCHER_PAIRING_CONTRACT_DOCS

## Launcher Contract

openTool(
  toolPayloadJson,
  dataObjects
)

### toolPayloadJson
- sample.<id>.<tool>.json
- identical to workspace tools[] entry

### dataObjects
- palette object
- asset objects
- passed separately

## Rules
- No palette/data inside tool payload
- Tool schema remains consistent across sample + workspace
- Launcher responsible for wiring

## Acceptance
- Contract documented
- No schema changes
