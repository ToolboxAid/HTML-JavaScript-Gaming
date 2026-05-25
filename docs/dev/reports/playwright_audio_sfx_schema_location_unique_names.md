# Audio / SFX Playground V2 Schema Location and Unique Names Validation

PR: `PR_26145_001-correct-audio-sfx-schema-location-and-unique-names`

Playwright impacted: Yes.

## Scope

- Moved the Audio / SFX Playground V2 schema to `tools/schemas/tools/audio-sfx-playground-v2.schema.json`.
- Removed the old `tools/schemas/tool-states/audio-sfx-playground-v2.tool-state.schema.json` path.
- Updated Audio / SFX Playground V2 JSON import/export/copy schema references to the corrected tools schema path.
- Added duplicate SFX name rejection for add, rename, export, copy, and import flows.

## Targeted Validation

PASS: JavaScript syntax validation

Command:

```powershell
Get-ChildItem -Recurse -File tools/audio-sfx-playground-v2/js -Filter *.js | ForEach-Object { node --check $_.FullName }
```

PASS: Moved schema JSON parse validation

Command:

```powershell
Get-Content -Raw tools/schemas/tools/audio-sfx-playground-v2.schema.json | ConvertFrom-Json | Out-Null
```

PASS: Diff whitespace validation

Command:

```powershell
git diff --check -- tools/audio-sfx-playground-v2 tools/schemas
```

PASS: Stale schema reference scan

Command:

```powershell
rg "tool-states|audio-sfx-playground-v2\.tool-state|TOOL_STATE_SCHEMA_PATH" tools/audio-sfx-playground-v2 tools/schemas
```

The scan returned no matches.

PASS: Targeted schema/export/name behavior validation

Validated with an inline Node module script:

- New schema exists at `tools/schemas/tools/audio-sfx-playground-v2.schema.json`.
- Old `tools/schemas/tool-states/audio-sfx-playground-v2.tool-state.schema.json` path is removed.
- Schema `$id` uses the corrected tools schema path.
- Schema `$schema` const uses the corrected tools schema path.
- Serializer export uses the corrected schema path.
- Serializer rejects the old schema path.
- Serializer rejects duplicate imported SFX names.
- Duplicate Add shows a Status error.
- Duplicate Add leaves the existing sound list unchanged.
- Duplicate Rename shows a Status error.
- Duplicate Rename leaves the existing sound list unchanged.
- Export rejects a duplicate edited name before mutation.
- Copy JSON uses the corrected schema path after restoring a unique active name.

## Workspace V2 Validation

BLOCKED: `npm run test:workspace-v2`

Result:

```text
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

BLOCKED: `npm.cmd run test:workspace-v2`

Result:

```text
'playwright' is not recognized as an internal or external command,
operable program or batch file.
```

Expected Playwright pass behavior when dependencies are available:

- Workspace V2 launches Audio / SFX Playground V2.
- Copy JSON and Export JSON reference `tools/schemas/tools/audio-sfx-playground-v2.schema.json`.
- The old `tool-states` schema path is not referenced.
- Duplicate add attempts are visibly rejected.
- Duplicate rename attempts are visibly rejected.
- The saved sound list remains unchanged after duplicate rejection.
- Invalid duplicate-name imports are rejected before render.
- No console errors occur during launch, copy, export, add, rename, or invalid import rejection.

Expected Playwright fail behavior:

- Fail if Copy JSON or Export JSON references the old schema path.
- Fail if a duplicate name creates or mutates a saved sound.
- Fail if invalid duplicate-name imports partially render.
- Fail if no visible Status error is shown for duplicate names.
- Fail if console errors occur.

## Coverage

Playwright V8 coverage could not be collected because Playwright is not available in this environment.

WARN: `tools/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js` - changed runtime JavaScript; coverage unavailable.
WARN: `tools/audio-sfx-playground-v2/js/services/ToolStateSerializer.js` - changed runtime JavaScript; coverage unavailable.

## Full Samples Smoke Test

Skipped. This PR only impacts Audio / SFX Playground V2 schema location and name validation.
