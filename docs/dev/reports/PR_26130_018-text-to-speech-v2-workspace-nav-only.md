# PR_26130_018-text-to-speech-v2-workspace-nav-only

## Summary

Updated Text to Speech V2 workspace launch navigation only. Workspace launches now show a below-header Text to Speech V2 workspace nav with Return to Workspace, matching the Palette Manager V2 placement pattern while keeping speech playback controls inside the Named Sentences surface.

## Scope Guard

- Text to Speech V2 only for implementation files.
- No schema files changed.
- No Workspace Manager schema contract changes.
- No Text to Speech V2 payload/schema shape changes.
- No start_of_day changes.

## Files Changed

- tools/text2speach-V2/index.html
- tools/text2speach-V2/styles/text2speach-V2.css
- tools/text2speach-V2/js/bootstrap.js
- tools/text2speach-V2/js/controls/ActionNavControl.js
- tests/playwright/tools/WorkspaceManagerV2.spec.mjs

## Implementation Notes

- Moved the Text to Speech V2 workspace nav out of the Named Sentences accordion to the below-header position used by Palette Manager V2.
- The below-header workspace nav uses Text to Speech V2 classes: text2speach-V2__menu, text2speach-V2__workspace-menu, and text2speach-V2__menu-actions.
- The workspace nav contains Return to Workspace only.
- The regular speech action buttons remain in the Named Sentences accordion and remain available during workspace launches.
- Return to Workspace continues to preserve hostContextId in the Workspace Manager V2 return URL.

## Playwright Impacted

Yes.

Playwright validates:
- Standalone Text to Speech V2 launch keeps the workspace nav hidden.
- Workspace-launched Text to Speech V2 shows the below-header workspace nav.
- The Return to Workspace button is visible in workspace launch mode.
- The workspace nav is placed between the collapsible header and the main Text to Speech V2 app surface.
- Return to Workspace preserves the active hostContextId in the Workspace Manager V2 URL.

Expected pass behavior:
- Workspace nav is visible only for launch=workspace, fromTool=workspace-manager-v2, and hostContextId launches.
- Standalone launches do not show the workspace nav.
- Return navigation returns to Workspace Manager V2 without clearing or dirtying workspace/toolState data.

Expected fail behavior:
- Missing or misplaced workspace nav, missing Return to Workspace button, or lost hostContextId fails the Playwright assertions.

## Validation

- `npm run test:workspace-v2` passed: 30 tests passed.
- Initial `npm run test:workspace-v2` attempt timed out due the command timeout; rerun with a longer timeout passed.
- `node --check tools/text2speach-V2/js/bootstrap.js` passed.
- `node --check tools/text2speach-V2/js/controls/ActionNavControl.js` passed.
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs` passed.
- `git diff --check HEAD -- ...` passed with line-ending warnings only.

## Full Samples Smoke Test

Skipped. Reason: this PR is limited to Text to Speech V2 workspace nav placement and does not modify shared sample loading, broad runtime sample launch paths, or game/sample data contracts.

## Manual Test Steps

1. Open Text to Speech V2 directly from `tools/text2speach-V2/index.html`.
2. Confirm no below-header Workspace actions nav is visible.
3. Open Workspace Manager V2, select a repo and Asteroids, then launch Text to Speech V2.
4. Confirm a below-header Workspace actions nav appears with Return to Workspace.
5. Click Return to Workspace.
6. Confirm the browser returns to Workspace Manager V2 with the same hostContextId and the active workspace/toolState remains open.
