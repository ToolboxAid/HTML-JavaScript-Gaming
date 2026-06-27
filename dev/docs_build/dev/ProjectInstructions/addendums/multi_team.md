# Multi-Team Codex Execution Governance

Canonical workflow reference: `dev/docs_build/dev/ProjectInstructions/addendums/pr_workflow.md`.

Canonical branch lifecycle reference: `dev/docs_build/dev/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`.

This file owns multi-team execution coordination and must not create competing workflow or branch lifecycle rules.

## Four Active Delivery Teams

The single authoritative four-team ownership definition is:

`dev/docs_build/dev/ProjectInstructions/team_assignments/team_ownership.md`

Use the `Current Four-Team Ownership Model` section there for active delivery team ownership.

Rules:
- Team work must stay inside the owning team's area.
- Cross-team work requires OWNER approval and must identify the correct owning team for each PR.
- Team start commands must use the current ownership model before pulling a backlog item.

## Current Active Ownership Lanes

OWNER override approved.

The current active ownership lanes are:

- Team Alfa
- Team Bravo
- Team Charlie
- Team Delta
- Team Golf
- Team OWNER

Migration note:
Team Gamma is retired. Team Golf is the replacement active ownership lane.

Rules:
- Historical PR references and branch names that mention Gamma remain unchanged for traceability.
- New active work that would previously have used Team Gamma routes to Team Golf.
- Team Golf work requires OWNER assignment, an active branch, an active draft/open PR, or active release/cleanup responsibility.
- If Team Golf work touches Alfa, Bravo, Charlie, or Delta ownership areas, the PR must document the OWNER cross-team decision.

## All-Team Preferred Codex Execution Method

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
- Each PR must follow the canonical START / WORK / END lifecycle in `dev/docs_build/dev/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`.
- Each PR may be committed and pushed during active work.
- Each PR may be opened as a draft PR during active work.
- Do not commit directly to main.
- Do not merge to main during active work unless the owner explicitly says: "Merge this PR now."
- If later PRs depend on earlier unmerged PRs, Codex must either:
  - stack the dependent PRs, or
  - stop and request owner approval for the dependency model.
- Codex should reduce chit-chat by planning the full sequence before starting.
- Codex must still hard-stop for conflicts, dirty worktree, scope mismatch, missing assignment, or protected instruction deletion.

## Day Work / EOD Merge Rule

During active work:
- Work happens on active non-main team branches or scoped PR branches.
- Commits are allowed only on assigned non-main branches.
- Pushes are allowed and expected.
- Draft PRs are allowed and expected.
- Direct commits to main are prohibited.
- WORK remains on the PR branch; never checkout main during WORK.
- Merges to main are prohibited unless explicitly approved by the owner.

At end of day:
- Owner reviews ready PRs.
- Owner explicitly approves which PRs merge.
- Only owner-approved PRs may merge to main.
- After merge, execute the canonical END phase, return to synchronized main, and publish branch, HEAD SHA, and date/time.
- Do not treat sequential PR completion as merge approval.

Commit/push during the day is allowed only on assigned team/OWNER/PR branches.

Merge to main is EOD-only and owner-approved, unless the owner explicitly says:
"Merge this PR now."

## EOD Merge/Push Cleanup Gate

At EOD merge/push closeout, Codex must convert OWNER-approved decisions into action before shutdown.

Required gate:

1. List all open and draft PRs using GitHub as authority.
2. Group every PR by team:
   - Alfa
   - Bravo
   - Charlie
   - Delta
   - Golf
   - OWNER
   - Unknown
3. Assign every PR exactly one state:
   - Merge approved
   - Close approved
   - Hold with reason
   - Blocked by dependency
   - Next review target
4. Execute OWNER-approved merges before shutdown.
5. Execute OWNER-approved closures before shutdown.
6. Do not leave approved merge or close items open unless blocked.
7. If blocked, document the exact blocker:
   - draft state
   - conflict
   - non-main base
   - failed validation
   - missing OWNER approval
8. Do not delete branches unless explicitly approved.
9. Produce an EOD report with:
   - merged PRs
   - closed PRs
   - held PRs with reasons
   - blocked PRs with blockers
   - next review queue
   - final branch/worktree/local-origin sync
   - repo-structured ZIP path under `dev/workspace/artifacts/tmp/`
   - final repository state block

OWNER_049 lesson:
- PRs #129, #132, and #134 were merge-approved and still required merge execution.
- PRs #3 and #51 were close-approved and still required closure execution.
- PRs #50 and #118 were valid holds and required hold reasons.

Rules:
- This gate applies after the owner approves a merge/close batch and before EOD shutdown.
- OWNER approval to merge or close is an instruction to execute that action unless a listed blocker exists.
- Report-only handling is not sufficient for approved merge/close items.
- This gate does not authorize branch deletion.

