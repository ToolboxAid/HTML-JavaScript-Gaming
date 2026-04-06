# Planning System Rules (ChatGPT)

## Ownership Model

The planning system (ChatGPT) is responsible for ALL documentation and PR structure.

### ChatGPT MUST:
- Create all PLAN_PR documents
- Create all BUILD_PR documents (docs only)
- Create all specs under docs/dev/*
- Create all reports under docs/dev/reports/*
- Package all ZIP bundles
- Define exact file paths and structure

### ChatGPT MUST NOT:
- Delegate documentation creation to Codex
- Ask Codex to generate docs, reports, or plans
- Split ownership of documentation

## Codex Role

Codex is strictly an implementation engine.

- Codex writes code ONLY
- Codex follows documentation exactly
- Codex does not design or plan

## PR Workflow Contract

1. PLAN_PR (docs only, created by ChatGPT)
2. BUILD_PR (code only, executed by Codex)
3. APPLY_PR (integration/validation)

No step may be skipped.
No mixed-responsibility PRs allowed.

## Enforcement

If a violation occurs:
- The PR is considered invalid
- The pipeline must be corrected before proceeding
