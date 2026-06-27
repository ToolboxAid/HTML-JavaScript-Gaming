# PR_26128_002 Session Inspector Restore

## Changes
- Restored `toolbox/session-inspector/**` as a self-contained first-class tool.
- Added read-only storage inspection for current-origin `sessionStorage` and `localStorage`.
- Added first-class registry wiring in `toolbox/toolRegistry.js`.
- Added tools index grouping for `session-inspector` as a Viewer in `toolbox/renderToolsIndex.js`.
- Added shared navigation grouping for `session-inspector` as a Viewer in `toolbox/shared/platformShell.js`.
- Rerun delta adds an explicit Session Inspector runtime contract in `toolbox/session-inspector/js/services/SessionInspectorRuntimeContract.js` and wires it through tool boot status.

## Boundaries
- No cross-tool communication was added.
- No storage writes are performed by `toolbox/session-inspector/**`.
- No repo-selection or File System Access API code was added.
- No sample JSON was modified.
- No roadmap content was modified.

## Validation
- `npm run test:workspace-v2`: Pass, 10 passed.
- Targeted Session Inspector launch test: Pass.
- Targeted Session Inspector runtime contract validation: Pass.
- Targeted tools index Session Inspector card/link validation: Pass.
- Targeted Workspace Manager V2 launch validation: Pass.
- Targeted Preview Generator V2 launch validation: Pass.
- `toolbox/session-inspector/**` file existence check: Pass.
- Git status includes actual runtime/tool changes: Pass, `toolbox/session-inspector/js/SessionInspectorApp.js`, `toolbox/session-inspector/js/bootstrap.js`, and `toolbox/session-inspector/js/services/SessionInspectorRuntimeContract.js`.
- Full samples smoke test: Skipped by BUILD instruction. This PR is scoped to restoring Session Inspector first-class launch and registry/nav wiring only.

## Changed Files
- `toolbox/session-inspector/index.html`
- `toolbox/session-inspector/README.md`
- `toolbox/session-inspector/how_to_use.html`
- `toolbox/session-inspector/styles/sessionInspector.css`
- `toolbox/session-inspector/js/bootstrap.js`
- `toolbox/session-inspector/js/SessionInspectorApp.js`
- `toolbox/session-inspector/js/controls/AccordionSection.js`
- `toolbox/session-inspector/js/controls/DetailsControl.js`
- `toolbox/session-inspector/js/controls/EntryListControl.js`
- `toolbox/session-inspector/js/controls/FilterControl.js`
- `toolbox/session-inspector/js/controls/StatusLogControl.js`
- `toolbox/session-inspector/js/services/SessionInspectorRuntimeContract.js`
- `toolbox/session-inspector/js/services/SessionInspectorStorageService.js`
- `toolbox/toolRegistry.js`
- `toolbox/renderToolsIndex.js`
- `toolbox/shared/platformShell.js`
