# PR_26128_002 Session Inspector Restore

## Changes
- Restored `tools/session-inspector/**` as a self-contained first-class tool.
- Added read-only storage inspection for current-origin `sessionStorage` and `localStorage`.
- Added first-class registry wiring in `tools/toolRegistry.js`.
- Added tools index grouping for `session-inspector` as a Viewer in `tools/renderToolsIndex.js`.
- Added shared navigation grouping for `session-inspector` as a Viewer in `tools/shared/platformShell.js`.

## Boundaries
- No cross-tool communication was added.
- No storage writes are performed by `tools/session-inspector/**`.
- No repo-selection or File System Access API code was added.
- No sample JSON was modified.
- No roadmap content was modified.

## Validation
- `npm run test:workspace-v2`: Pass, 10 passed.
- Targeted Session Inspector launch test: Pass.
- Targeted tools index Session Inspector card/link validation: Pass.
- Targeted Workspace Manager V2 launch validation: Pass.
- Targeted Preview Generator V2 launch validation: Pass.
- Full samples smoke test: Skipped by BUILD instruction. This PR is scoped to restoring Session Inspector first-class launch and registry/nav wiring only.

## Changed Files
- `tools/session-inspector/index.html`
- `tools/session-inspector/README.md`
- `tools/session-inspector/how_to_use.html`
- `tools/session-inspector/styles/sessionInspector.css`
- `tools/session-inspector/js/bootstrap.js`
- `tools/session-inspector/js/SessionInspectorApp.js`
- `tools/session-inspector/js/controls/AccordionSection.js`
- `tools/session-inspector/js/controls/DetailsControl.js`
- `tools/session-inspector/js/controls/EntryListControl.js`
- `tools/session-inspector/js/controls/FilterControl.js`
- `tools/session-inspector/js/controls/StatusLogControl.js`
- `tools/session-inspector/js/services/SessionInspectorStorageService.js`
- `tools/toolRegistry.js`
- `tools/renderToolsIndex.js`
- `tools/shared/platformShell.js`