## EOD Workstream Closeout

At completion of a merged PR or approved workstream:

Required steps:

1. Merge approved PR.
2. Checkout main.
3. Pull latest main.
4. Verify:
   - current branch = main
   - worktree clean
   - local/origin sync = 0 0
5. Record final main commit.
6. Report final repository state.
7. Produce a repo-structured ZIP under `dev/workspace/artifacts/tmp/` that includes the EOD report and all changed or preserved repo files from the closeout.
8. Record source branch disposition as `retained`.
9. Mark the PR Closed only when every Closed gate passes.

Required final state:

Branch:
main

Worktree:
clean

Local/origin:
0 0

Rules:

- A workstream is not considered closed until the repository is returned to main.
- A PI is not considered complete until main is current and synchronized.
- Do not leave Codex on a feature, team, workstream, recovery, governance, or owner branch after successful merge.
- Plan, Build, validation, reports, ZIP packaging, and closeout stay tied to the same PR identity and source branch.
- Source branches are retained by default after merge and closeout.
- A PR is not Closed until the PR merged, changes are pushed, the repository is on `main`, `main` includes the merge or final commit, the worktree is clean, local/origin sync is `0/0`, no untracked files exist, branch disposition is recorded as `retained`, required reports exist, the required repo-structured ZIP exists under `dev/workspace/artifacts/tmp/`, backlog is updated, and tool state is updated when applicable.
- A completed EOD closeout must produce the required ZIP even when the closeout changed no repo files; in that case, the ZIP must contain the EOD report proving the no-change result.
- The EOD ZIP does not replace the EOD report or other required reports under `dev/reports/`.
- If merge succeeds but repository is not returned to main:
  closeout status = FAIL.

Required final closeout output:

```text
FINAL REPOSITORY STATE:
- Branch
- Worktree
- Local/origin sync
- PR number/name
- PR status
- Merge/final commit
- Branch disposition
- Backlog update status
- Tool state update status
- ZIP path
- Closeout PASS/FAIL
```

## Workstream Hygiene Governance

At workstream closeout, Codex must review repository collaboration state before reporting the workstream closed.

Required review targets:
- open PRs
- draft PRs
- local branches
- remote branches

Each reviewed item must be classified as one of:
- Active
- Merged
- Superseded
- Abandoned
- Historical/Archive

Rules:
- Merged source branches should be retained by default after successful merge and main sync.
- Superseded draft PRs should be closed.
- Abandoned branches should be documented before removal.
- Active workstream branches remain.
- No branch deletion is performed by this governance rule unless a later owner-approved cleanup task explicitly scopes deletion.

## PI Closeout Governance

At PI completion, Codex must verify that the repository, GitHub workstream, and deferred-work record are ready for the next PI.

Required PI completion checks:
- all approved work merged
- repository returned to main
- main pulled clean
- local/origin sync = 0 0
- open PR review complete
- branch review complete
- active workstream review complete
- deferred work list recorded
- next PI queue recommendation recorded

Required PI closeout report fields:
- final main commit
- active PRs
- active branches
- closed/superseded PRs
- retained branch disposition and any owner-approved deletion candidates
- deferred work
- next PI priorities

Rules:
- EOD Workstream Closeout remains authoritative for final repository state.
- PI closeout must not imply approval to merge, close PRs, delete branches, or remove deferred work without explicit owner approval.
- If the repository is not on clean, synchronized main, PI closeout status = FAIL.

## GitHub Hygiene Audit Governance

GitHub hygiene cleanup must begin with an audit-only pass.

Audit targets:
- open PRs
- draft PRs
- merged PR branches
- stale remote branches
- stale local branches

Recommendation-only first pass values:
- keep
- close
- retained
- defer

Rules:
- Do not delete branches during the audit-only pass.
- Do not close PRs during the audit-only pass.
- Do not delete local branches without explicit owner approval.
- Do not delete remote branches without explicit owner approval.
- Do not close open or draft PRs without explicit owner approval.
- Cleanup actions must preserve EOD Workstream Closeout final-state requirements.

Command expectations for cleanup audits:
- report current branch
- report worktree status
- report local/origin sync
- list open PRs
- list draft PRs
- list local branches
- list remote branches
- identify merged branch candidates
- identify stale branch candidates

Required cleanup audit report fields:
- audit date
- repository
- final main commit, if on main
- current branch
- local/origin sync
- open PR recommendations
- draft PR recommendations
- merged PR branch recommendations
- stale remote branch recommendations
- stale local branch recommendations
- deferred cleanup items
- owner approvals required before action

## Conflict Note

Existing ProjectInstructions wording that appears to require immediate or automatic merge remains preserved for traceability.

This addendum clarifies that merge to `main` remains owner-controlled. If a workflow rule appears to conflict with this addendum, stop and request explicit owner approval before merging.
