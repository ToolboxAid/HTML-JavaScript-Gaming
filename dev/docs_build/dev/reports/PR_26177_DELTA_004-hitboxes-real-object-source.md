# PR_26177_DELTA_004-hitboxes-real-object-source

Team: Delta
Branch: PR_26177_DELTA_004-hitboxes-real-object-source
Base: PR_26177_DELTA_003-hitboxes-engine-collision-contract
Scope: Hitboxes real Object source selection only

## Summary

Hitboxes now loads real Objects from the Objects Local API/service contract and filters the source list to Objects with assigned visual asset metadata. Selecting an eligible Object loads it as Object A and renders creator-facing preview, bounding box, origin, and metadata panels.

## Changed Files Summary

- `toolbox/hitboxes/index.html`: replaced foundation-only messaging with Object A source selection, preview, and metadata panels.
- `assets/toolbox/hitboxes/js/index.js`: reads Objects via `createServerRepositoryClient("objects")`, filters eligible visual-backed Objects, and renders selection/preview state.
- `tests/playwright/tools/HitboxesTool.spec.mjs`: adds targeted creator-facing Object selection coverage.
- `docs_build/dev/reports/*`: required PR reports and Codex review artifacts.

## Scope Guard

- No hitbox drawing or editing added.
- No Object B support added.
- No browser-owned product data added.
- No fake standalone Object source data added.
- No unrelated tools changed.
- No `start_of_day` files changed.
