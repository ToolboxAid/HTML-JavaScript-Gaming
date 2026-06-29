# PR_26180_OWNER_019b-move-browser-shared-schemas-to-www Manual Validation Notes

- Confirmed moved files match PR019a audit `Active browser/runtime dependency` rows.
- Confirmed representative public schema URLs still resolve through the `www` web root:
  - `/src/shared/schemas/tools/object-vector-studio-v2.schema.json`
  - `/src/shared/schemas/tools/text2speech-V2.schema.json`
  - `/src/shared/schemas/tools/palette-browser.schema.json`
  - `/src/shared/contracts/replayContracts.js`
- Confirmed no API/server files were moved.
- Confirmed no protected developer workspace files were moved.
- Confirmed no product/UI/database implementation files changed.
