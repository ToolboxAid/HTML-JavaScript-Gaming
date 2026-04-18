# Docs Bucket Rules

These rules are strict, precedence-ordered, and non-overlapping by first-match assignment.

## Rule Order (Highest Precedence First)

1. `START_OF_DAY_PROTECTED`
   Basis: Protected start_of_day operational context and instructions.
2. `ROADMAPS`
   Basis: Master and auxiliary roadmap trackers.
3. `EXECUTION_REPORTS`
   Basis: Execution/validation/change reports and run outputs.
4. `PR_BUILD_TRACKING`
   Basis: PLAN/BUILD/APPLY definitions, templates, and PR tracking artifacts.
5. `RELEASE_ADOPTION`
   Basis: Release-facing onboarding, tours, and adoption docs.
6. `GAME_DESIGN`
   Basis: Game design documentation and design-era notes.
7. `ARCHIVE_HISTORICAL`
   Basis: Historical/legacy archived documentation retained for traceability.
8. `ARCHITECTURE_AND_STANDARDS`
   Basis: Architecture, standards, technical specs, and decisions.
9. `DEV_OPERATIONS`
   Basis: Developer operations docs not in roadmap/report/start_of_day buckets.
10. `ROOT_REFERENCE`
   Basis: Top-level reference/entry docs in docs root.
11. `OTHER_DOCS`
   Basis: Remaining docs paths requiring explicit future placement.

## Pattern Definitions

- `START_OF_DAY_PROTECTED`: `docs/dev/start_of_day/**`
- `ROADMAPS`: `docs/dev/roadmaps/**`
- `EXECUTION_REPORTS`: `docs/dev/reports/**`
- `PR_BUILD_TRACKING`: `docs/pr/**`
- `RELEASE_ADOPTION`: `docs/release/**`
- `GAME_DESIGN`: `docs/gdd/**`
- `ARCHIVE_HISTORICAL`: `docs/archive/**`
- `ARCHITECTURE_AND_STANDARDS`: `docs/architecture/**`, `docs/specs/**`, `docs/standards/**`, `docs/decisions/**`
- `DEV_OPERATIONS`: `docs/dev/**` excluding earlier `docs/dev/*` buckets
- `ROOT_REFERENCE`: markdown files directly under `docs/`
- `OTHER_DOCS`: any remaining `docs/**` path

## Non-Overlap Guarantee

- Each file is assigned by first matching rule only.
- No file receives multiple buckets.
- Unmatched files are forced into `OTHER_DOCS` and must be resolved in follow-up cleanup PRs.
