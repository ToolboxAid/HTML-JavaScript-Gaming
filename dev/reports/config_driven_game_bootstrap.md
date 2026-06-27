# Config Driven Game Bootstrap

PR: PR_26152_167-config-driven-game-bootstrap
Date: 2026-06-02

## Scope

- Defined config-driven game bootstrap architecture.
- Defined Manifest -> Runtime flow.
- Defined ProjectWorkspace -> Manifest flow.
- Defined Tool output -> Manifest flow.
- Eliminated user-code assumptions.
- Added no runtime implementation.

## Bootstrap Principle

A first-pass config-driven game should be able to boot from validated manifest data without requiring user-authored gameplay JavaScript. Runtime code still exists in `src/engine`; authored game behavior is expressed as manifest objects, rules, assets, and input bindings.

## Manifest -> Runtime Flow

1. Runtime receives explicit `game.manifest.json` path or payload.
2. Runtime parses and validates the manifest envelope.
3. Runtime validates object type declarations and rule registry records.
4. Runtime resolves asset, geometry, palette, and input bindings from manifest data.
5. Runtime creates engine objects and components.
6. Runtime attaches rules and starts the engine only after validation passes.
7. Runtime logs actionable failure details and does not render partially if validation fails.

## ProjectWorkspace -> Manifest Flow

ProjectWorkspace may select a project, active manifest, active tool, active Tool State, and active palette context. It may launch tools or pass explicit manifest references into validation. It must not store gameplay objects, rules, active score, entity state, health, cooldowns, or hidden bootstrap data.

Expected flow:

1. User selects project and manifest from ProjectWorkspace.
2. ProjectWorkspace passes explicit manifest reference to the runtime/tool surface.
3. Runtime/tool validates the manifest and Tool State payloads independently.
4. Runtime/tool reports failures visibly and does not infer missing payloads from samples or storage.

## Tool Output -> Manifest Flow

Tool outputs remain authored data. Tool State owns saved editing payloads. Game Manifest owns portable game export/import structure. A publish/export path may promote selected Tool State outputs into manifest-owned records, but ProjectWorkspace does not become the persisted owner.

Expected flow:

1. Tool saves Tool State payload.
2. Project export/publish selects Tool State outputs for manifest inclusion.
3. Manifest stores only approved portable fields and path/file references.
4. Runtime consumes the validated manifest, not hidden tool runtime state.

## Eliminated User-Code Assumptions

- No game-specific JavaScript is required for baseline object creation.
- No game-specific JavaScript is required for baseline rule execution.
- No user code is required for assets, input, object types, or rule binding.
- Advanced custom code may exist later, but it must be optional and explicitly declared.
- Runtime helpers must not use silent defaults when manifest-required values are missing.

## Required Bootstrap Capabilities

- manifest validation before render
- object/rule validation before object creation
- asset binding before engine start
- no hidden defaults
- no sample fallback data
- no ProjectWorkspace persistence assumptions
- diagnostics that identify source path, manifest section, object id, rule id, and failure reason

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - documentation/static bootstrap architecture.
- integration - documentation/static ProjectWorkspace handoff boundary review.
- contract - documentation/static manifest and Tool State ownership review.

## Lanes Skipped

- runtime - no runtime behavior changed.
- samples - permanently out of scope.
- recovery/UAT - no recovery behavior changed.
- Playwright - not impacted.

## Samples Decision

SKIP. Samples are permanently out of scope.

## Playwright

Playwright impacted: No. This PR is docs/report-only.

## Blocker Scope

No blocker for the bootstrap report. Runtime implementation is blocked until the manifest object/rule schema and loader validation lane exists.
