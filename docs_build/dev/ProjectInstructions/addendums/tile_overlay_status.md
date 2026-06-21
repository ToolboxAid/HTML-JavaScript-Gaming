# Build Path Tile Overlay Status Governance

## Purpose

This addendum defines visual overlay status rules for Build Path tiles.

## Overlay Mapping

| Backlog Status | Meaning | Tile Overlay |
| --- | --- | --- |
| `[ ]` Planned | Planned | black overlay 70% |
| `[?]` Wireframe | Wireframe | black overlay 80% |
| `[.]` Building | Building | black overlay 90% |
| `[x]` Complete | Complete | 100% transparent / no visible overlay |
| `[!]` Blocked | Blocked | yellow overlay 80% |
| `[-]` Deprecated | Deprecated | red overlay 80% |

## Completion Denominator

Blocked items remain in the completion denominator.

Deprecated items are excluded from the completion denominator.

## Badge Text

Blocked and Deprecated tiles must show badge text.

Badge text must be visible enough for a creator to understand why the tile is blocked or deprecated without relying on color alone.

## Validation

PRs that change tile overlay behavior must document:
- status mapping affected
- badge text affected
- phase percentage denominator effect
- skipped UI validation, if any, with reason
