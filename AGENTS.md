# AGENTS.md

## Workflow
- PLAN -> BUILD -> APPLY
- Docs-first unless the active task is BUILD or APPLY
- One PR per purpose
- Smallest scoped valid change only

## Repo Rules
- Codex writes code
- No engine core changes unless the task explicitly requires it
- Sample-level integration only unless the task explicitly requires broader scope
- Read target files first
- Avoid repo-wide scanning unless exact targets require it
- No speculative exploration
- Stop and report on ambiguity

## Packaging
- Package results to <project folder>/tmp/*.zip
- Preserve exact repo-relative structure inside the ZIP
- Include only files relevant to the PR
- Do not include unrelated files, full-repo copies, dependencies, or build artifacts

## BUILD Expectations
- Exact file targets only
- Explicit validation commands
- No unrelated changes
- No retry without a corrected spec

## Architecture
TOOLS -> CONTRACT -> RUNTIME -> DEBUG -> VISUAL
