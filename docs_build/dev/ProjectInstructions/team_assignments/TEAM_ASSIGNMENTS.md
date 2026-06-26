# TEAM_ASSIGNMENTS

# Active Team Registry

| Team | Assignment | Branch | PR | Status |
|------|------------|--------|----|--------|
| Team Alfa | none | none | none | Available |
| Team Bravo | none | none | none | Available |
| Team Charlie | none | none | none | Available |
| Team Delta | PR_26177_DELTA_053-random-shared-helpers | PR_26177_DELTA_053-random-shared-helpers | PR_26177_DELTA_053-random-shared-helpers | Active |
| Team Golf | none | none | none | Available |
| Team OWNER | none | none | none | Available |

Rules:
- Registry is the authoritative active-work view.
- Registry must match `TEAM_ASSIGNMENTS.md`.
- Registry must be updated when assignments change.
- Registry must be updated when branches are retired.
- Registry must be updated when PRs merge.
- Registry must record when a team PR reaches Closed before that team begins another PR, unless OWNER documented an explicit stacked PR chain.
- Teams with no active work are omitted.

A team is Active when:
- it has an assigned backlog item
- or it owns an active branch
- or it owns an active draft/open PR

A team is not listed in Active Team Registry when:
- it has no assignment
- it has no active branch
- it has no active PR

Result:
If a team is missing from Active Team Registry:
it is currently inactive.

Current OWNER clarification:
- The active ownership lanes are Team Alfa, Team Bravo, Team Charlie, Team Delta, Team Golf, and Team OWNER.
- Team Gamma is retired. Team Golf is the replacement active ownership lane.
- Do not rewrite historical PR references that mention Team Gamma.
- Do not rename historical branches that contain Gamma.

## Assignment Status Legend

- Available: team may pull one `[ ]` backlog item when explicitly instructed.
- Active: team has one assignment in progress.
- Blocked: team cannot pull work until blocker is cleared.

## Team Alfa

Status: Active

Active assignment: PR_26177_DELTA_053-random-shared-helpers.

Active branch: PR_26177_DELTA_053-random-shared-helpers.

Active PR: PR_26177_DELTA_053-random-shared-helpers.

OWNER override approved: Continue Team Delta random utility stack with PR_26177_DELTA_053-random-shared-helpers.

## Team Bravo

Status: Available

Active assignment: none.

Active branch: none.

## Team Charlie

Status: Available

Active assignment: none.

Active branch: none.

## Team Delta

Status: Available

Active assignment: none.

Active branch: none.

## Team Golf

Status: Available

Active assignment: none.

Active branch: none.

OWNER decision: Replacement active ownership lane for retired Team Gamma.

## Team OWNER

Status: Available

Active assignment: none.

Active branch: none.

## Team Name Registry

- Team Alfa
- Team Bravo
- Team Charlie
- Team Delta
- Team Echo
- Team Foxtrot
- Team Golf
- Team Hotel
- Team India
- Team Juliett
- Team Kilo
- Team Lima
- Team Mike
- Team November
- Team Oscar
- Team Papa
- Team Quebec
- Team Romeo
- Team Sierra
- Team Tango
- Team Uniform
- Team Victor
- Team Whiskey
- Team X-ray
- Team Yankee
- Team Zulu
- Team OWNER

## Preferred Codex Execution Method

Preferred execution model:
Single Codex session with multiple sequential PRs.

Purpose:
Reduce back-and-forth between owner and Codex while keeping PRs reviewable and scoped.

Rules:
- One Codex session may execute multiple sequential PRs.
- Each PR must still have one clear purpose.
- Each PR must create its own branch.
- Each PR must be committed, pushed, and opened as a draft PR.
- Each PR starts at PR Open after the branch and PR identity are named.
- Each PR plans and builds on the same source branch after PR Open.
- Each PR reaches Closed only after main-return, clean-worktree, local/origin `0/0`, no-untracked-files, required-report, required-ZIP, backlog, applicable tool-state, and retained-branch-disposition gates pass.
- A team must not begin another PR until its previous PR is Closed unless OWNER documented an explicit stacked PR chain.
- Do not commit directly to main.
- Do not merge without explicit owner approval.
- If later PRs depend on earlier unmerged PRs, Codex must either:
  - stack the dependent PRs, or
  - stop and request owner approval for the dependency model.
- Codex should reduce chit-chat by planning the full sequence before starting.
- Codex must still hard-stop for conflicts, dirty worktree, scope mismatch, missing assignment, or protected instruction deletion.

### All-Team Codex Execution Clarification

Preferred execution model:
Single Codex session with multiple sequential PRs.

Applies to:
- Team Alfa through Team Zulu
- Team OWNER

Purpose:
Reduce back-and-forth between owner and Codex while keeping PRs reviewable and scoped.

Rules:
- One Codex session may execute multiple sequential PRs.
- Each PR must still have one clear purpose.
- Each PR must create or use its own approved branch.
- Each PR may be committed and pushed during active work.
- Each PR may be opened as a draft PR during active work.
- Each PR must move through PR Open, Plan, Build, Validation, Approved, Merged, Main Verified, and Closed in order.
- Plan, Build, validation, reports, ZIP packaging, and closeout must stay tied to the same PR identity and source branch.
- Source branches are retained by default after merge and closeout.
- A team must not begin another PR until its previous PR is Closed unless OWNER documented an explicit stacked PR chain.
- Do not commit directly to main.
- Do not merge to main during active work unless the owner explicitly says: "Merge this PR now."
- If later PRs depend on earlier unmerged PRs, Codex must either:
  - stack the dependent PRs, or
  - stop and request owner approval for the dependency model.
- Codex should reduce chit-chat by planning the full sequence before starting.
- Codex must still hard-stop for conflicts, dirty worktree, scope mismatch, missing assignment, or protected instruction deletion.

Conflict note:
- Older wording that says each PR must create its own branch remains preserved.
- This all-team clarification allows an approved existing team, OWNER, or scoped PR branch when the owner assigns that dependency model.
- If a branch model is unclear, owner approval is required before continuing.

## Day Work / EOD Merge Rule

During active work:
- Work happens on assigned team branches, OWNER branches, or scoped PR branches.
- Commits are allowed only on assigned non-main branches.
- Pushes are allowed and expected.
- Draft PRs are allowed and expected.
- Direct commits to main are prohibited.
- Merges to main are prohibited unless explicitly approved by the owner.

At end of day:
- Owner reviews ready PRs.
- Owner explicitly approves which PRs merge.
- Only owner-approved PRs may merge to main.
- After merge, return to main and pull latest main.
- Do not treat sequential PR completion as merge approval.

Commit/push during the day is allowed only on assigned team/OWNER/PR branches.

Merge to main is EOD-only and owner-approved, unless the owner explicitly says:
"Merge this PR now."
