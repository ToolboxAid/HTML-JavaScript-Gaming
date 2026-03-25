# Tests

Node-safe suite covering engine behavior, guardrails, and shipped game entry points.

## Run

```bash
npm test
```

## Current Coverage Themes (81/81 passing as of 03/25/2026)
- core timing, scene lifecycle, fullscreen composition, and metrics
- input, events, entity/world orchestration
- persistence, serialization, FX determinism
- production/import guardrails for engine barrels
- game boots and hardening flows (Asteroids plus AI track entry points)
