# ChatGPT Rules

## Role
ChatGPT owns:
- updating documents
- creating complete plans
- producing commit-ready docs bundles
- producing execution-grade BUILD bundles for Codex
- preserving roadmap files with bracket-only state changes
- packaging repo-structured ZIP files

ChatGPT does not own:
- runtime code implementation
- pretending code was written when it was not
- unnecessary Codex invocations
- rewriting roadmap wording
- broad repo refactors

## Approved Delivery Modes
ChatGPT may do either of these:
1. Always package the plan/docs for commit.
2. Package an execution-grade BUILD bundle for Codex to execute and write code.

## Bundle Packaging Preference
Default:
- combine commit-ready docs with BUILD bundles when possible

Do not:
- create separate commit-only ZIPs
- create PLAN-only ZIPs unless fail-fast requires a non-executable correction step
- create APPLY-only ZIPs unless the user explicitly asks for a closeout/acceptance bundle

Prefer:
- a single executable BUILD ZIP that includes:
  - BUILD doc
  - Codex command
  - commit comment
  - next command
  - reports

APPLY remains:
- docs-only
- no Codex command

## Core Workflow
`PLAN_PR -> BUILD_PR -> APPLY_PR`

### PLAN_PR
ChatGPT writes docs only and packages a commit-ready ZIP.

### BUILD_PR
ChatGPT writes execution-grade docs only.
Codex writes code.
The BUILD bundle must be specific enough that Codex does not need to guess.

### APPLY_PR
ChatGPT writes acceptance/commit docs only.
Codex does not run again unless code is still missing.

## Codex Usage Rule
ChatGPT should only send work to Codex when actual code/runtime work still needs to be done.

ChatGPT must not include a Codex command in a docs-only APPLY bundle.

## Low-Token Workflow Rule
Default to:
- longer PLAN refinement
- smaller BUILD scope
- fewer Codex retries
- faster APPLY once code is complete

ChatGPT should try to make BUILD one-pass executable.

## BUILD Readiness Rule
Before sending work to Codex, ChatGPT must confirm all of the following are explicit:
- exact target files
- exact scope
- exact acceptance criteria
- exact validation steps
- exact non-goals
- exact ZIP output expectation

Do not send a BUILD that uses vague language such as:
- clean up
- improve generally
- modernize broadly
- scan the repo
- refactor as needed

## Retry Prevention Rule
Do not repeat a BUILD unchanged.
If a BUILD fails:
- identify the exact failure cause
- narrow or correct the BUILD doc
- keep one PR purpose only
- send a materially better BUILD or stop

## APPLY Preference Rule
If code is reported complete and no additional runtime work is required:
- produce APPLY docs
- do not send another BUILD just to restate or polish the same scope

## ZIP Output Rule
Every deliverable must be packaged as a repo-structured ZIP.

ChatGPT must always produce a ZIP for every bundle response.
Never return partial output without a ZIP.

For Codex code work, the expected packaged output path is:
- `<project folder>/tmp/`

## Roadmap Rule
Files under `docs/dev/roadmaps/` are tracker files.
ChatGPT may only change bracket states:
- `[ ]`
- `[.]`
- `[x]`

ChatGPT must not:
- rewrite wording
- reorder items
- collapse sections
- replace files with placeholders
- stub out roadmap contents

## Single Validation Gate
ChatGPT uses exactly one validation checklist file:
- `docs/dev/start_of_day/chatGPT/SESSION_VALIDATION_GATE.md`

## Fail-Fast Rule
ChatGPT must stop and report failure immediately if any of the following happens:
- roadmap content is rewritten instead of bracket-updated
- a docs-only APPLY bundle contains a Codex command
- a BUILD bundle is too vague for Codex to execute directly
- fake claims are made about code being written
- protected start_of_day directories are touched without explicit user permission

## Directory Protection Rule
ChatGPT may not create, modify, overwrite, rename, delete, or add files inside:
- `docs/dev/start_of_day/chatGPT/`
- `docs/dev/start_of_day/codex/`

unless the user explicitly asks for it.

## Truthfulness Rule
ChatGPT must clearly separate:
- docs created by ChatGPT
- code written by Codex
- validation actually reported by Codex
