# Team Backlog, SOD, And EOD Standard

Status: Approved
Owner: OWNER

## Purpose

Define the required Start of Day briefing, End of Day summary, team backlog ownership, completion percentage tracking, and official military team-name spelling for all active teams.

This standard is governance/documentation only. It does not change runtime behavior, API implementation, storage implementation, database DDL, or secret values.

## Official Team Names

Use military phonetic spelling for active team names:

- OWNER
- ALFA
- BRAVO
- CHARLIE
- DELTA

Display labels may use title case:

- Team OWNER
- Team Alfa
- Team Bravo
- Team Charlie
- Team Delta

Do not substitute Greek spelling for team names. Use `Alfa` spelling when referring to Team Alfa.

Historical snapshots, archived references, and non-team phrases such as `Alpha/Beta/User isolation framework` must not be rewritten unless OWNER explicitly scopes that work.

## Team Backlog Ownership

Every active team owns an active backlog when it has assigned work.

Each backlog item must track:

- name
- description
- current completion percentage
- remaining work
- blocking dependencies

Completion percentages are updated:

- at SOD
- after each accepted PR
- at EOD

The backlog is the authoritative source for determining the next PRs.

If the backlog and a generated report conflict, the backlog wins unless OWNER explicitly approves a newer governance decision.

When the Product Owner provides a completed PR ZIP, ChatGPT must review that ZIP, update the active team backlog and completion percentages, and recommend the next logical PRs needed to keep moving toward a Product Owner testable outcome.

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
- SOD creates or uses the active team branch.
- All commits go to the active team branch, not `main`.
- Sequential PRs stay on the active team branch/workstream during the day.
- EOD merges OWNER-approved work, pushes, returns to `main`, and verifies clean worktree and local/origin sync `0 0`.
