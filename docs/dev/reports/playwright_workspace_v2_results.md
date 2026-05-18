# npm run test:workspace-v2

Exit code: 0

```text
> html-javascript-gaming@1.0.0 test:workspace-v2
> playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list

Running 55 tests using 1 worker

Result: 55 passed (6.1m)

Result for PR_26133_097:
- PASS small pointer movement inside selected bounds does not start preview drag
- PASS selected shape repeated click preserves the selected set
- PASS empty canvas drag/click outside selected bounds follows normal deselect/no-move behavior
- PASS single-shape live drag updates selection bounds and resize/point handle positions before mouseup
- PASS multi-selected shapes and grouped shapes still move together from preview selection bounds
- PASS realtime drag transform values remain max 3 decimals

Additional focused checks run before the full suite:
- drags selected Object Vector Studio V2 shapes from preview selection bounds
- Object Vector Studio V2 layout shell and schema-only palette gate
```
