# Multi-Team Codex Execution Governance

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
- If merge succeeds but repository is not returned to main:
  closeout status = FAIL.

## Conflict Note

Existing ProjectInstructions wording that appears to require immediate or automatic merge remains preserved for traceability.

This addendum clarifies that merge to `main` remains owner-controlled. If a workflow rule appears to conflict with this addendum, stop and request explicit owner approval before merging.
