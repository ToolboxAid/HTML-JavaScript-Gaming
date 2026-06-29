# Validation Report - PR_26180_OWNER_022-resolve-remaining-src-dependencies

## Commands

```text
git diff --check
npm run validate:canonical-structure
node --check www/toolbox/toolRegistry.js
node --input-type=module -e "const m=await import('./www/toolbox/toolRegistry.js'); console.log(m.getToolRegistrySnapshot().tools.length);"
node ./dev/tests/shared/ProjectDataStoreContract.test.mjs
node ./dev/tests/dev-runtime/ArchitectureCleanupApiNavInvitations.test.mjs
node ./dev/tests/tools/ToolManifestBoundary.test.mjs
```

## Targeted Scans

- `git ls-files -- src` count before/after
- active references to `src/shared/projectDataStore/inMemoryProjectDataStore.js`
- active references to root `src/shared/number/numbers.js`
- `toolId: "*-v2"` files under `src`
- active imports of matching `-v2` contract files
- active references to `game.manifest.schema.json` and `sample.tool-payload.schema.json`

## Results

- `git diff --check`: PASS
- `npm run validate:canonical-structure`: PASS
- `node --check www/toolbox/toolRegistry.js`: PASS
- Browser registry import smoke: PASS, returned 47 tools
- `ProjectDataStoreContract.test.mjs`: PASS
- `ArchitectureCleanupApiNavInvitations.test.mjs`: PASS
- `ToolManifestBoundary.test.mjs`: PASS
- Root `src` count: 65 before, 64 after
- In-memory store scan: PASS, no active references remain
- Root number helper scan: PASS, root file absent; active references use `www/src/shared/number/numbers.js`
- `-v2` contract scan: PASS, active test references documented and preserved
- Manifest/sample schema scan: PASS, active validation references documented and preserved

## Result

PASS
