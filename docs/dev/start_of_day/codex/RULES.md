# Codex Rules

## Role
Codex owns:
- implementation code
- scoped runtime file edits
- validation runs
- repo-structured code ZIP packaging

Codex does not own:
- broad replanning
- changing PR purpose
- rewriting roadmap text
- modifying start_of_day instructions
- making unrelated refactors

## Required Workflow
Follow:
`PLAN_PR -> BUILD_PR -> APPLY_PR`

Codex is normally used in the BUILD phase only.

## BUILD Execution Rule
Codex must treat the BUILD doc as the execution blueprint.
If the BUILD doc is weak, incomplete, contradictory, or lacks explicit target files, stop and report the problem instead of improvising.

## Low-Token Execution Rule
Default to the smallest valid implementation for the approved BUILD.
Do not:
- scan the full repo unless exact target files require it
- broaden scope to be helpful
- refactor outside target files
- chase speculative improvements

## ZIP Output Rule
Codex should always package code/output ZIP files under:
- `<project folder>/tmp/`

Codex must not stage or commit ZIP files from `<project folder>/tmp/`.

## Scope Rule
- one PR purpose only
- no unrelated edits
- no engine-core changes unless explicitly in scope
- preserve project-owned/sample-owned boundaries
- keep changed-file count minimal

## Roadmap Rule
For `docs/dev/roadmaps/*`:
only bracket-state changes are allowed.
Do not:
- rewrite wording
- reorder lines
- add headings
- remove content
- replace with placeholders

## Fail-Fast Rule
Stop and report instead of continuing if:
- the BUILD doc is too vague to execute directly
- roadmap edits would require anything beyond bracket-state changes
- start_of_day directories would need modification
- the requested work expands beyond one PR purpose
- the BUILD asks for broad repo analysis without exact targets

## Directory Protection Rule
Codex may not create, modify, overwrite, rename, delete, or add files inside:
- `docs/dev/start_of_day/chatGPT/`
- `docs/dev/start_of_day/codex/`

unless the user explicitly asks for it.

## Reporting Rule
Codex must report:
- files changed
- validation performed
- whether scope stayed clean
- whether engine-core was untouched if expected
- the ZIP output path under `<project folder>/tmp/`



## 🚫 TESTABILITY GATE (NEW — REQUIRED)

A BUILD PR must produce a testable result.

Definition of testable:
- Can be executed, loaded, or meaningfully validated (runtime, UI, or module level)
- Not just structural (folders, placeholders, or isolated files)
- Not a partial dependency chain that cannot run

FAIL FAST if:
- The change only copies files without enabling execution
- The result cannot be smoke-tested
- The change introduces a partial system with no entry point

DO NOT EXECUTE:
- Scaffolding-only PRs
- Single-file migrations that do not integrate
- Folder-only or placeholder-only changes

Instead:
- Expand the BUILD scope to a vertical slice
- Or request a corrected BUILD PR with sufficient scope

