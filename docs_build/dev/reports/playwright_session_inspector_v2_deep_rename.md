# PR_26128_012 Playwright Session Inspector V2 Deep Rename

## Command
`npm run test:workspace-v2`

## Result
PASS: 14/14 tests passed.

## Targeted Coverage
- Tools index shows `Session Inspector V2` and does not show the old exact `Session Inspector` card label.
- Workspace Manager V2 shows `Session Inspector V2` in the Viewers tool group.
- Workspace Manager V2 no longer exposes an old `session-inspector` tile id.
- Workspace Manager V2 hydrates `workspace.tools.session-inspector-v2.schema` and `workspace.tools.session-inspector-v2.state`.
- Session Inspector V2 launches from `toolbox/session-inspector-v2/index.html`.
- Session Inspector V2 uses V2 page labels, ids, stylesheet path, and tool id.
- Session Inspector V2 accordions open and close.
- Session Inspector V2 CSS uses shared theme tokens.
- Per-entry Delete removes the selected sessionStorage entry, updates the list/details immediately, and logs `OK`.
- Simulated storage deletion failure logs `FAIL` and keeps the entry visible.
- Delete All clears remaining displayed sessionStorage entries and logs `OK`.
- Delete All on an empty displayed list logs `WARN`.

## Skipped
Full samples smoke test was skipped as requested because this PR affects Session Inspector V2, Workspace Manager V2 registration, and targeted tool launch UI rather than sample runtime behavior.
