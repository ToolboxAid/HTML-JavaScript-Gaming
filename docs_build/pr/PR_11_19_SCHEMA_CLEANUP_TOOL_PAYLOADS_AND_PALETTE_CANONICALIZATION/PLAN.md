# PLAN_PR_11_19_SCHEMA_CLEANUP_TOOL_PAYLOADS_AND_PALETTE_CANONICALIZATION

## Purpose
Clean up schema ownership so tools accept only valid tool JSON payloads, Palette has one canonical schema, and confusing generic schema fields are renamed.

## Problems
1. Palette schema duplication:
   - Correct canonical location/name should be:
     `tools/schemas/tools/palette-browser.schema.json`
   - Existing `tools/schemas/palette.schema*` files should be removed after their content is moved/merged.
   - Only one palette schema should remain: palette-browser.

2. `sample.tool-payload.schema.json` is too broad:
   - Tools should accept only tool JSON payloads.
   - Sample wrapper objects and extra objects should not validate as tool payloads.
   - Tool schemas should be referenced directly with `$ref`.

3. Tool schemas use a generic `config` section:
   - Rename to a clearer field name that describes what it contains.
   - Suggested: `payload`
   - Alternative acceptable if repo standard exists: `toolData` or `document`

4. `gameId` is too narrow:
   - Workspace/sample 1902 is not necessarily a game.
   - Replace or supplement with a generic identifier.
   - Suggested: `projectId`, `sourceId`, or `workspaceId` depending on context.

## Scope
- Schema files under `tools/schemas/`
- Tool payload validation
- Workspace manifest schema references
- Sample 1902 only if required to validate
- Do not modify other samples
- Do not modify start_of_day folders

## Acceptance
- Only one canonical palette schema exists: `tools/schemas/tools/palette-browser.schema.json`
- `tools/schemas/palette.schema*` files are deleted/removed
- `palette-browser.schema.json` contains the real strict palette payload schema
- Tools validate against tool-specific schemas directly, not broad sample wrapper schema
- `sample.tool-payload.schema.json` is removed, demoted, or narrowed so it cannot accept extra wrapper data
- `config` is renamed to a clearer schema field consistently
- `gameId` is replaced/supplemented with a generic identifier suitable for samples and games
