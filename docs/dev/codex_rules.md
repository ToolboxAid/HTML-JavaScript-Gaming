# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

Codex must prefer the existing repo pattern over any new pattern, unless the PR explicitly says otherwise.

## This PR

This PR is a validation and gate-lock PR.

Allowed:
- validation reports
- recovery roadmap status markers only
- blocked decision report if validation fails

Forbidden:
- implementation code changes
- broad cleanup
- unrelated refactoring
- new route systems
- second SSoT
- fallback/default behavior
- start_of_day changes
- roadmap text rewrite outside status markers
- changing required UI labels

## Required UI Labels

Samples:
- must use `Open <tool>`

Games:
- must use `Open with Workspace Manager`

## Required Launch Targets

Samples:
- must route tools to `tools/<tool>/index.html`

Games:
- must route Workspace Manager to `tools/Workspace Manager/index.html`

## Required Memory Behavior

External launches from samples or games:
- must clear launch memory before loading target
- must not reuse stale state
- must not fallback to old context

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
- magic strings outside SSoT/config pattern
- duplicate event listeners
- globals
- new managers/factories/service layers
- public API changes
- scope expansion

## Required Failure Behavior

If launch SSoT data is missing or invalid:
- fail visibly
- report the missing field
- do not guess
- do not select the first item
- do not reuse memory
- do not silently redirect
