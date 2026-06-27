# PR_26146_048 MIDI Studio V2 Launch Mode Save Ownership Validation

Status: PASS

## Scope
- Continued from PR_26146_047.
- Added visible launch mode indicator for Tool Mode and Workspace Mode.
- Preserved Tool Mode standalone Import JSON, Save Project, and output export workflow.
- Kept Workspace Manager launch mode focused on Return to Workspace while hiding standalone project save/import/export controls.
- Relabeled rendered export controls as output export (`Output Type`, `Save Output`) so they are not mistaken for project save.
- Verified Workspace edits update the active canonical MIDI Studio tool payload in session storage before returning to Workspace Manager.

## Changed-File Syntax Checks
PASS:

```text
node --check toolbox/midi-studio-v2/js/controls/ActionNavControl.js
node --check toolbox/midi-studio-v2/js/bootstrap.js
node --check tests/playwright/tools/MidiStudioV2.spec.mjs
node --check toolbox/midi-studio-v2/js/MidiStudioV2App.js
```

Additional guards:

```text
HTML external-only guard passed
CSS brace check passed
```

## Targeted Playwright Validation
PASS:

```text
npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "separates Workspace launch save ownership from Tool Mode standalone save|launches and renders a valid multi-song manifest payload|exports output through Type dropdown and Save Output without claiming project save|persists octave note edits into canonical song data, playback, save, and reset|fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync" --config=codex_playwright_system_chrome.config.cjs --reporter=list --workers=1 --timeout=60000
```

Result:

```text
Running 5 tests using 1 worker
ok 1 fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync
ok 2 persists octave note edits into canonical song data, playback, save, and reset
ok 3 separates Workspace launch save ownership from Tool Mode standalone save
ok 4 launches and renders a valid multi-song manifest payload
ok 5 exports output through Type dropdown and Save Output without claiming project save
5 passed
```

## Required Assertions Covered
- PASS: Workspace launch shows Return to Workspace.
- PASS: Workspace launch hides standalone Save Project and Import JSON controls.
- PASS: Workspace edits remain in the canonical MIDI Studio tool payload before return.
- PASS: Tool-only launch shows Import JSON and Save Project.
- PASS: Export Type + Save Output remains output-only and does not report project save.
- PASS: Play and Stop still work through targeted playback/editing coverage.

## Diff Hygiene
PASS:

```text
git diff --check
```

Git reported line-ending normalization warnings for touched files, but no whitespace errors.

## Not Run
- Full samples smoke test was not run, per PR instructions.

## Result
PR_26146_048 is marked PASS. Workspace Manager owns final save in Workspace Mode, while Tool Mode keeps the standalone file workflow.
