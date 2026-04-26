# BUILD_PR: Schema location correction

## Codex task
Move the schema contract plan from root-level schema files to `tools/schemas/`.

## Required changes
1. Remove any planned or newly-added root-level `*.schema.json` files.
2. Add schema contracts under `tools/schemas/` only.
3. Put reusable manifest schemas directly under `tools/schemas/`.
4. Put individual tool payload schemas under `tools/schemas/tools/`.
5. Update any docs or references to point to the new schema paths.

## Do not
- Do not write broad validation utilities as the primary deliverable.
- Do not change sample payloads.
- Do not unlock or mutate samples.
- Do not create schema files at repository root.
- Do not modify start_of_day folders.

## Validation command
Search for misplaced schemas:

```powershell
Get-ChildItem -Path . -Filter *.schema.json -Recurse | Select-Object FullName
```

Expected result: all schema files are under `tools\schemas\`.
