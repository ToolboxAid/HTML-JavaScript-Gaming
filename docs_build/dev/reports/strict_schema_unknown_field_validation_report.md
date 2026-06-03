# PR_26133_045 Strict Schema Unknown Field Validation Report

Task: PR_26133_045-object-preview-pan-direction-and-strict-schema-fix
Date: 2026-05-15

## Schema Changes

- `tools/schemas/game.manifest.schema.json` now sets `$defs.gameData.additionalProperties` to `false`.
- The former dedicated `not` branch for `objectVectorRuntime` was removed because `gameData` now allows only explicit properties.
- `objectVectorRuntime` was not added back to the schema or the Asteroids manifest.
- `tools/schemas/workspace.manifest.schema.json` already rejects unknown root and `tools` map fields with `additionalProperties: false`.

## Validation Proof

The Workspace Manager V2 schema service was run against the current Asteroids manifest and targeted invalid clones.

```text
valid Asteroids game manifest: ok true
valid Asteroids workspace manifest: ok true
injected game.gameData.objectVectorRuntime: ok false
message: root.game.gameData.objectVectorRuntime is not allowed
injected game.gameData.debugUnknown: ok false
message: root.game.gameData.debugUnknown is not allowed
injected workspace root debugUnknown: ok false
message: root.debugUnknown is not allowed
```

## Command

```text
node --input-type=module - < inline WorkspaceManagerV2ContextService schema validation script
```

The same rejection paths are also asserted in `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` and covered by `npm run test:workspace-v2`.
