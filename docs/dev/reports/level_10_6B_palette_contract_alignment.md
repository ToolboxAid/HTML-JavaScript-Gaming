# LEVEL 10.6B — Palette Contract Alignment

## PR Purpose
Close the largest standalone sample generic-failure cluster by removing palette contract drift between manifest payloads and tool palette JSON files.

## Scope
This PR is limited to palette payload contract alignment for standalone sample/tool stability.

## Problem
Palette-bearing samples fail because the palette object passed through the manifest does not match the shape used by tool palette JSON files.

Observed manifest shape:

```json
"palette-browser": {
  "schema": "html-js-gaming.tool.palette-browser",
  "version": 1,
  "name": "Palette Browser",
  "source": "manifest",
  "palette": {
    "schema": "html-js-gaming.palette",
    "version": 1,
    "name": "Asteroids Palette",
    "source": "singleton-merged-from-tool-palettes",
    "swatches": []
  }
}
```

Observed tool JSON shape:

```json
{
  "$schema": "../../../tools/schemas/palette.schema.json",
  "schema": "html-js-gaming.palette",
  "version": 1,
  "name": "Sample 0302 Palette",
  "source": "engine/paletteList",
  "swatches": []
}
```

The leading metadata and legacy `source` value cause standalone samples to look loaded while tool state/UI receives a mismatched contract.

## Canonical Runtime Palette Shape
Palette runtime payloads should use one canonical shape:

```json
{
  "schema": "html-js-gaming.palette",
  "version": 1,
  "name": "Asteroids Palette",
  "source": "manifest",
  "swatches": [
    {
      "symbol": "!",
      "hex": "#1CAC78",
      "name": "color-001"
    }
  ]
}
```

## Contract Rule

```text
sample -> manifest -> normalized input -> tool -> UI/state
```

For palette tools:

```text
payload.palette -> state.palette -> UI
```

The tool must not silently reshape, merge, inject fallback palettes, or auto-load hidden palette data.

## Codex Implementation Requirements
- Normalize palette-bearing sample/tool data to the canonical runtime palette shape.
- Remove `$schema` from runtime palette payloads where it creates tool/manifest mismatch.
- Remove legacy `source: engine/paletteList` runtime usage.
- Ensure Palette Browser consumes `payload.palette` directly.
- Ensure palette-dependent tools do not read `paletteList`, `colors`, or `data.palette` unless explicitly normalized before tool entry.
- Preserve explicit empty state behavior when no palette is provided.
- Do not introduce new features, schemas, tools, hardcoded asset paths, or fallback data.
- Update standalone data-flow test/report expectations only where they enforce the corrected contract.

## Expected Validation
```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

Expected direction:

```text
Generic failure signals detected: 0
```

If not zero, remaining failures should be non-palette path/event-stream issues and should be handled in the next PR.
