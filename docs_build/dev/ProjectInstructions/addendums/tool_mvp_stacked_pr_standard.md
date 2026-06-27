# Tool MVP Stacked PR Standard

Status: Approved
Owner: OWNER

## Purpose

Define how Codex plans and executes Creator-facing tool MVP work without creating one giant PR or stopping after every small PR.

## Standard

For tool MVPs, use:

```text
One large Codex command -> multiple focused stacked PRs -> each PR has a Product Owner testable outcome.
```

## Rules

- Do not create one giant PR.
- Do not stop after every small PR unless blocked.
- Each PR must be independently scoped.
- Each PR must produce a Product Owner testable outcome.
- Each PR must answer:

```text
What can the Product Owner test after applying this ZIP?
```

- Codex must continue through the stacked PR sequence unless blocked by:
  - branch state
  - failed validation
  - missing source files
  - Project Instructions conflict
  - unresolved dependency from a prior PR

## Creator-Facing Acceptance

For tool MVP PR planning, visible acceptance must be Creator-facing first.

Architecture can be handled under the covers, but PR purpose must be user-testable.

Canonical reference: `docs_build/dev/ProjectInstructions/addendums/pr_workflow.md` owns the Product Owner testable definition and no-shell completion rule.

Canonical Playwright reference: `docs_build/dev/ProjectInstructions/addendums/test_structure_standardization.md` owns page-level Playwright organization and minimum completion coverage.

Each tool MVP PR must state:
- Product Owner testable outcome
- What Playwright tests
- What the Product Owner should manually test
- Whether the PR is part of a stacked MVP sequence
- Previous PR dependency
- Next PR dependency

## Runtime Data Completion Boundary

A PR requested to complete a page, tool, MVP, or testable experience must not stop after route creation, shell creation, placeholder UI, static mock layout, or navigation activation unless the Product Owner explicitly requested a shell/foundation PR.

A PR outcome must not be described as complete if the visible data is coming from:

- mock repositories
- page arrays
- JSON source files
- browser storage
- `/tmp`

Seeded demo data is fine only when it is stored in the database and read back through the API.

Tool MVPs must follow `docs_build/dev/ProjectInstructions/addendums/no_mock_repository_runtime_source.md`.

## Hitboxes MVP Example Stack

Example Hitboxes MVP stack:

- PR 1: Creator can open the tool and choose a real/test object.
- PR 2: Creator can see the object and draw a rectangle hitbox.
- PR 3: Creator can move/resize/save/reload hitboxes.
- PR 4: Creator can test Object A vs Object B collision.
- PR 5: Creator can test speed/animation so fast objects do not skip collision.
- PR 6: Polish and regression coverage.

## Lifecycle Relationship

Tool MVP stacks are explicitly documented stacked PR chains.

Each PR in the stack still follows the canonical START / WORK / END lifecycle and must produce required reports and a repo-structured ZIP.

When OWNER gives one large Codex command for a tool MVP stack, Codex may continue from one completed PR to the next without stopping for a conversational checkpoint, unless a blocker listed in this standard occurs.

During an OWNER-approved day workstream, PR branches/commits stay on the active team branch/workstream and do not return to `main` between PRs.

This rule applies to all teams: OWNER, Team Alfa, Team Bravo, Team Charlie, Team Delta, and any future team.

The final PR in the stack must perform normal EOD closeout or OWNER-approved merge-checkpoint closeout and stop all work after returning to synchronized main.
