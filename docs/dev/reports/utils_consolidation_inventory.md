# Utils Consolidation Inventory (Plan PR 11.74)

## Scope
- Compared `src/shared/utils/*` and `src/shared/utils/*` at folder, file, export, and method level.
- Analysis-only: no file moves, no import rewrites, no shims.

## Folder Summary
- Engine utils files: 6
- Shared utils files: 17
- Engine utils exports inventoried: 10
- Shared utils exports inventoried: 33
- Total exports inventoried (excluding barrel rows): 43

## Classification Totals
- shared-safe: 21
- engine-only: 6
- duplicate-move-to-shared: 3
- duplicate-keep-engine: 5
- needs-review: 10

## File-Level Notes
- `src/shared/utils/index.js` and `src/shared/utils/index.js` are barrel files; they should be consolidated after direct utility ownership is finalized.
- Engine math helpers (`clamp`, `distance`) are generic but currently duplicated by local helpers in other engine modules.
- `runtimeRegistryUtils` and `networkDebugUtils` are currently in shared utils but depend on runtime/debug contracts, so they are flagged as `engine-only` for destination planning.

## Export Inventory
| Folder | File | Export | Kind | Methods In File | Classification | Notes |
|---|---|---|---|---|---|---|
| engine/utils | src/shared/utils/fuzzyMatchScore.js | fuzzyMatchScore | named-export | fuzzyMatchScore | shared-safe | - |
| engine/utils | src/shared/utils/geometry.js | pointInRect | function | - | shared-safe | - |
| engine/utils | src/shared/utils/geometry.js | xyInRect | function | - | shared-safe | - |
| engine/utils | src/shared/utils/geometry.js | getCenteredRect | function | - | shared-safe | - |
| engine/utils | src/shared/utils/index.js | (barrel-reexports) | barrel | - | needs-review | Barrel file; consolidation sequencing should happen after direct utility moves. |
| engine/utils | src/shared/utils/invariant.js | invariant | function | - | shared-safe | - |
| engine/utils | src/shared/utils/math.js | clamp | function | - | duplicate-move-to-shared | Generic clamp; duplicate local clamp exists in engine debug layout. |
| engine/utils | src/shared/utils/math.js | distance | function | - | duplicate-move-to-shared | Distance helper duplicated by local implementations in network/AI modules. |
| engine/utils | src/shared/utils/math.js | wrap | function | - | shared-safe | - |
| engine/utils | src/shared/utils/math.js | randomRange | function | - | shared-safe | - |
| engine/utils | src/shared/utils/normalizeCommandText.js | normalizeCommandText | named-export | normalizeCommandText | needs-review | Hardcoded filler-token list may be command-domain specific. |
| shared/utils | src/shared/utils/arrayUtils.js | ensureArray | function | - | shared-safe | - |
| shared/utils | src/shared/utils/arrayUtils.js | asArray | function | - | duplicate-keep-engine | Name overlap with object/3D debug utility asArray variants. |
| shared/utils | src/shared/utils/arrayUtils.js | asStringArray | function | - | shared-safe | - |
| shared/utils | src/shared/utils/createNoopDevConsoleIntegration.js | createNoopDevConsoleIntegration | function | - | engine-only | - |
| shared/utils | src/shared/utils/debugConfigUtils.js | parseBooleanFlag | function | - | shared-safe | - |
| shared/utils | src/shared/utils/debugConfigUtils.js | normalizeDebugMode | function | - | shared-safe | - |
| shared/utils | src/shared/utils/debugConfigUtils.js | readStoredBoolean | function | - | needs-review | Touches localStorage/location query flags (browser environment concerns). |
| shared/utils | src/shared/utils/debugConfigUtils.js | writeStoredBoolean | function | - | needs-review | Touches localStorage/location query flags (browser environment concerns). |
| shared/utils | src/shared/utils/debugConfigUtils.js | isLocalDebugEnvironment | function | - | shared-safe | - |
| shared/utils | src/shared/utils/debugConfigUtils.js | resolveDebugConfig | function | - | needs-review | Touches localStorage/location query flags (browser environment concerns). |
| shared/utils | src/shared/utils/directionUtils.js | oppositeCardinalDirection | function | - | shared-safe | - |
| shared/utils | src/shared/utils/highScoreUtils.js | sanitizeScore | function | - | shared-safe | - |
| shared/utils | src/shared/utils/highScoreUtils.js | sanitizeInitials | function | - | shared-safe | - |
| shared/utils | src/shared/utils/highScoreUtils.js | sanitizeRow | function | - | shared-safe | - |
| shared/utils | src/shared/utils/highScoreUtils.js | sortRows | function | - | shared-safe | - |
| shared/utils | src/shared/utils/idUtils.js | * from ../id/idUtils.js | re-export-star | - | needs-review | - |
| shared/utils | src/shared/utils/index.js | (barrel-reexports) | barrel | - | needs-review | Barrel file; consolidation sequencing should happen after direct utility moves. |
| shared/utils | src/shared/utils/initialsEntryUtils.js | codeToLetter | function | - | shared-safe | - |
| shared/utils | src/shared/utils/jsonUtils.js | cloneJson | function | - | duplicate-move-to-shared | Duplicate cloneJson exists in engine debug inspectors shared utils. |
| shared/utils | src/shared/utils/networkDebugUtils.js | toNetworkSnapshot | function | toSafeKey | engine-only | Network-trace and command snapshot semantics are debug-runtime specific. |
| shared/utils | src/shared/utils/networkDebugUtils.js | getCommandSnapshot | function | toSafeKey | engine-only | Network-trace and command snapshot semantics are debug-runtime specific. |
| shared/utils | src/shared/utils/networkDebugUtils.js | commandLinesForTrace | function | toSafeKey | engine-only | Network-trace and command snapshot semantics are debug-runtime specific. |
| shared/utils | src/shared/utils/networkDebugUtils.js | sanitizeText | const | toSafeKey | duplicate-keep-engine | Network-trace and command snapshot semantics are debug-runtime specific. |
| shared/utils | src/shared/utils/networkDebugUtils.js | asNumber | re-export(../math/numberNormalization.js) | toSafeKey | engine-only | Network-trace and command snapshot semantics are debug-runtime specific. |
| shared/utils | src/shared/utils/numberUtils.js | * from ../number/numberUtils.js | re-export-star | - | needs-review | - |
| shared/utils | src/shared/utils/objectUtils.js | isObject | named-export | isObject|isPlainObject|asObject|asArray | shared-safe | - |
| shared/utils | src/shared/utils/objectUtils.js | isPlainObject | named-export | isObject|isPlainObject|asObject|asArray | duplicate-keep-engine | Similar helper names appear in engine debug/network modules. |
| shared/utils | src/shared/utils/objectUtils.js | asObject | named-export | isObject|isPlainObject|asObject|asArray | duplicate-keep-engine | Similar helper names appear in engine debug/network modules. |
| shared/utils | src/shared/utils/objectUtils.js | asArray | named-export | isObject|isPlainObject|asObject|asArray | duplicate-keep-engine | Similar helper names appear in engine debug/network modules. |
| shared/utils | src/shared/utils/runtimeRegistryUtils.js | getRuntimeAndRegistry | function | - | engine-only | Depends on console runtime/panel registry contract. |
| shared/utils | src/shared/utils/snapshotCloneUtils.js | cloneSnapshot | function | - | needs-review | - |
| shared/utils | src/shared/utils/stringUtils.js | * from ../string/stringHelpers.js | re-export-star | - | needs-review | - |
| shared/utils | src/shared/utils/stringifyValueUtils.js | stringifyValue | function | - | shared-safe | - |
| shared/utils | src/shared/utils/textWrapUtils.js | wrapTextByCharacterCount | function | - | shared-safe | - |

## Compact Next-PR Consolidation List
1. Move `clamp` and `distance` to `src/shared/math` (or `src/shared/utils`) and replace local duplicate implementations in engine debug/network/AI modules.
2. Consolidate `cloneJson` to a single shared export and remove engine debug duplicate helper.
3. Consolidate `asObject` / `asArray` / `isPlainObject` usage onto shared/object utils in debug + network modules.
4. Re-scope `runtimeRegistryUtils` and `networkDebugUtils` into engine/debug namespace (or split generic portions into shared and keep runtime-bound functions engine-only).
5. Review `normalizeCommandText` domain coupling; either move to shared/string command helpers or keep engine-local with explicit ownership note.
6. After direct-function moves, reduce barrel complexity in `src/shared/utils/index.js` and `src/shared/utils/index.js`.

## Guardrail Confirmation
- No runtime behavior changes.
- No file moves.
- No import rewrites.
- Full sample suite not run (analysis-only scope).
