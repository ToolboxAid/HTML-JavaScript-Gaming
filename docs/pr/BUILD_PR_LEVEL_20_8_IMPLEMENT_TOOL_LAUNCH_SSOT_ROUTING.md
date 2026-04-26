# BUILD_PR_LEVEL_20_8_IMPLEMENT_TOOL_LAUNCH_SSOT_ROUTING

## Purpose

Implement the first runtime slice of the launch SSoT contract created in `docs/dev/specs/TOOL_LAUNCH_SSOT.md`.

## Scope

One PR purpose only:

- route sample-launched tools through explicit `tools/<tool>/index.html` targets
- route game-launched workspace flows through `tools/Workspace Manager/index.html`
- clear launch memory for external launches from samples or games
- remove default/fallback launch behavior only where touched by this launch path

## Required Source of Truth

Codex must use:

- `docs/dev/specs/TOOL_LAUNCH_SSOT.md`
- existing launch metadata/config files already present in the repo

Codex must not invent a second source of truth.

## Hard Constraints

Codex must NOT:

- rewrite unrelated tools
- rewrite unrelated games
- rewrite unrelated samples
- change route names unless required by the SSoT
- introduce default tool fallback
- introduce default workspace fallback
- silently redirect missing launch context
- preserve stale memory on external launches
- add managers/factories/service layers unless already part of the existing pattern
- modify `start_of_day`
- rewrite roadmap text except status markers

## Anti-Pattern Guards

Do not introduce:

- alias variables
- pass-through variables
- duplicate state
- stored derived state
- vague names
- magic route strings outside the SSoT path
- duplicate event listeners
- broad truthy/falsy checks that change behavior
- hidden fallback behavior

## Implementation Target

Codex must inspect the existing files and apply the smallest valid change.

Likely files include, only if needed:

- `samples/index.html`
- sample metadata / launch metadata files
- `games/index.html`
- game metadata / workspace metadata files
- `tools/Workspace Manager/index.html`
- existing shared launch helpers

Codex must not scan or rewrite the whole repo.

## Required Validation

Codex must document validation in:

- `docs/dev/reports/tool_launch_ssot_routing_validation.md`

Validation must include:

- sample tile launches resolve to explicit `tools/<tool>/index.html`
- game tile launches resolve to `tools/Workspace Manager/index.html`
- external launch memory is cleared before loading
- missing launch data fails visibly
- no default/fallback path remains in touched launch flow
- no anti-patterns introduced in touched files

## Acceptance

- Runtime launch behavior follows `TOOL_LAUNCH_SSOT.md`.
- SSoT remains the authority.
- UAT path from `games/index.html` to Workspace Manager works.
- UAT path from `samples/index.html` to tool index works.
- No unrelated implementation changes.
