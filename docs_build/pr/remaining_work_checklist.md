# Remaining Work Checklist

## First-Class Tool Coverage
- [x] Create canonical list of 17 first-class tools.
- [x] Verify each tool folder exists.
- [ ] Verify each tool has exactly one schema. (Current status: 16/17; missing `skin-editor` schema.)
- [ ] Verify each schema path follows `tools/schemas/tools/<tool>.schema.json`. (Blocked by missing `tools/schemas/tools/skin-editor.schema.json`.)

## Sample Payload Cleanup
- [ ] Verify all sample tool files use `sample.<id>.<tool>.json`.
- [ ] Verify no old `sample-<id>-<tool>.json` payload files remain except intentional `*-document.json`.
- [ ] Verify each sample tool file has `$schema`, `tool`, `version`, and `config`.
- [ ] Verify no sample tool payload embeds palette data.

## Palette/Data Cleanup
- [ ] Verify palette files are named `sample.<id>.palette.json`.
- [ ] Verify palette files use `swatches`.
- [ ] Verify each swatch has single-character `symbol`.
- [ ] Verify locked/source metadata lives in palette JSON only.

## Workspace/Game Alignment
- [ ] Verify workspace/game `tools[]` entries match sample tool payload shape.
- [ ] Verify workspace schema does not contain sample-only fields.
- [ ] Verify sample concepts do not leak into workspace schema.

## Docs
- [ ] Document launcher pairing contract.
- [ ] Document samples as one-off tool launch files.
- [ ] Document games/workspaces as manifest-owned collections.
