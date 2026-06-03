# PR_26145_018 Audio / SFX Workspace Dirty and Manifest Schema

Date: 2026-05-25

## Targeted validation

- `node --check` passed for changed Audio / SFX and Workspace V2 JavaScript files.
- JSON parse validation passed for:
  - `toolbox/schemas/game.manifest.schema.json`
  - `toolbox/schemas/tools/audio-sfx-playground-v2.schema.json`
- HTML external asset guard passed for `toolbox/audio-sfx-playground-v2/index.html`.
- Workspace schema fragment validation passed for `toolbox/schemas/tools/audio-sfx-playground-v2.schema.json#/$defs/audioSfxPayload`.
- Generated Workspace context validation passed with an Audio / SFX payload.
- Game manifest schema validation passed with `root.tools.audio-sfx-playground-v2`.

## npm run test:workspace-v2

Blocked by local Playwright browser installation:

```text
browserType.launch: Executable doesn't exist at C:\Users\DavidQ\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe
```

Attempted `npx.cmd playwright install chromium`, but the sandbox cannot create the browser cache outside the repo:

```text
EPERM: operation not permitted, mkdir 'C:\Users\DavidQ\AppData\Local\ms-playwright'
```

## Focused Playwright validation

Ran a focused Playwright script with installed Microsoft Edge.

Validated:

- Audio / SFX launches from Workspace mode with no console errors.
- Add SFX marks `workspace.tools.audio-sfx-playground-v2.dirty.isDirty=true`.
- Slider edits mark dirty.
- Waveform changes mark dirty.
- Add Noise Layer changes mark dirty.
- Rename marks dirty.
- Delete marks dirty.
- Valid Import JSON marks dirty.
- Copy JSON, Export JSON, and Play do not mark dirty.
- Copy JSON copies the current exported payload.
- Workspace V2 refresh includes the Audio / SFX payload for Save context.
- Workspace V2 schema references validate the Audio / SFX payload schema fragment.
- Game manifest schema validates `root.tools.audio-sfx-playground-v2`.

Result: focused impacted validation passed.
