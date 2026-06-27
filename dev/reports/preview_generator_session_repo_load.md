# PR_26128_011 Preview Generator Session Repo Load

## Summary
Preview Generator V2 now resolves Workspace Manager V2 repo/game context from session storage during workspace launch instead of requiring a second repo picker action.

## Changes
- Preview Generator V2 reads `workspace.repo.reference` from `sessionStorage`.
- Preview Generator V2 reads its per-tool launch state from `workspace.tools.preview-generator-v2.state`.
- Generate Image remains disabled until:
  - the workspace manifest from `hostContextId` is valid,
  - `workspace.repo.reference` is present and valid,
  - `workspace.tools.preview-generator-v2.state` matches the active game context,
  - the manifest preview source validates.
- Workspace launches set the base URL to the current origin so generation can run without manual Preview Generator repo setup.
- A session-backed repo handle is created from the validated session reference for Preview Generator V2 writes.
- Missing or invalid repo session data logs visible actionable failures and keeps Generate Image disabled.

## Integration Boundary
- No direct cross-tool communication was added.
- No hidden fallback repo picker behavior was added.
- Session storage remains the integration boundary.
- The repo reference is validated before Preview Generator V2 enables generation.

## Validation
- `npm run test:workspace-v2`: PASS, 13 tests passed.
- Verified `workspace.repo.reference` is present after Workspace Manager V2 repo selection.
- Verified Preview Generator V2 reads repo context from session storage.
- Verified Preview Generator V2 does not require independent repo selection on workspace launch.
- Verified Generate Image remains disabled for missing/invalid repo session state.
- Verified Generate Image enables after valid repo/game session hydration.
- Verified an Asteroids preview image is generated from workspace launch and written through the session-backed repo handle.

## Skipped
Full samples smoke test was skipped as requested. This PR is scoped to Workspace Manager V2 to Preview Generator V2 session repo hydration; the targeted Workspace Manager V2 suite exercises the affected launch, hydration, failure, and generation paths.
