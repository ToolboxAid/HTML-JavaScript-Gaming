# Multi-Team Branch And Scope Governance

## Purpose

This addendum keeps work routed through the backlog, team assignment, and branch controls before implementation begins.

## Main Branch

Do not commit directly to `main` unless the owner explicitly says to do so.

Normal execution uses:
1. latest `main`
2. scoped branch
3. validation evidence
4. draft PR
5. owner-controlled merge approval

## Backlog And Assignment Required

No work starts without a backlog item.

No work starts without a team assignment.

If a request asks a team to work outside its current assignment, stop and report:
- assigned team
- backlog location
- current assignment
- requested scope
- recommended action

## Team Scope

Teams may work only inside their assigned ownership area unless MASTER explicitly overrides the assignment.

Cross-team work must be split into team-owned PRs unless MASTER explicitly approves a cross-team exception.

## MASTER Override

The required override wording is:

`MASTER override approved: <reason>`

The reason must explain the branch, assignment, backlog, or scope exception.
