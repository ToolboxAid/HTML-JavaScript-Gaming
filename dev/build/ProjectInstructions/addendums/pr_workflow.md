# PR Workflow Governance

Status: Approved
Owner: OWNER

## Purpose

Define the standard pull request workflow for Game Foundry Studio.

Official PLAN_PR, BUILD_PR, APPLY_PR, Start of Day, and invalid command behavior lives in:

`dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`

The Codex Completion Contract for ZIP artifacts lives in:

`dev/build/ProjectInstructions/addendums/codex_artifact_and_reporting_standard.md`

This file owns PR lifecycle governance. It must not duplicate command phase rules.

## Standard Flow

1. Identify the PR branching model: Independent PR or Stacked PR.
2. Start from the required branch for that model.
3. Pull or confirm the required base branch is current.
4. Verify clean worktree.
5. Create a PR branch and PR identity.
6. Mark lifecycle state as PR Open.
7. Plan on the same PR branch.
8. Build on the same PR branch.
9. Validate the change.
10. Commit with a clear OWNER/team message.
11. Push the branch.
12. Open or update the draft PR.
13. Review the PR.
14. OWNER approves merge.
15. Merge to main in the valid order for the PR model.
16. Pull latest main before starting the next unrelated workstream, or before a new PR when the work is not an OWNER-approved stacked/sequential workstream.
17. Verify Main Verified and Closed gates.

## PR Branching Models

Canonical PR branching policy lives in:

`dev/build/ProjectInstructions/PROJECT_BRANCHING_POLICY.md`

That document owns Independent PR, Stacked PR, Owner branching, non-Owner team branching, explicit Owner standalone/no-dependency exceptions, dependency documentation, review order, merge order, hard-stop validation rules, and examples.

This PR workflow document must load and follow that policy, but it must not duplicate the full policy text.

All PR branching models remain subject to the Codex Completion Contract. Missing required ZIP output means the Codex run is incomplete.

## Daily Branch Workflow

Team-neutral daily workflow:

- SOD starts from the latest synchronized `main`.
- SOD reports the active team branch/workstream recommendation only.
- Branch creation or branch updates happen after SOD through the appropriate PR execution phase.
- Work must be committed only to the active team branch.
- PR branches/commits stay on the active team branch/workstream during the day when OWNER assigned a stacked or sequential workstream.
- Do not return to `main` between stacked/sequential PRs in the same active workstream.
- `main` is only the SOD baseline and the EOD return target, unless OWNER explicitly approves an intermediate merge checkpoint.
- EOD merges or closes OWNER-approved work, pushes, returns to `main`, and verifies:
  - current branch is `main`
  - worktree clean
  - local/origin sync is `0 0`
- This rule applies to all canonical teams: Owner, Alfa, Bravo, Charlie, Delta, and Golf.

This section supersedes older active wording that implies returning to `main` between every PR inside an OWNER-approved stacked/sequential workstream.

## Branch Lifecycle (Canonical)

The canonical START, WORK, END, Daily Synchronization, and Mandatory Hard Stops rules live in:

`dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`

PR workflow must follow that lifecycle exactly and must not create a competing lifecycle rule.

## PR Lifecycle States

Required state order:

1. PR Open
2. Plan
3. Build
4. Validation
5. Approved
6. Merged
7. Main Verified
8. Closed

Definitions:
- PR Open is the first active lifecycle state.
- PR Open means the tracked PR identity and source branch are created and named before Plan begins.
- Plan happens after PR Open on the same PR branch.
- No BUILD_PR may proceed without a PR name and active branch/PR identity unless explicitly marked `PLAN_ONLY`.
- Build means scoped work is in progress on the same PR branch and PR identity.
- Validation means requested checks, required reports, manual validation notes, and ZIP packaging are underway.
- Approved means OWNER or required reviewer approval exists for merge.
- Merged means the PR merged and changes were pushed.
- Main Verified means current branch is `main`, `main` includes the merge or final commit, worktree is clean, local/origin sync is `0/0`, and no untracked files remain.
- Closed is valid only after every Closed gate passes.

Closed gates:
- PR merged and changes pushed.
- Current branch is `main`.
- `main` includes the merge commit or recorded final commit.
- Worktree clean, including intended `dev/reports/` updates committed and merged.
- Local/origin sync is `0/0`.
- No untracked files.
- Branch disposition is recorded as `retained`.
- Required reports exist.
- Required repo-structured ZIP under `dev/workspace/zips/` exists.
- Backlog is updated.
- Tool state is updated when applicable.

## Rules

