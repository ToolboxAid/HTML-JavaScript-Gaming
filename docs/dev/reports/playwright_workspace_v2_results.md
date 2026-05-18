# npm run test:workspace-v2

Exit code: 0

```text
> html-javascript-gaming@1.0.0 test:workspace-v2
> playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list

Running 55 tests using 1 worker

Result: 55 passed (6.6m)

PR_26133_096 focused coverage included:
- drags selected Object Vector Studio V2 shapes from preview selection bounds
- multi-selected shapes move together from preview selection bounds
- grouped shapes selected by group icon move together from preview selection bounds
- outside-bounds drag follows normal deselect/no-move behavior

Additional focused checks run before the full suite:
- Object Vector Studio V2 layout shell and schema-only palette gate
- selection bounds alignment to transformed preview geometry
- Object Vector Studio V2 asset authoring controls
- dirty state through persisted edits and save outcomes
```
