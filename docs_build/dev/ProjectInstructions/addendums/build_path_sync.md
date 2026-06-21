# Build Path Status Sync Governance

## Purpose

This addendum keeps the central backlog and Toolbox Build Path aligned.

## Source Of Truth

`docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md` is the source of truth for tool status.

## Build Path Sync

`toolbox/index.html` Build Path tiles must match tool status from `BACKLOG_MASTER.md`.

When a central backlog tool status changes, update the matching Build Path tile.

Status and Build Path changes should be in the same PR when practical.

## Phase Percentages

Phase percentages are calculated from tools in each phase.

Rules:
- completed tools count as complete
- planned, wireframe, building, and blocked tools remain in the denominator
- deprecated tools are excluded from the denominator
- phase percentage must be recalculated when a tool status changes

## Validation

PRs that change backlog status or Build Path status must document:
- backlog item changed
- matching Build Path tile changed
- phase percentage before and after
- skipped sync, if any, with reason
