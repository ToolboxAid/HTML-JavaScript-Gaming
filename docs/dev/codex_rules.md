# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

Codex must prefer the existing repo pattern over any new pattern, unless the PR explicitly says otherwise.

## Required Inputs

Read and obey:

- docs/dev/specs/TOOL_LAUNCH_SSOT.md
- docs/dev/reports/tool_launch_ssot_routing_validation.md
- docs/dev/reports/tool_launch_ssot_data_layer_validation.md

If required reports are missing:
- create blocked report
- stop without implementation changes

## Required UI Labels

Samples:
- keep `Open <tool>`
- do NOT use `Open with Workspace Manager`

Games:
- keep `Open with Workspace Manager`
- do NOT use `Open <tool>`

## This PR

Allowed:
- remove legacy launch fallback residue only in touched launch flow
- remove duplicated launch-path constants only when replaced by SSoT
- validation report
- roadmap status marker update only if execution-backed

Forbidden:
- broad cleanup
- unrelated refactoring
- second SSoT
- new route systems beyond existing SSoT
- fallback/default behavior
- implementation outside touched launch path
- start_of_day changes
- roadmap text rewrite
- changing required UI label semantics

## Anti-Patterns Forbidden

- variable aliasing
- pass-through variables
- duplicate state
- stored derived state
- vague names
- hidden fallback behavior
- duplicated launch paths
- silent redirects
- broad truthy/falsy behavior changes
- magic strings or magic numbers outside SSoT/config pattern
- duplicate event listeners
- globals
- new managers/factories/service layers unless already required by existing pattern
- public API changes unless required by this PR
- scope expansion
