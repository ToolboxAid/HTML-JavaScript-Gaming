# PR_26127_015-preview-generator-repo-root-resolution-fix

## Summary
- Removed the Workspace Manager V2 pre-launch absolute repoRoot resolution fetch.
- Removed the `/__workspace-manager-v2/repo-root` test-server path so launch no longer depends on that endpoint.
- Workspace Manager V2 now passes the existing validated session/manifest context through to Preview Generator V2.
- Preview Generator V2 now hydrates workspace launch even when manifest `repoRoot` is only a display label.

## Repo Root Resolution Notes
- Display-only repo roots such as `HTML-JavaScript-Gaming` no longer block Preview Generator V2 from opening.
- Preview Generator V2 status distinguishes:
  - workspace launch hydrated
  - repoRoot display label available
  - absolute repoRoot missing
  - direct preview write unavailable until a real writable repo root is selected
- Generate Preview remains disabled when workspace launch has no absolute/writable repo root.
- No hidden fallback behavior was added.

## Launch Behavior Notes
- Workspace Manager V2 launch behavior is preserved for other tools.
- Preview Generator V2 still preserves manifest-relative paths such as `games/Asteroids/assets/images/preview.svg`.
- Direct write support remains available only when an absolute repoRoot is present and validated.

## Validation
- `npm run test:workspace-v2`
- Result: PASS, 10 tests passed.
- Validated Preview Generator V2 launches from Workspace Manager V2 with display-only repoRoot, shows actionable status, keeps Generate Preview disabled, and does not call `/__workspace-manager-v2/repo-root`.

## Out Of Scope
- Deprecated `toolbox/workspace-v2` was not modified.
- Sample JSON was not modified.
- Full samples smoke test was skipped because this PR is Preview Generator launch unblock scoped.
