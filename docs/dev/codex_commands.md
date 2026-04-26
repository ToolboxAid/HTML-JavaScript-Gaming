MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 8.13 palette naming and deep reference cleanup.

STEPS:
1. Rename all sample palette files:
   - from sample.palette.json
   - to sample.<id>.palette.json
   where <id> matches the sample folder id.
2. Remove all sample.palette.json files after rename.
3. Update palette JSON $schema relative paths only if needed after rename.
4. Move lock/source metadata from tool payloads into the matching palette JSON:
   - paletteRef.source -> palette.source
   - paletteRef.id -> palette.sourceId
   - paletteRef.locked -> palette.locked
5. Remove palette-related fields from every sample tool payload file:
   - palette
   - paletteRef
   - assetRefs.paletteId
6. If assetRefs becomes empty after paletteId removal, remove assetRefs.
7. Specifically fix:
   - samples/phase-02/0207/sample.0208.sprite-editor.json
   and audit whether the 0208 file name in 0207 folder is a mismatch. Correct to sample.0207.sprite-editor.json if repo conventions confirm it.
8. Update tools/schemas/palette.schema.json to allow optional top-level:
   - sourceId
   - locked
9. Do NOT add runtime logic.
10. Do NOT add validators.
11. Do NOT modify start_of_day.

ACCEPTANCE:
- sample_tool_files_with_palette_key=0
- sample_tool_files_with_paletteRef_key=0
- sample_tool_files_with_paletteId_key=0
- sample.palette.json files remaining=0
- all palette files named sample.<id>.palette.json
- locked/sourceId live only in palette JSON
