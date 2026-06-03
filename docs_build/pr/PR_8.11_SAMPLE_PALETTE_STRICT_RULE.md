# PR 8.11 — Sample Palette Strict Rule

## Purpose
Tighten sample palette handling after the multi-file tool payload refactor.

Samples now use one tool payload per file:

`sample.<id>.<tool>.json`

Palette handling must be explicit and deterministic.

## Current Repo Reality
- Sample tool payload files are manifest-style:
  - `$schema`
  - `tool`
  - `version`
  - `config`
- Palette files are separate:
  - `sample.palette.json`
- Runtime/docs references to old sample paths were intentionally not edited in the prior PR.

## Required Rule

If a sample uses colors, that sample folder MUST contain exactly one:

`sample.palette.json`

## Required Linkage

Each `sample.<id>.<tool>.json` file in that sample folder MUST reference the palette when the palette exists.

Use this field:

```json
{
  "palette": "./sample.palette.json"
}
```

## Payload Shape

Sample tool payload files may contain:

```json
{
  "$schema": "../../../tools/schemas/tools/<tool>.schema.json",
  "tool": "<tool>",
  "version": 1,
  "palette": "./sample.palette.json",
  "config": {}
}
```

## Rules
- One palette per sample folder.
- Palette file name must be exactly `sample.palette.json`.
- Palette must use `swatches`, not `entries`.
- Each swatch must use a single-character `symbol`.
- Each swatch must use uppercase `hex`.
- If `sample.palette.json` exists, every tool payload file in that folder must reference it.
- If no colors exist in the sample, do not create a palette.

## Forbidden
- Do not embed palette swatches inside tool payload files.
- Do not create multiple palette files in one sample folder.
- Do not use `entries`.
- Do not use multi-character symbols like `s001`.
- Do not add validators.
- Do not modify runtime logic.
- Do not modify `start_of_day`.

## Acceptance
- Every colored sample has exactly one `sample.palette.json`.
- Every sample folder with `sample.palette.json` has all `sample.<id>.<tool>.json` files referencing `./sample.palette.json`.
- No sample folder has duplicate palette files.
- Palette schema remains `swatches` + single-character `symbol`.
