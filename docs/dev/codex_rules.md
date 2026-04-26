# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other task instructions except correctness and explicit user safety constraints.
If any rule is violated, the output is incorrect.

Codex must prefer the existing repo pattern over any new pattern, unless the PR explicitly says otherwise.

## Core Principles
- Follow the requested task exactly.
- One PR purpose only.
- Smallest scoped valid change.
- No repo-wide rewrites unless explicitly required by the task.
- Do not introduce behavior that was not explicitly requested.
- Do not modify `start_of_day` folders.

## Naming / Data Flow
- One concept = one name.
- Do not create alias variables or name remapping chains.
- Do not copy variables into new variables unless data is transformed.
- Do not rename the same concept across files.
- Do not use vague names such as `data`, `temp`, `obj`, `item`, `thing`, `value`, or `result` unless the scope is tiny and obvious.
- Do not introduce adapter names unless the PR explicitly requires adapters.
- Do not create duplicate state for the same value.
- Do not store derived state when it can be computed directly.

## Variables
- No temporary pass-through variables.
- No `a -> b -> c` assignment chains.
- Only introduce variables when they transform data, clarify a complex expression, or are required for control flow.

## Scope Creep
- Do not fix unrelated bugs.
- Do not clean up unrelated files.
- Do not modernize code unless requested.
- Do not change public APIs unless the PR explicitly requires it.
- Do not change folder structure unless the PR explicitly requires it.

## Control Flow
- Do not add hidden fallback behavior.
- Do not swallow errors silently.
- Do not replace explicit checks with broad truthy/falsy checks when behavior could change.
- Do not add global flags to control local behavior.
- Do not introduce magic strings or magic numbers.
- Do not add defaults/fallbacks for tool launch data; missing required SSoT data must fail validation visibly.

## Architecture
- Do not add a new framework, library, dependency, build tool, or pattern.
- Do not introduce service layers, registries, managers, factories, or abstractions unless explicitly requested.
- Do not create future-proof extension points.
- Do not split files only for style.

## UI / Navigation
- Do not change existing tile behavior unless the PR is specifically about that tile.
- Do not change route names, URLs, IDs, labels, or menu text unless requested.
- Do not create duplicate launch paths for the same tool.
- Do not bypass existing navigation conventions.
- Samples must launch tools through `tools/<tool>/index.html`.
- Games must launch Workspace Manager through `tools/Workspace Manager/index.html`.
- External launches from samples or games must clear prior tool/workspace memory before loading the requested tool or workspace.

## Testing / Validation
- Do not mark work complete without a concrete test path.
- Do not claim browser-tested behavior unless actually tested.
- Do not remove existing tests or validation hooks.
- Do not weaken tests to make changes pass.

## Repo Safety
- Do not modify `start_of_day` folders.
- Do not delete legacy folders unless explicitly instructed.
- Do not touch roadmap text except status markers `[ ]`, `[.]`, `[x]`.
- Do not rewrite documentation outside the PR scope.

## JavaScript-Specific
- Do not use `var`.
- Do not create globals.
- Do not mutate imported/shared config objects.
- Do not rely on implicit type coercion.
- Do not use loose equality `==` or `!=`.
- Do not add async behavior unless needed.
- Do not mix DOM querying and business logic if existing code separates them.
- Do not duplicate event listeners.
- Do not attach handlers repeatedly inside render/update loops.

## Validation Required Before Finish
Before completing, verify:
- No alias variables exist.
- No unnecessary variables were introduced.
- No scope expansion occurred.
- Code matches existing repo patterns.
- Only requested changes were made.
- Launch data comes from a single source of truth.
- No default/fallback launch entries remain for tools.

If any violation exists, fix it before returning output.
