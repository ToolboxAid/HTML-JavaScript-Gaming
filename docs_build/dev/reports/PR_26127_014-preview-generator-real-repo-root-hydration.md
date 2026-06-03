# PR_26127_014-preview-generator-real-repo-root-hydration

## Summary
- Updated Preview Generator V2 status header order from `Status Clear +` to `Status + Clear`.
- Hydrated Preview Generator V2 workspace launches with a real absolute filesystem `repoRoot` resolved by Workspace Manager V2.
- Direct workspace preview generation now combines `repoRoot` with the manifest-relative generated preview target, logs the resolved paths, and writes to the validated absolute output path.
- Display-only/non-absolute `repoRoot` values now fail workspace launch hydration, keep Generate Preview disabled, and do not silently fall back.

## Repo Root Hydration Notes
- Workspace Manager V2 resolves an absolute repo root for Preview Generator V2 launch context only.
- Existing workspace manifests remain manifest-relative for `gameRoot`, `assetsPath`, and asset paths.
- The Playwright repo server exposes the current absolute repo root for launch hydration and validates preview writes stay inside that repo root.

## Direct Write Notes
- Hydrated Asteroids launch resolves the generated preview target as `games/Asteroids/assets/images/preview.svg`.
- Preview Generator V2 logs:
  - resolved `repoRoot`
  - resolved absolute preview output path
  - direct write target
  - direct write success or failure
- If the launch context has `repoRoot: "HTML-JavaScript-Gaming"` or any other non-absolute display value, direct write remains disabled.

## UI Notes
- Preview Generator V2 status header now renders as `Status + Clear`.
- The pre-generation preview image can still display the manifest-selected preview source such as `preview.png`; direct generation writes to the generated `preview.svg` target.

## Validation
- `npm run test:workspace-v2`
- Result: PASS, 10 tests passed.
- Validated Asteroids Preview Generator V2 workspace launch, absolute repo root hydration, direct write to `games/Asteroids/assets/images/preview.svg`, status path logging, and blocked non-absolute repoRoot handling.

## Out Of Scope
- Deprecated `toolbox/workspace-v2` was not modified.
- Sample JSON was not modified.
- Full samples smoke test was skipped because this PR is Preview Generator repo hydration scoped.
