# PLAN_PR - PR_26124_075-palette-browser-launch-registration-fix

## Goal
Fix sample launch registration for palette sample roundtrip links so samples no longer report `Tool "palette-browser" is not registered in toolRegistry.`

## Scope
- `samples/metadata/samples.index.metadata.json`
- Targeted launch validation test if needed.
- Required PR workflow docs and review artifacts.

## Boundaries
- Do not modify tools.
- Do not modify unrelated tool metadata.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample palette JSON files.
- Do not modify sample launch code.
- Do not add fallback/default data.
- Do not add dependencies.
- Do not run the full samples smoke test.

## Implementation Decision
The active tool registry id is `palette-manager-v2`. The palette data contract key remains `palette-browser`, but that key is not the launch id. The repo's alias resolver currently returns the input id unchanged, so adding a `palette-browser` alias would introduce a new alias pattern instead of using the active tool identity consistently.

## Implementation Plan
1. Update sample metadata `toolHints` entries from `palette-browser` to `palette-manager-v2`.
2. Update matching `roundtripToolPresets[].toolId` entries from `palette-browser` to `palette-manager-v2`.
3. Preserve existing palette preset paths, palette JSON files, and data contract keys.
4. Validate that every sample tool hint and roundtrip preset tool id maps to a registered active tool, excluding the existing `workspace-manager` special case.
5. Run a targeted samples index launch validation that confirms no `Tool "palette-browser" is not registered in toolRegistry.` issue is rendered.

## Playwright
- Targeted command validates the Samples index page no longer renders the palette-browser registration error.
- Expected pass behavior: samples with palette preset links render Palette Manager V2 launch links and no unregistered palette-browser issue.
- Expected fail behavior: the page contains the old registration error or active palette metadata does not resolve through the registry.
- Default requested gate: `npm run test:workspace-v2`

## Manual Validation
1. Open `samples/index.html`.
2. Filter or search for a palette-backed sample such as 0213, 0308, or 0313.
3. Confirm no `Tool "palette-browser" is not registered in toolRegistry.` message is shown.
4. Confirm the palette launch action opens Palette Manager V2.
5. Confirm sample palette JSON files were not changed.
