# Active Team Registry

Status: Approved
Owner: OWNER

## Purpose

Track temporary active teams without creating a permanent team roster.

## Rule

Active teams may change day to day.
OWNER identifies available teams when starting work.
Project Instructions must not assume a permanent team roster.

## Active Criteria

A team is active when it has at least one of:

- OWNER-assigned work
- active branch
- draft or open PR
- active release or cleanup responsibility

If a team has no assignment, no active branch, and no active PR, it is inactive and may be omitted from the active registry.

## Registry

| Team | Active Assignment | Branch | PR | Status | OWNER Decision |
|------|-------------------|--------|----|--------|----------------|
| Alfa | none | none | none | Available | Active ownership lane |
| Bravo | none | none | none | Available | Active ownership lane |
| Charlie | none | none | none | Available | Active ownership lane |
| Delta | PR_26177_DELTA_056-shared-validation-assertions | PR_26177_DELTA_056-shared-validation-assertions | PR_26177_DELTA_056-shared-validation-assertions | Active | OWNER override approved: Continue Delta random utility stack with PR_26177_DELTA_056-shared-validation-assertions |
| Golf | none | none | none | Available | Replacement active ownership lane for the retired prior lane |
| Owner | none | none | none | Available | Governance Phase 1 complete |

## Current Active Ownership Lanes

OWNER override approved.

The current active ownership lanes are Alfa, Bravo, Charlie, Delta, Golf, and Owner.

Migration note:
Golf is the only active replacement for the retired prior lane.

Historical PR references and branch names for retired non-canonical lanes remain unchanged for traceability.

## Update Rules

Update the registry when:

- OWNER starts a team
- OWNER reassigns work
- a branch is created
- a PR is opened
- a PR is merged
- a branch is retired
- a team becomes inactive

## Reassignment

Only OWNER may reassign work.
Assigned team remains owner of record until complete or OWNER reassignment.

## Reset Rule

After closeout, the active registry may reset to no active non-OWNER teams.
This reset does not delete historical ownership, PR history, or backlog source-of-truth records.
