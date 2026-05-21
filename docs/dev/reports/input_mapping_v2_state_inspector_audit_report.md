# PR_26140_086 Input Mapping V2 and State Inspector Audit Report

## Summary

- Added generic `Input Mapping V2` for keyboard and gamepad action mapping across games, tools, and samples.
- Registered Input Mapping V2 in the tool registry, Tools index utility group, and Workspace Manager V2 launch surface.
- Added Input Mapping V2 README, how-to, and UAT documentation entries.
- Removed the planned "Input Mapper / Controller Tester" card because the V2 tool is now active.
- Preserved State Inspector after audit because Storage Inspector V2 does not fully replace its host/runtime state inspection behavior.

## Input Mapping V2

- Tool id: `input-mapping-v2`.
- Tool name: `Input Mapping V2`.
- Scope is generic, not game-specific.
- Supports keyboard capture, gamepad button/axis capture, device refresh, current mapping list, generated mapping JSON, status logging, and Workspace Manager return navigation.
- Workspace Manager hydrates it as a selected-game-purpose launch context without adding a schema payload contract.

## State Inspector Audit

Storage Inspector V2 covers current-origin storage inspection and cleanup, including normalized Workspace/toolState data and dirty views. It does not cover all State Inspector behavior.

State Inspector still has unique active behavior:

- Reads host context from tool launch URL context.
- Reads active project manifest state through `ACTIVE_PROJECT_STORAGE_KEY`.
- Inspects selected `toolboxaid.*` local/session storage snapshots rather than broad storage cleanup.
- Reads `globalThis.__TOOLS_BOOT_CONTRACT_REGISTRY__` keys for boot contract visibility.
- Supports routed viewer payload inspection via `toolboxaid.viewerPayload.<id>`.
- Supports manual JSON payload inspection and snapshot creation through `createStateInspectorSnapshot`.

Conclusion: Storage Inspector V2 does not fully replace State Inspector. State Inspector launch/registry/docs references were intentionally left active.

## Validation

- Targeted syntax/import validation passed with `node --check` for changed runtime/test JavaScript files.
- Targeted Playwright validation passed for Tools index, Input Mapping V2 standalone launch, and Workspace Manager launch/return wiring: 3 passed.
- `npm run test:workspace-v2` passed: 60 passed.
- Storage Inspector V2 remains visible and launchable in Workspace Manager validation.
- State Inspector was not removed because the audit found unique non-storage runtime state inspection behavior.

## Scope Controls

- No schema files changed.
- No sample JSON changed.
- Runtime behavior outside tool registration/launch wiring was preserved.
