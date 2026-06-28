# TEAM_ASSIGNMENTS

Canonical workflow reference: `dev/build/ProjectInstructions/addendums/pr_workflow.md`.

Canonical branch lifecycle reference: `dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`.

This file records active assignments and registry state. Workflow summaries here are subordinate to the canonical workflow and branch lifecycle documents.

# Active Team Registry

| Team | Assignment | Branch | PR | Status |
|------|------------|--------|----|--------|
| Alfa | none | none | none | Available |
| Bravo | none | none | none | Available |
| Charlie | none | none | none | Available |
| Delta | PR_26177_DELTA_056-shared-validation-assertions | PR_26177_DELTA_056-shared-validation-assertions | PR_26177_DELTA_056-shared-validation-assertions | Active |
| Golf | none | none | none | Available |
| Owner | none | none | none | Available |

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
- The active ownership lanes are Alfa, Bravo, Charlie, Delta, Golf, and Owner.
- Golf is the only active replacement for the retired prior lane.
- Do not rewrite historical PR references for retired non-canonical lanes.
- Do not rename historical branches for retired non-canonical lanes.

## Assignment Status Legend

- Available: team may pull one `[ ]` backlog item when explicitly instructed.
- Active: team has one assignment in progress.
- Blocked: team cannot pull work until blocker is cleared.

## Alfa

Status: Available

Active assignment: none.

Active branch: none.

## Bravo

Status: Available

Active assignment: none.

Active branch: none.

## Charlie

Status: Available

Active assignment: none.

Active branch: none.

## Delta

Status: Active

Active assignment: PR_26177_DELTA_056-shared-validation-assertions.

Active branch: PR_26177_DELTA_056-shared-validation-assertions.

Active PR: PR_26177_DELTA_056-shared-validation-assertions.

OWNER override approved: Continue Delta random utility stack with PR_26177_DELTA_056-shared-validation-assertions.

## Golf

Status: Available

Active assignment: none.

Active branch: none.

OWNER decision: Replacement active ownership lane for the retired prior lane.

## Owner

Status: Available

Active assignment: none.

Active branch: none.

## Team Name Registry

- Alfa
- Bravo
- Charlie
- Delta
- Golf
- Owner

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
- During assigned team-day work, sequential PRs must remain on the assigned team branch until EOD or an owner-approved merge checkpoint.
- Returning to `main` between sequential team PRs is prohibited.
- Each PR reaches Closed only after clean-worktree, local/origin sync for the active source branch, no-untracked-files, required-report, required-ZIP, backlog, applicable tool-state, retained-branch-disposition gates, and the applicable EOD/main-verification gate pass.
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
- Owner, Alfa, Bravo, Charlie, Delta, and Golf

Purpose:
Reduce back-and-forth between owner and Codex while keeping PRs reviewable and scoped.

Rules:
- One Codex session may execute multiple sequential PRs.
- Each PR must still have one clear purpose.
- Each PR must create or use its own approved branch.
- Each PR may be committed and pushed during active work.
- Each PR may be opened as a draft PR during active work.
- Each PR must move through PR Open, Plan, Build, Validation, Approved, Merged, Main Verified, and Closed in order.
- For assigned team-day work, Main Verified occurs only at EOD or an owner-approved merge checkpoint; it is not permission to return to `main` between sequential PRs.
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
- The Day Work / EOD Merge Rule below overrides older main-return wording during assigned team-day sequences.
- If a branch model is unclear, owner approval is required before continuing.

## Day Work / EOD Merge Rule

During active work:
- Work happens on active non-main team branches or scoped PR branches.
- Commits are allowed only on assigned non-main branches.
- Pushes are allowed and expected.
- Draft PRs are allowed and expected.
- Direct commits to main are prohibited.
- Codex must stay on the assigned team branch until EOD or an owner-approved merge checkpoint.
- Returning to `main` between sequential PRs in the same assigned team-day workstream is prohibited.
- Merges to main are prohibited unless explicitly approved by the owner.
- Any staged changes, unstaged changes, unmerged state, or direct commit on `main` during team work is a governance failure.
- If that failure occurs, Codex must hard-stop, move the scoped work to the active team branch, restore `main` to a clean state, document the correction, and continue only from the team branch.

At end of day:
- Owner reviews ready PRs.
- Owner explicitly approves which PRs merge.
- Only owner-approved PRs may merge to main.
- After merge, return to main and pull latest main.
- Do not treat sequential PR completion as merge approval.

Commit/push during the day is allowed only on assigned team/OWNER/PR branches.

Merge to main is EOD-only and owner-approved, unless the owner explicitly says:
"Merge this PR now."

## EOD Main Lock And Next Day Reset

End of Day:

```text
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
```

Required:

```text
On branch main
nothing to commit, working tree clean
0 0
```

Next Day Start:

```text
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
git rev-parse HEAD
```

Team rule:
No team creates a PR branch until:
- Current branch: `main`
- Worktree: clean
- `main...origin/main`: `0 0`
- `HEAD` SHA matches published EOD SHA

Active source rule:
Teams must use only `dev/build/ProjectInstructions/` as the active Project Instructions source.

## Branch Lifecycle (Canonical)

Teams must follow the canonical branch lifecycle in:

```text
dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md
```

Assignment governance records active team and branch state; it must not create a competing lifecycle rule.
