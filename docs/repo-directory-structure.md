# Repository Directory Structure

## High-Level Layout

```text
/
├─ README.md
├─ package.json
├─ index.html
├─ docs/
├─ engine/
├─ games/
├─ samples/
├─ scripts/
├─ tests/
├─ tools/
└─ tmp/
```

## Folder Notes
- `docs/`
  Durable repo-facing docs only. Architecture, standards, decisions, getting-started, and the generated sample manifest live here.

- `engine/`
  Shared engine source. `engine/core/Engine.js` is the canonical direct boot import. Public subsystem APIs should generally be consumed through `engine/*/index.js`.

- `games/`
  Shipped games. The current game catalog contains `Asteroids/` plus the launcher page.

- `samples/`
  Large numbered sample catalog and `_shared/` sample-owned infrastructure.

- `scripts/`
  Test and manifest generation automation.

- `tests/`
  Node-safe tests for engine behavior, guardrails, and Asteroids validation.

- `tools/`
  Utility projects and repo support tools.

- `tmp/`
  Temporary local workspace artifacts.
