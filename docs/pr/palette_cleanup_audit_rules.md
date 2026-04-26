# Palette Cleanup Audit Rules

## Find Tool Payload Files
Match:

```text
samples/**/sample.*.*.json
```

Exclude:

```text
sample.*.palette.json
```

## Forbidden Keys in Tool Payload Files
Search recursively for:
- `palette`
- `paletteRef`
- `paletteId`

These must not appear anywhere inside tool payload files.

## assetRefs Rule
If `assetRefs` only contains palette references, remove `assetRefs`.

If `assetRefs` contains useful non-palette references, preserve it and remove only palette-related keys.

## Palette Naming Rule
Every sample palette file must be:

```text
sample.<folder-id>.palette.json
```

## Folder/File ID Rule
A sample file inside:

```text
samples/phase-02/0207/
```

should normally use:

```text
sample.0207.<tool>.json
sample.0207.palette.json
```

If a file is named `sample.0208.sprite-editor.json` inside folder `0207`, audit for mismatch and fix if it is not intentional.
