# PR_26152_266 Engine V2 Custom Extensions Hook Runtime

## Scope

- Renamed the user-facing Code Studio concept to Custom Extensions.
- Added Engine V2 Custom Extensions hook registration and dispatch context runtime.
- Kept internal `code-studio` paths, asset names, and technical contract names unchanged.
- No Marketplace, Publishing, Toolbox rebuild, or sample work.

## Runtime

- Supported hook names:
  - `onProjectLoad`
  - `onSceneStart`
  - `onTick`
  - `onCollision`
  - `onTrigger`
  - `onAction`
  - `onSceneEnd`

- Custom Extensions must use `extensionMode: "enhance"`.
- Replace-mode extensions reject visibly.
- Hook registrations reject forbidden executable/source fields.
- Hook registrations reject forbidden capabilities:
  - `window`
  - `document`
  - `localStorage`
  - `sessionStorage`
  - `network`
  - `filesystem`
  - `engineInternals`
  - `eval`
  - `newFunction`
  - `globalMutation`

## Privacy And Publish Boundary

- Approved Custom Extensions may remain publish eligible.
- Unapproved Custom Extensions are marked creator-private.
- Any unapproved Custom Extension blocks publish eligibility.

## Files

- `src/engine/runtime/engineV2CustomExtensionsHookRuntime.js`
- `tests/engine/EngineV2CustomExtensionsHookRuntime.test.mjs`
- `toolbox/code-studio.html`
- `toolbox/tools-page-accordions.js`
- `GameFoundryStudio/assets/js/tools-page-accordions.js`
- `GameFoundryStudio/assets/partials/header-nav.html`

## Validation

- PASS: `node tests/engine/EngineV2CustomExtensionsHookRuntime.test.mjs`

## Notes

- The runtime does not use `eval`.
- The runtime does not use `new Function`.
- Dispatch creates limited hook contexts only; it does not expose forbidden globals or engine internals.
