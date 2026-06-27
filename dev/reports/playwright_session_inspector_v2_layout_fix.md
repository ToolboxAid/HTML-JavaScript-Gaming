# PR_26128_013 Playwright Session Inspector V2 Layout Fix

## Command
`npm run test:workspace-v2`

## Result
PASS: 14/14 tests passed.

## Targeted Coverage
- Session Inspector V2 launches from `toolbox/session-inspector-v2/index.html`.
- `Return to Workspace` is present and returns to Workspace Manager V2 with launch context preserved.
- The old loose action nav is absent.
- The left column shows `Controls` before `Filters`.
- `Refresh`, `Delete All`, and `Clear Status` are inside the `Controls` accordion.
- The count display renders `(N) Entries shown.`, `(N) SessionStorage.`, and `(N) LocalStorage.` as separate lines.
- Controls, Filters, Entries, Details, and Status accordions all open and close from header label and icon clicks.
- Header frame and app shell use V2 boxed frame styling and existing theme tokens.
- Per-entry Delete still removes the selected session entry, refreshes the UI immediately, and logs `OK`.
- A simulated delete failure still logs `FAIL`.
- Delete All still clears displayed entries, refreshes counts/details immediately, and logs `OK` or `WARN`.

## Skipped
Full samples smoke test was skipped as requested because this PR changes Session Inspector V2 layout/control behavior and does not touch sample JSON or sample runtime paths.