- Direct commits to main are prohibited unless OWNER explicitly approves.
- Draft PRs are preferred until validation is complete.
- Each PR must have a clear scope.
- Plan, Build, validation, reports, ZIP packaging, and closeout must stay tied to the same PR identity and source branch.
- Source branches are retained by default after merge and closeout.
- Do not mix unrelated scopes.
- Do not start dependent PRs until the required base PR is merged unless the work is an explicitly documented Stacked PR with a direct dependency on the previous PR branch.
- Return to `main` before starting an unrelated PR or new workstream.
- Do not return to `main` between PRs in the same OWNER-approved stacked/sequential workstream unless OWNER approves an EOD or intermediate merge checkpoint.
- A team must not begin another PR if its previous PR is not Closed.
- Exception is allowed only for explicitly documented stacked PR chains.
- If validation fails, stop and report.
- If conflict occurs, stop and report.
- If OWNER decision is required, stop and report.
- Every PR lifecycle state must satisfy the Codex Completion Contract when Codex executes work for that state.
- ZIP artifacts belong under `dev/workspace/zips/` and must not replace required reports under `dev/reports/`.
- Reports generated during a PR are expected to be committed as part of that PR. Do not delete report files solely to obtain a clean worktree, and do not add `dev/reports/` to `.gitignore`.
- Stacked PR chains produce one final outcome ZIP per attempted PR and stop before later PRs after failure or hard stop.

## Batch Governance Mode

For governance, documentation, and administrative work, use Batch Governance Mode by default.

Use stacked sequential PRs only when dependency order requires it.

## Tool MVP Stacked PRs

Tool MVP work must follow:

`dev/build/ProjectInstructions/addendums/tool_mvp_stacked_pr_standard.md`

For tool MVPs, use one large Codex command, multiple focused stacked PRs, and one Product Owner testable outcome per PR.

Do not create one giant PR.

Do not stop after every small PR unless blocked by branch state, failed validation, missing source files, Project Instructions conflict, or an unresolved dependency from a prior PR.

Each tool MVP PR plan or template must include:
- Product Owner testable outcome
- What Playwright tests
- What the Product Owner should manually test
- Whether the PR is part of a stacked MVP sequence
- Previous PR dependency
- Next PR dependency

Visible acceptance must be Creator-facing first. Architecture can be handled under the covers, but the PR purpose must be user-testable.

## Product Owner Testable Definition

Canonical owner: this section is the active canonical Product Owner testable completion rule.

A request to complete a page, tool, MVP, or testable experience means Product Owner testable by default. Codex must deliver a working Product Owner testable feature, not a shell or foundation page, unless the Product Owner explicitly requests a shell/foundation PR.

A Product Owner testable outcome means the Product Owner can:

- open the page/tool
- perform the primary workflow
- save/load data where applicable
- observe expected results
- validate success and failure states
- follow manual validation steps from the PR report

Not acceptable as a completed/testable page or tool:

- shell-only page
- route-only page
- navigation-only PR
- template-only page
- placeholder controls
- static table with no workflow
- `Not implemented yet`
- `coming soon`
- placeholder-only workspace, inspector, or output sections
- planned-only tile
- route that loads but cannot be used

Required for Product Owner testable completion:

- visible working controls
- API-backed data where required
- validation and error states
- empty states
- save/load behavior where applicable
- manual validation steps for Product Owner
- targeted Playwright coverage where impacted.

## No-Shell Completion Rule

A PR requested to complete a page, tool, MVP, or testable experience must not stop after route creation, shell creation, placeholder UI, static mock layout, or navigation activation unless the Product Owner explicitly requested a shell/foundation PR.

## OWNER Shortcut: PRs

Keyword:
PRs

Meaning:
Generate the complete stacked sequential Codex PR chain required to finish the current workstream.

Applies to:
- Owner
- Alfa
- Bravo
- Charlie
- Delta
- Golf

Behavior:
- Determine completed work.
- Determine open work.
- Determine remaining work.
- Batch related work where practical.
- Generate the complete PR chain.
- Include start gates.
- Include validation.
- Include commit messages.
- Include PR names.
- Include merge dependencies.

Default assumptions:
- Batch Governance Mode
- Throughput-first execution
- Minimal conversational checkpoints

Stop only for:
- Start gate failure
- Merge conflict
- Validation failure
- OWNER decision

## Completed PR ZIP Review And Next Logical PRs

Whenever the Product Owner provides a completed PR ZIP to ChatGPT, ChatGPT shall:

- review the completed work
- identify completed scope
- identify remaining scope
- update the team backlog and completion percentages
- determine the next logical PRs
- recommend the execution order
- generate each recommended PR with:
  - PR summary
  - Codex command
  - commit comment
  - Playwright scope
  - manual validation steps

Use plural wording: `next logical PRs`.

Unless blocked by dependencies or directed otherwise by the Product Owner, ChatGPT should generate enough sequential PRs to complete the current backlog item to a Product Owner testable state rather than stopping after a single PR.

The Product Owner should not have to ask:

- `What is next?`
- `Create the next PR.`
- `Continue.`

The backlog drives the next recommended PRs automatically.

## EOD Main Lock

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

## Next Day Start

```text
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
git rev-parse HEAD
```

No team creates a PR branch until:
- Current branch: `main`
- Worktree: clean
- `main...origin/main`: `0 0`
- `HEAD` SHA matches published EOD SHA
