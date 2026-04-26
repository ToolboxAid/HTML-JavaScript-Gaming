# BUILD_PR_LEVEL_20_9_TOOL_LAUNCH_SSOT_DATA_LAYER

## Purpose

Create the runtime Single Source of Truth data layer for tool/workspace launch targets after the 20_8 routing implementation.

This PR turns the documented launch rules into one authoritative launch metadata source.

## Scope

One PR purpose only:

- create or normalize one launch SSoT data source for tool/workspace launch targets
- ensure sample launch UI reads tool launch paths from the SSoT
- ensure game launch UI reads Workspace Manager launch path from the SSoT
- remove duplicated launch-path constants only where replaced by the SSoT
- preserve exact launch labels:
  - samples: `Open <tool>`
  - games: `Open with Workspace Manager`

## Required Behavior

### Samples

Samples must launch tools through explicit SSoT target paths:

```text
tools/<tool>/index.html
```

Sample launch actions must remain:

```text
Open <tool>
```

### Games

Games must launch Workspace Manager through the SSoT target path:

```text
tools/Workspace Manager/index.html
```

Game launch actions must remain:

```text
Open with Workspace Manager
```

### Memory

External launches from samples or games must clear launch memory before loading the target.

This PR must preserve the 20_8 memory-clear behavior and must not introduce fallback memory reuse.

## SSoT Requirements

The launch SSoT must define, at minimum:

- launch id
- display name
- target path
- allowed launch sources
- allowed launch types

Allowed launch sources:

- samples
- games
- tools
- workspace
- internal

Allowed launch types:

- sample-to-tool
- game-to-workspace
- tool-internal
- workspace-internal

## No Default / No Fallback

Codex must remove or avoid duplicated default/fallback launch behavior in touched files.

Forbidden:

- default tool
- default workspace
- fallback route
- fallback launch mode
- silent redirect
- first-item selection
- old-memory selection
- label-text guessing
- DOM-order guessing

Missing or invalid SSoT data must fail visibly.

## Hard Constraints

Codex must NOT:

- rewrite unrelated tools
- rewrite unrelated games
- rewrite unrelated samples
- change required UI labels
- introduce a second SSoT
- create broad routing abstractions
- create managers/factories/service layers unless already used by existing launch code
- modify `start_of_day`
- rewrite roadmap text except status markers
- perform broad cleanup

## Anti-Pattern Guards

Do not introduce:

- alias variables
- pass-through variables
- duplicate state
- stored derived state
- vague names
- magic route strings outside the SSoT
- duplicate event listeners
- hidden fallback behavior
- broad truthy/falsy checks that change behavior

## Required Validation

Codex must create:

- `docs/dev/reports/tool_launch_ssot_data_layer_validation.md`

Validation must include:

- exact SSoT file path
- changed files
- list of launch ids
- proof sample actions still show `Open <tool>`
- proof game actions still show `Open with Workspace Manager`
- proof sample paths come from SSoT
- proof game Workspace Manager path comes from SSoT
- proof external launch memory clear still works
- proof missing SSoT target fails visibly
- anti-pattern self-check

## Acceptance

- One launch SSoT exists.
- Touched sample launch paths read from SSoT.
- Touched game Workspace Manager launch path reads from SSoT.
- Required labels are preserved.
- No default/fallback behavior exists in touched launch path.
- Validation report exists.
