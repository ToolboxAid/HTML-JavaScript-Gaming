# Team Backlog, SOD, And EOD Standard

Status: Approved
Owner: OWNER

## Purpose

Define the required Start of Day briefing, End of Day summary, team backlog ownership, completion percentage tracking, and official military team-name spelling for all active teams.

This standard is governance/documentation only. It does not change runtime behavior, API implementation, storage implementation, database DDL, or secret values.

## Official Team Names

Use military phonetic spelling for active team names:

- Owner
- Alfa
- Bravo
- Charlie
- Delta
- Golf

Do not substitute Greek spelling for team names. Use `Alfa` spelling when referring to Alfa.

Historical snapshots, archived references, and non-team phrases such as `Alfa/Beta/User isolation framework` must not be rewritten unless OWNER explicitly scopes that work.

## Team Backlog Ownership

Authoritative assigned product work source:

```text
dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md
```

Tool demand and Owner/Admin priority signal source:

```text
admin/tool-votes.html
```

The Tool Votes/Admin Owner planning surface informs backlog priority, Owner/Admin review, tool demand, and reprioritization. It does not replace `BACKLOG_MASTER.md` as the authoritative assigned-work source.

Every active team owns an active backlog when it has assigned work.

Each backlog item must track:

- name
- description
- product area
- status
- current completion percentage
- active PR, when one exists
- next milestone
- remaining work
- blocking dependencies
- owning team
- source or reference

Completion percentages are updated:

- at SOD
- when work changes status
- after every accepted PR
- at EOD

The backlog is the authoritative source for determining the next logical PRs.

If the backlog and a generated report conflict, the backlog wins unless OWNER explicitly approves a newer governance decision.

Codex must not invent assigned product work from conversation memory when `BACKLOG_MASTER.md` has a matching product area.

Teams must update backlog status and percent complete when work changes status.

Owner must update backlog status, completion percentage, and Tool Votes/Admin Owner status when assigning, reprioritizing, completing, or deferring work.

When the Product Owner provides a completed PR ZIP, ChatGPT must review that ZIP, update the active team backlog and completion percentages, and recommend the next logical PRs needed to keep moving toward a Product Owner testable outcome.

## Team Assignment Startup Review

During startup, each team must:

1. Read `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md`.
2. Locate its assigned team section and assigned product areas.
3. Read the Tool Votes/Admin Owner priority signal source at `admin/tool-votes.html` when the work involves tool demand, tool ordering, or Owner/Admin prioritization.
4. Display assignments as a table grouped by Team, then Product Area.
5. Include Team, Product Area, Status, Percent Complete, Active PR, Next Milestone, and Source / Reference for every assignment row.

Required startup output:

```text
Team Assignment
===============

Source ............ dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md
Priority Source ... admin/tool-votes.html
Team .............. <team>
Status ............ PASS

Assignments
-----------

| Team | Product Area | Status | Complete | Active PR | Next Milestone | Source |
|------|--------------|--------|----------|-----------|----------------|--------|
| Alfa | Objects Manager | Active | 45% | PR_26179_ALFA_011 | Properties | BACKLOG_MASTER.md |
```

If the task is not represented in `BACKLOG_MASTER.md` or the Tool Votes/Admin Owner planning source, Codex must flag the missing representation and ask OWNER whether to add or update the backlog before continuing.

## Start Of Day Team Briefing

When a team is assigned, ChatGPT/Codex must provide this briefing before implementation begins:

- team name
- active workstream
- current overall completion percentage
- assigned backlog items
- completion percentage for each backlog item
- remaining work for each backlog item
- recommended execution order
- current active branch
- blocking dependencies, if any

This briefing is required before implementation begins.

The briefing must include the Team Assignment startup output defined above.

## Startup Hard Stops

STOP before implementation when:

- `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md` cannot be found.
- the assigned team cannot be found in the backlog, unless OWNER explicitly provided a one-off task.
- the requested product-area task is not represented in the backlog or Tool Votes/Admin Owner planning source, until OWNER confirms whether to update the backlog.

If `admin/tool-votes.html` cannot be found, document the missing priority signal source and recommend `admin/tool-votes.html` as the canonical path instead of inventing a replacement.

## End Of Day Team Summary

At EOD, ChatGPT/Codex must provide:

- team name
- date
- PRs completed
- PRs merged
- validation summary
- overall completion percentage
- remaining backlog
- completion percentage for each remaining backlog item
- recommended first PRs for the next day
- repository status:
  - current branch
  - worktree
  - local/origin sync

## Relationship To Existing Workflow

This standard preserves the existing branch workflow:

- SOD starts from latest `main`.
- SOD reports the recommended active team branch/workstream only.
- Branch creation or use happens after SOD through the appropriate PR execution phase.
- All commits go to the active team branch, not `main`.
- Sequential PRs stay on the active team branch/workstream during the day.
- EOD merges OWNER-approved work, pushes, returns to `main`, and verifies clean worktree and local/origin sync `0 0`.
