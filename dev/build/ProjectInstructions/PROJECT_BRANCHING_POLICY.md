# Project Branching Policy

Version: 2026.06.28.002
Last Updated: 2026-06-28
Owner: OWNER

## Purpose

Define the repository branching policy for Independent PRs and Stacked PRs.

This document owns PR branching model decisions. Other Project Instructions documents may point here, but must not duplicate the full policy.

## Independent PR

An Independent PR is a PR with no direct dependency on another open PR.

Rules:
- Independent PRs start from synchronized `main`.
- Independent PRs target `main`.
- Independent PRs must not reuse another feature branch as their starting point.
- Independent PR work must return to synchronized `main` before another unrelated Independent PR begins.

## Stacked PR

A Stacked PR is a PR with a direct dependency on a previous PR branch or active team workstream branch.

Rules:
- Stacked PRs may start from the previous PR branch when there is a direct dependency.
- Stacked PRs belong under the documented active workstream.
- Stacked PRs must document dependency order before BUILD begins.
- A later stacked PR must not merge before every prior dependency PR is merged.

## Owner Branching Rules

OWNER may create Independent PRs from synchronized `main` when the work has no direct dependency.

OWNER may also create Stacked PRs when dependency order, reviewability, or workstream continuity requires it.

OWNER stacked PRs must document the same dependency, review, and merge order required for all stacked work.

## Non-Owner Team Branching Rules

Non-Owner teams use Stacked PR workstreams by default.

Non-Owner teams include Alfa, Bravo, Charlie, Delta, Golf, and any future non-Owner canonical team.

Non-Owner team PRs must start from the active team workstream branch or the documented previous PR branch unless OWNER explicitly grants a standalone/no-dependency exception.

## Explicit Owner Exception Process For Team Independent PRs

A non-Owner team may create an Independent PR from `main` only when OWNER explicitly marks the task:

```text
standalone/no-dependency
```

The exception must be documented before branch creation and must name:
- team
- PR name
- reason the PR has no dependency
- confirmation that the branch starts from synchronized `main`
- confirmation that the PR targets `main`

Without that explicit exception, Codex must treat the non-Owner team PR as Stacked.

## Dependency Documentation Requirements

Every Stacked PR report must name:
- stack order
- previous PR dependency
- next PR dependency, if known
- starting branch
- intended merge order
- base branch
- source branch

## Review Order

Stacked PRs must be reviewed in dependency order.

A later stacked PR may be reviewed for context, but OWNER approval must respect dependency order unless OWNER explicitly grants an exception.

## Merge Order

Stacked PRs must be merged in dependency order.

A later stacked PR must not merge before all prior dependency PRs are merged and the stack base has been updated as required by GitHub.

## Hard-Stop Validation Rules

Codex must HARD STOP before changing files when:
- the requested Independent PR does not start from `main`
- a non-Owner team PR starts from `main` without OWNER `standalone/no-dependency` approval
- the requested Stacked PR does not start from the documented previous PR branch or active workstream branch
- the Stacked PR lacks dependency order documentation
- the current branch changes unexpectedly
- the requested branch model conflicts with OWNER instructions

The hard-stop report must include:
- current branch
- expected branch
- requested PR model
- missing dependency or exception details
- worktree status

## Examples

### Owner Independent PR

```text
PR: PR_26179_OWNER_020-doc-cleanup
Model: Independent PR
Start: main
Base: main
Reason: no direct dependency
```

### Owner Stacked PR

```text
PR #1: PR_26179_OWNER_021-policy-foundation
Base: main

PR #2: PR_26179_OWNER_022-policy-followup
Base: PR_26179_OWNER_021-policy-foundation
Model: Stacked PR
Merge order: #1, then #2
```

### Non-Owner Team Stacked PR

```text
PR #1: PR_26179_ALFA_030-tool-flow-foundation
Base: main

PR #2: PR_26179_ALFA_031-tool-flow-validation
Base: PR_26179_ALFA_030-tool-flow-foundation
Model: Stacked PR
Merge order: #1, then #2
```

### Non-Owner Team Independent Exception

```text
OWNER exception: standalone/no-dependency
Team: Bravo
PR: PR_26179_BRAVO_040-small-doc-fix
Start: main
Base: main
Reason: isolated documentation fix with no branch dependency
```
