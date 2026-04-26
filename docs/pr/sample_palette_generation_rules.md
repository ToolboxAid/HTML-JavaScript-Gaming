# Sample Palette Generation Rules

## Source of Truth
Use the existing sample files and `workspace.manifest` to determine sample ownership and valid sample paths.

## Palette Discovery
For each sample folder:
1. Inspect existing sample JSON files.
2. Inspect local sample asset metadata if present.
3. Extract explicit color values.
4. Generate a palette document only when colors are found or required by manifest.

## Output Naming
Use the repo's existing sample naming convention. If no convention exists, write:

`sample.palette.json`

inside the sample folder.

## Schema
Every generated palette document must include:

```json
"$schema": "../../../tools/schemas/palette.schema.json"
```

Adjust relative path depth if needed for the actual sample folder.

## Do Not
- Do not create `config.json`.
- Do not create fake colors.
- Do not modify runtime files.
- Do not add validators.
- Do not touch `start_of_day`.
