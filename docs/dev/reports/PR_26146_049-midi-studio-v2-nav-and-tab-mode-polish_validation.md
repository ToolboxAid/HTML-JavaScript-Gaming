# PR_26146_049 MIDI Studio V2 NAV and Tab Mode Polish Validation

Status: PASS

## Scope

- Removed the visible launch-mode badge text from MIDI Studio V2 while preserving internal launch-mode state on `body[data-midi-studio-launch-mode]`.
- Preserved launch-specific NAV behavior so workspace launch shows only Workspace NAV actions and tool launch shows only tool-owned Import/Save/Export actions.
- Normalized `Import JSON Manifest` to use the same NAV button styling as neighboring action buttons.
- Restyled MIDI Studio section controls as tabs with matching NAV font, clickable inactive tabs, and a distinct active tab.

## Changed Files

- `tools/midi-studio-v2/index.html`
- `tools/midi-studio-v2/js/bootstrap.js`
- `tools/midi-studio-v2/js/controls/ActionNavControl.js`
- `tools/midi-studio-v2/styles/midiStudioV2.css`
- `tests/playwright/tools/MidiStudioV2.spec.mjs`

## Validation Commands

- PASS: `node --check tools/midi-studio-v2/js/bootstrap.js`
- PASS: `node --check tools/midi-studio-v2/js/controls/ActionNavControl.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: HTML external-only guard for `tools/midi-studio-v2/index.html`
- PASS: CSS brace check for `tools/midi-studio-v2/styles/midiStudioV2.css`
- PASS: `npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "separates Workspace launch save ownership from Tool Mode standalone save|launches and renders a valid multi-song manifest payload|exports output through Type dropdown and Save Output without claiming project save|fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync" --config=codex_playwright_system_chrome.config.cjs --reporter=list --workers=1 --timeout=60000`
- PASS: `git diff --check`

## Playwright Coverage

The targeted MIDI Studio V2 Playwright run proved:

- Workspace launch shows Workspace NAV and hides the tool-only NAV.
- Workspace launch exposes `Return to Workspace` without standalone Save/Import/Export output controls.
- Tool launch shows tool-only Import JSON Manifest, Save Project, and output Export Type/Save controls.
- Workspace-only return controls are hidden in tool launch.
- Visible `Tool Mode` and `Workspace Mode` labels are absent.
- `Import JSON Manifest` computed font, weight, padding, and button shape match the other NAV buttons.
- Studio, Song Setup, Instruments, Auto-Create Parts, MIDI Import, and Diagnostics render as tabs.
- Tab font matches NAV button font.
- Active tab is visually distinct and inactive tabs remain clickable.
- Tab switching still shows the MIDI Import and Studio panels.
- Play and Stop still work through the existing fast octave editing coverage.

## Samples Decision

Full samples smoke test: SKIP. This PR only changes MIDI Studio V2 launch NAV presentation, tab styling, and targeted Playwright coverage. No sample JSON, shared runtime, or broad sample loading behavior changed.

## Notes

- Initial targeted Playwright run exposed a brittle exact subpixel border assertion for tabs. The implementation was kept scoped, and the test was corrected to prove visible tab shape and active/inactive distinction instead of an environment-specific fractional border value.
