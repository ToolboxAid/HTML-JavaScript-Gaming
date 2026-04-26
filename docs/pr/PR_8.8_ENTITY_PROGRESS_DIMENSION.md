# PR 8.8 — Entity Progress Dimension (phase vs level)

## Purpose
Support different progression dimensions per entity type:
- Samples → phase
- Games → level

## Change

### workspace.schema.json

Add optional progression fields with type constraint:

```json
{
  "phase": { "type": "string" },
  "level": { "type": "string" }
}
```

### Rules

- If type == "sample":
  - phase REQUIRED
  - level MUST NOT exist

- If type == "game":
  - level REQUIRED
  - phase MUST NOT exist

- Other types:
  - neither required unless defined later

## Enforcement (schema intent)
- Use conditional validation (`if/then`)
- Disallow invalid combinations

## Example

Sample:
```json
{
  "id": "0305",
  "type": "sample",
  "phase": "03",
  "tool": "vector-map-editor"
}
```

Game:
```json
{
  "id": "game-001",
  "type": "game",
  "level": "1",
  "tool": "engine-runtime"
}
```

## Non-Goals
- no runtime logic
- no validators

## Acceptance
- samples require phase
- games require level
- no mixed usage allowed
