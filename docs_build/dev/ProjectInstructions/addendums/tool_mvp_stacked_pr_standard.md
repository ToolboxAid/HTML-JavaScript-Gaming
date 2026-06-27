# Tool MVP Stacked PR Standard

Status: Approved
Owner: OWNER

## Purpose

Define how Codex plans and executes Creator-facing tool MVP work without creating one giant PR or stopping after every small PR.

## Standard

For tool MVPs, use:

```text
One large Codex command -> multiple focused stacked PRs -> each PR has a testable Creator outcome.
```

## Rules

- Do not create one giant PR.
- Do not stop after every small PR unless blocked.
- Each PR must be independently scoped.
- Each PR must produce a Creator-testable outcome.
- Each PR must answer:

```text
What can Mr. Q test after applying this ZIP?
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

A request to complete a page, tool, or testable MVP means Product Owner testable.

Not acceptable as complete/testable:

- shell-only page
- `Not implemented yet`
- placeholder-only workspace, inspector, or output sections
- planned-only tile
- template-only page
- route that loads but cannot be used

Required for Product Owner testable completion:

- visible working controls
- API-backed data where required
- validation and error states
- empty states
- save/load behavior where applicable
- manual validation steps for Product Owner
- targeted Playwright coverage where impacted.

Each tool MVP PR must state:
- Creator-testable outcome
- What Playwright tests
- What Mr. Q should manually test
- Whether the PR is part of a stacked MVP sequence
- Previous PR dependency
- Next PR dependency

## Runtime Data Completion Boundary

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

During an OWNER-approved day workstream, sequential PRs stay on the active workstream branch and do not return to `main` between PRs.

The final PR in the stack must perform normal EOD closeout or OWNER-approved merge-checkpoint closeout and stop all work after returning to synchronized main.
