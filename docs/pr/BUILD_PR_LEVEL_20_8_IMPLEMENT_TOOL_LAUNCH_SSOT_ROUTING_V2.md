# BUILD_PR_LEVEL_20_8_IMPLEMENT_TOOL_LAUNCH_SSOT_ROUTING_V2

## Purpose

Implement the first runtime slice of the launch SSoT contract with exact UI launch wording:

- sample-launched tools use `Open <tool>`
- game-launched Workspace Manager flows use `Open with Workspace Manager`

## Scope

One PR purpose only:

- route sample-launched tools through explicit `tools/<tool>/index.html` targets via `Open <tool>`
- route game-launched workspace flows through `tools/Workspace Manager/index.html` via `Open with Workspace Manager`
- clear launch memory for external launches from samples or games
- remove default/fallback launch behavior only where touched by this launch path

## Required Source of Truth

Codex must use:

- `docs/dev/specs/TOOL_LAUNCH_SSOT.md`
- existing launch metadata/config files already present in the repo

Codex must not invent a second source of truth.

## Required UI Contract

### Samples UI

Samples must expose tool launch actions as:

```text
Open <tool>
```

Examples:

```text
Open Vector Map Editor
Open Vector Asset Studio
Open Tilemap Studio
```

Samples must not use `Open with Workspace Manager` for sample-to-tool launch actions.

### Games UI

Games must expose Workspace Manager launch actions as:

```text
Open with Workspace Manager
```

Games must not use `Open <tool>` for game-to-workspace launch actions.

## Hard Constraints

Codex must NOT:

- rewrite unrelated tools
- rewrite unrelated games
- rewrite unrelated samples
- change route names unless required by the SSoT
- change the required launch labels
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

## Required Validation

Codex must document validation in:

- `docs/dev/reports/tool_launch_ssot_routing_validation.md`

Validation must include:

- sample tile/action labels use `Open <tool>`
- sample tile/action launches resolve to explicit `tools/<tool>/index.html`
- game tile/action labels use `Open with Workspace Manager`
- game tile/action launches resolve to `tools/Workspace Manager/index.html`
- external launch memory is cleared before loading
- missing launch data fails visibly
- no default/fallback path remains in touched launch flow
- no anti-patterns introduced in touched files

## Acceptance

- Runtime launch behavior follows `TOOL_LAUNCH_SSOT.md`.
- Sample launch UI uses `Open <tool>`.
- Game launch UI uses `Open with Workspace Manager`.
- SSoT remains the authority.
- UAT path from `games/index.html` to Workspace Manager works.
- UAT path from `samples/index.html` to tool index works.
- No unrelated implementation changes.
