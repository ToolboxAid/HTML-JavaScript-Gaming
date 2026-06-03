# PR_26145_019 Audio / SFX Shared Dirty Contract

Date: 2026-05-25

## Targeted validation

- `node --check` passed for changed JavaScript:
  - `tools/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js`
  - `tools/audio-sfx-playground-v2/js/bootstrap.js`
  - `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- JSON parse validation passed for:
  - `tools/schemas/game.manifest.schema.json`
  - `tools/schemas/tools/audio-sfx-playground-v2.schema.json`
- HTML external asset guard passed for `tools/audio-sfx-playground-v2/index.html`.
- Static grep verified no `WorkspaceDirtyBridge`, `workspaceDirtyBridge`, or `sessionStorage` usage remains under `tools/audio-sfx-playground-v2/js`.
- Node contract validation passed for `WorkspaceManagerV2ContextService.writeWorkspaceToolPayload`, including schema validation, dirty marking, and persisted context validation.

## npm run test:workspace-v2

Blocked by local Playwright browser installation:

```text
browserType.launch: Executable doesn't exist at C:\Users\DavidQ\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe
```

The exact command `npm.cmd run test:workspace-v2` was attempted and timed out after repeating the missing-browser failure. A one-failure run confirmed the root cause.

## Focused Playwright validation

Ran a focused Playwright script with installed Microsoft Edge.

Validated:

- `WorkspaceDirtyBridge.js` is removed from Audio / SFX runtime usage.
- Audio / SFX uses `WorkspaceManagerV2ContextService` as the shared Workspace V2 dirty path.
- Add/edit marks `workspace.tools.audio-sfx-playground-v2.dirty.isDirty=true`.
- Valid Import JSON marks dirty.
- Copy JSON, Export JSON, and Play do not mark dirty.
- Copy JSON produces parseable exported JSON.
- Workspace dirty gate used by Save/Cancel observes the Audio / SFX dirty session.
- Workspace refresh includes the Audio / SFX payload for Save context.
- Audio / SFX payload schema fragment validates.
- Game manifest schema validates `root.tools.audio-sfx-playground-v2`.
- No console errors on launch or validation actions.

Result: focused impacted validation passed.
