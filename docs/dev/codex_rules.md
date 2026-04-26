# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

Codex must prefer the existing repo pattern over any new pattern, unless the PR explicitly says otherwise.

## Required Spec

Read and obey:

- docs/dev/specs/TOOL_LAUNCH_SSOT.md

## This PR

Allowed:
- smallest implementation changes needed for launch routing SSoT
- validation report
- roadmap status marker update only if execution-backed

Forbidden:
- broad cleanup
- unrelated refactoring
- new route systems
- fallback/default behavior
- implementation outside touched launch path
- start_of_day changes
- roadmap text rewrite

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
- magic strings or magic numbers outside existing SSoT/config pattern
- duplicate event listeners
- globals
- new managers/factories/service layers unless already required by existing pattern
- public API changes unless required by this PR
- scope expansion

## Required Failure Behavior

If launch context is missing or invalid:
- fail visibly
- report the missing field
- do not guess
- do not select the first item
- do not reuse memory
- do not silently redirect
