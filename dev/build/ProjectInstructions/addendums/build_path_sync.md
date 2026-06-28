# Build Path Status Sync Governance

## Purpose

This addendum keeps the central backlog and Toolbox Build Path aligned.

## Source Of Truth

`dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md` is the source of truth for tool status.

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

## Governance Phase 1 Closeout

Status: Approved  
Owner: OWNER

## Source of Truth

BACKLOG_MASTER.md is the source of truth for work item status.

## Tile Status Rules

- Build Path tile status derives from backlog status.
- Game Journey tile status derives from backlog status.
- Manual tile status changes are prohibited.
- Tiles must not maintain independent status state.
- Status changes must be made at the backlog/source level first.
- Visual indicators must synchronize from the approved status model.

## Approved Status Model

- [ ] Planned
- [.] Wireframe
- [-] Building
- [x] Complete
- [!] Blocked
- [D] Deprecated

## Overlay Rules

- Planned = 70% black overlay
- Wireframe = 80% black overlay
- Building = 90% black overlay
- Complete = 0% overlay / fully transparent
- Blocked = yellow indicator
- Deprecated = red indicator

## Completion

Completion comes from backlog status.
A Build Path or Game Journey item is complete only when the backlog item is marked complete.
