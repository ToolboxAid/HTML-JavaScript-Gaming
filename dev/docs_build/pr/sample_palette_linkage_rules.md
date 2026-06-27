# Sample Palette Linkage Rules

## Palette File
Use:

`sample.palette.json`

## Tool Payload Reference
Every tool payload file in the same folder must include:

```json
"palette": "./sample.palette.json"
```

when the palette file exists.

## No Palette Case
If the sample has no color data:
- no `sample.palette.json`
- no `palette` field required

## Audit Rules
For each sample folder:
1. Check for `sample.palette.json`.
2. If present, check every `sample.<id>.<tool>.json`.
3. Each tool payload must include `palette: "./sample.palette.json"`.
4. Ensure there are no other palette files in the folder.
