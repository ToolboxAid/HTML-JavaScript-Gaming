# Sample Rebuild Authoritative Surfaces

PR: PR_26152_152-sample-rebuild-authoritative-surfaces
Date: 2026-06-02

## Scope

- Defined authoritative validation surfaces.
- Identified which schemas govern rebuilt samples.
- Eliminated assumptions about `workspace.schema.json`.
- Made no sample JSON changes.

## Authoritative Surfaces

| Surface | Authority | Use For Rebuilt Samples |
| --- | --- | --- |
| `tools/schemas/game.manifest.schema.json` | Active manifest schema | Game/sample manifest ownership, launch path, tool map, and asset/tool references where game manifest direction is used. |
| `tools/schemas/tools/*.schema.json` | Active tool payload schemas | Tool-specific payload validation. |
| `tools/schemas/samples/sample.tool-payload.schema.json` | Existing sample wrapper schema | Legacy wrapper validation only, unless future rebuild keeps wrapper format intentionally. |
| `src/shared/contracts/projectWorkspaceRuntimeContract.js` | ProjectWorkspace runtime-only contract | ProjectWorkspace handoff and runtime coordination boundaries. |
| `src/shared/contracts/toolStateContract.js` | Tool State contract | Saved tool payload ownership, version, status, visibility, and portability. |
| `src/shared/contracts/gameManifestContract.js` | Contract-level manifest planning surface | Portable manifest ownership rules for future DB/export alignment. |

## Non-Authoritative Or Missing Surfaces

| Surface | Status | Decision |
| --- | --- | --- |
| `tools/schemas/workspace.schema.json` | Missing | Do not assume it exists. |
| `tools/schemas/workspace.manifest.schema.json` | Missing | Do not use as authoritative for rebuilt samples in this lane. |
| Historical references under `docs/dev/reports/` | Historical | Do not treat as active schema ownership. |
| Historical snapshots under `tools/schemas/docs/` | Historical | Do not treat as active schema ownership. |
| Sample launch behavior | Future | Not an authoritative validation surface until rebuilt sample execution PRs scope it. |

## Active Game Manifest Tool Keys

Current `game.manifest.schema.json` governs these tool keys under `tools`:

- `asset-manager-v2`
- `audio-sfx-playground-v2`
- `input-mapping-v2`
- `midi-studio-v2`
- `object-vector-studio-v2`
- `palette-manager-v2`
- `text2speech-V2`

Other rebuilt sample tools may need either:

- direct Tool State payload validation against `tools/schemas/tools/<toolId>.schema.json`, or
- an explicit future schema update before they become manifest-owned sample launch targets.

## Validation

Static validation surface review only:

```powershell
rg --files tools/schemas
Get-ChildItem tools/schemas -Recurse -Filter '*workspace*'
node -e "<static active schema surface inventory>"
```

Result: PASS.

## Lanes Executed

- docs/report authoritative surface review only.

## Lanes Skipped

- samples - no sample JSON changes and no sample launch validation.
- runtime - no runtime behavior changed.
- tool runtime validation - not run.
- engine - no engine code changed.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. Rebuilt samples remain future work.

## Playwright

Playwright impacted: No.

## Blocker Scope

No blocker for static surface review. Missing workspace schema assumptions are eliminated from the active validation plan.
