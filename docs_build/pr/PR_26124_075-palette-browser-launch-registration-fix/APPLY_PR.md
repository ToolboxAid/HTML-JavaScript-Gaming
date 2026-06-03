# APPLY_PR - PR_26124_075-palette-browser-launch-registration-fix

## Summary
Fixed palette-backed sample launch registration by updating sample metadata launch ids from the palette data key `palette-browser` to the active tool id `palette-manager-v2`.

## Applied Changes
- Updated `samples/metadata/samples.index.metadata.json`:
  - `toolHints[]`: `palette-browser` -> `palette-manager-v2`
  - `roundtripToolPresets[].toolId`: `palette-browser` -> `palette-manager-v2`
- Preserved existing palette preset paths.
- Preserved sample palette JSON files.
- Did not add a registry alias because `resolveToolIdAlias` does not currently implement aliases.

## Runtime/Data Result
- Samples index now resolves palette-backed launch links through the active `palette-manager-v2` registry entry.
- Palette data contract keys such as `tools.palette-browser` remain unchanged.
- No tools, workspace/toolState/session files, sample launch code, or sample palette JSON files were changed.

## Validation
- PASS: parsed `samples/metadata/samples.index.metadata.json`.
- PASS: targeted metadata registry validation for sample `toolHints` and `roundtripToolPresets`.
- PASS: targeted served Samples index launch validation confirmed:
  - no `Tool "palette-browser" is not registered in toolRegistry.` message,
  - the tool filter includes `palette-manager-v2`,
  - the tool filter does not include `palette-browser`,
  - sample 0213 links to `/tools/palette-manager-v2/index.html` with its palette preset path.
- PASS: `git diff --check`
- FAIL: `npm run test:workspace-v2` is unavailable because `package.json` does not define a `test:workspace-v2` script.
- SKIPPED: full samples smoke test, by instruction.

## Manual Test
1. Open `samples/index.html`.
2. Search for sample `0213`.
3. Confirm no `Tool "palette-browser" is not registered in toolRegistry.` message appears.
4. Confirm the sample has an `Open Palette Manager V2` launch link.
5. Confirm sample palette JSON files were not changed.
