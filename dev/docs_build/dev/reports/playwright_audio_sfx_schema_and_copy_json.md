# Audio / SFX Playground V2 Schema and Copy JSON Validation

PR: `PR_26144_010-add-audio-sfx-schema-and-fix-copy-json-state`

Playwright impacted: Yes.

## Scope

- Added an exported toolState schema for Audio / SFX Playground V2 under `toolbox/schemas/tool-states/`.
- Updated Audio / SFX Playground V2 JSON export/import/copy behavior so `payload.sounds[]` is the single source of truth.
- Removed duplicated active sound data from exported JSON. The selected sound is resolved by `payload.activeSoundId` pointing to an entry in `payload.sounds[]`.

## Targeted Validation

PASS: JavaScript syntax validation

Command:

```powershell
Get-ChildItem -Recurse -File toolbox/audio-sfx-playground-v2/js -Filter *.js | ForEach-Object { node --check $_.FullName }
```

PASS: HTML/CSS static validation

Checked Audio / SFX Playground V2 HTML/CSS for empty files, inline event handlers, `<style>` blocks, and inline `<script>` blocks.

PASS: Schema JSON parse validation

Command:

```powershell
Get-Content -Raw toolbox/schemas/tool-states/audio-sfx-playground-v2.tool-state.schema.json | ConvertFrom-Json | Out-Null
```

PASS: Targeted schema/export/import behavior validation

Validated with an inline Node module script:

- New schema requires the exported toolState wrapper path.
- New schema requires nonblank `payload.activeSoundId`.
- New schema requires at least one `payload.sounds[]` entry.
- New schema does not define duplicated `payload.sound` or `payload.name`.
- Serializer accepts generated export payloads.
- Serializer rejects blank active sound ids.
- Serializer rejects stale duplicated `payload.sound`.
- Serializer rejects active ids missing from `payload.sounds[]`.
- Copy JSON creates/selects a sound tile when needed.
- Copy JSON output passes serializer validation.
- Copy JSON activeSoundId matches an existing tile.
- Import restores the selected active sound.
- Invalid import shows a visible Status error and does not mutate the selected sound.

PASS: Diff whitespace validation

Command:

```powershell
git diff --check -- toolbox/audio-sfx-playground-v2 toolbox/schemas
```

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
- Copy JSON produces a schema-valid toolState wrapper.
- Export JSON produces the same schema-valid wrapper shape.
- `payload.activeSoundId` is nonblank and matches an existing `payload.sounds[]` entry.
- Import restores the selected sound tile and editor state.
- Invalid payloads are rejected with visible Status errors.
- No console errors occur during launch, copy, export, import, or invalid import rejection.

Expected Playwright fail behavior:

- Fail if Copy JSON or Export JSON emits duplicated/stale active sound fields.
- Fail if `activeSoundId` is blank while sounds exist.
- Fail if `activeSoundId` points to a missing sound tile.
- Fail if invalid JSON partially renders or mutates the selected sound.
- Fail if console errors occur.

## Coverage

Playwright V8 coverage could not be collected because Playwright is not available in this environment.

WARN: `toolbox/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js` - changed runtime JavaScript; coverage unavailable.
WARN: `toolbox/audio-sfx-playground-v2/js/services/ToolStateSerializer.js` - changed runtime JavaScript; coverage unavailable.

## Full Samples Smoke Test

Skipped. This PR only impacts Audio / SFX Playground V2 toolState schema and JSON behavior.
