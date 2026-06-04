# PR_26154_048 Toolbox Registry Final Cleanup

## Summary
- Replaced `toolbox/toolRegistry.js` hidden legacy/archive metadata with active toolbox entries only.
- Deleted unused `toolbox/renderToolsIndex.js`; active `toolbox/index.html` is rendered by `toolbox/tools-page-accordions.js`.
- Deleted deprecated `tests/tools/ToolHostDispatchContract.test.mjs` and removed it from `tests/run-tests.mjs`.
- Deleted obsolete registry-era validators that referenced removed template/legacy registry behavior:
  - `scripts/validate-project-system.mjs`
  - `scripts/validate-starter-project-template.mjs`

## Active Registry Entries
- AI Assistant: `toolbox/ai-assistant/index.html`
- Animation: `toolbox/animation/index.html`
- Assets: `toolbox/assets/index.html`
- Cloud: `toolbox/cloud/index.html`
- Custom Extensions: `toolbox/code/index.html`
- Game Design: `toolbox/game-design/index.html`
- Input: `toolbox/input/index.html`
- Localization: `toolbox/localization/index.html`
- MIDI: `toolbox/midi/index.html`
- Object Vector: `toolbox/object-vector/index.html`
- Palette Manager: `toolbox/palette/index.html`
- Particles: `toolbox/particles/index.html`
- Publish: `toolbox/publish/index.html`
- Sound: `toolbox/sound/index.html`
- Storage Inspector: `toolbox/storage/index.html`
- World Vector: `toolbox/world-vector/index.html`

## Path Adjustments
- `toolbox/toolRegistry.js`: removed all `archive/v1-v2` entry paths and set active entry points to `toolbox/[toolname]/index.html` via registry-local `entryPoint` values.
- `tests/run-tests.mjs`: removed the `ToolHostDispatchContract` import and runner entry because it depended on deleted `toolbox/renderToolsIndex.js` and removed Tool Host-era behavior.
- `docs_build/tools/README.md`: changed the Tools Index And Registry UAT link to the archived location.

## renderToolsIndex.js Audit
- `toolbox/index.html` does not import `toolbox/renderToolsIndex.js`.
- Active index behavior comes from `toolbox/tools-page-accordions.js`.
- Deleted `toolbox/renderToolsIndex.js`.
- Archived its UAT doc from `docs_build/tools/tools-index-registry/` to `archive/v1-v2/docs_build/tools/tools-index-registry/`.

## toolbox/code Decision
- Kept `toolbox/code/` active.
- Reason: creator-extension contracts still require it:
  - `src/shared/contracts/tools/codeStudioContract.js` declares `toolId: "code-studio"`.
  - `src/shared/contracts/tools/toolContractsIndex.js` marks Custom Extensions as contracted.
  - Workspace fixtures still include `code-studio`.
  - `toolbox/tools-page-accordions.js` links Custom Extensions to `../toolbox/code/index.html`.

## Validation
- PASS: `node scripts/validate-tool-registry.mjs`
- PASS: active registry contains 16 active visible toolbox entries.
- PASS: no active `toolbox/toolRegistry.js` archive/legacy metadata remains.
- PASS: `toolbox/renderToolsIndex.js` is absent.
