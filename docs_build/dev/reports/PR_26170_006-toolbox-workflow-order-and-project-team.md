# PR_26170_006-toolbox-workflow-order-and-project-team

## Branch Validation
- PASS: Current branch verified as `main`.

## Requirement Checklist
- PASS: Built `PR_26170_006-toolbox-workflow-order-and-project-team`.
- PASS: Added BUILD doc at `docs_build/pr/BUILD_PR_26170_006-toolbox-workflow-order-and-project-team.md`.
- PASS: Added Toolbox Workflow Ordering Governance to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- PASS: Documented Toolbox groups as intentional workflow-order exceptions.
- PASS: Documented tile ordering by creator progression rather than alphabetical sorting.
- PASS: Documented natural ordering rules: `Select -> Create -> Review`, `Left -> Right`, and `Top -> Bottom`.
- PASS: Documented that the next tile should represent the most likely next creator action.
- PASS: Documented that tile ordering should minimize navigation decisions.
- PASS: Updated Create group references to this order: Game Workspace, Game Configuration, Project Team, Tags.
- PASS: Moved project-specific Users planning into Create/Project Team documentation.
- PASS: Documented the distinction between Studio Team as account-level roster and Project Team as project-level assignment.
- PASS: Updated Owner Notes source content in `docs_build/dev/admin-notes/tools/index.txt`.
- PASS: Updated owner-facing group notes in `owner/grouping-colors.html`.
- PASS: No runtime behavior changes were made for this PR.

## Impacted Lane
- Documentation/static lane only.

## Validation
- PASS: `git branch --show-current` returned `main`.
- PASS: `git diff --check -- docs_build/dev/PROJECT_INSTRUCTIONS.md docs_build/dev/admin-notes/tools/index.txt owner/grouping-colors.html docs_build/pr/BUILD_PR_26170_006-toolbox-workflow-order-and-project-team.md`
- PASS: Targeted Node documentation validation confirmed:
  - governance includes workflow-order exception rules.
  - governance includes creator progression, next-action, and navigation-minimization rules.
  - Create group order is consistent.
  - Owner Notes source includes Project Team and Tags in Create.
  - Owner Notes source no longer lists Users as Platform planning.
  - owner reference no longer lists Users in Share.
  - Studio Team and Project Team distinction is documented.

## Playwright Decision
- Playwright impacted: No.
- No Playwright impact. This PR is docs/workflow only.
- `npm run test:workspace-v2` was not run because no runtime, UI behavior, toolState, workspace, or interaction behavior changed.

## Skipped Lanes
- Runtime: skipped because this PR changes documentation only.
- Integration: skipped because no handoff contract changed.
- Engine: skipped because no engine/shared runtime code changed.
- Samples: skipped because no sample files or sample loading behavior changed.
- Recovery/UAT: skipped because this is not a recovery lane behavior change.
- Full samples smoke: skipped per request and because documentation changes do not affect sample runtime behavior.

## Manual Test Notes
- Open `owner/grouping-colors.html` and confirm Create lists Game Workspace, Game Configuration, Project Team, and Tags.
- Open Owner Notes for `docs_build/dev/admin-notes/tools/index.txt` and confirm the Create group order and Studio Team / Project Team distinction are visible.
- Confirm no Toolbox page ordering or runtime behavior changed in this PR.

## Stacked Worktree Note
- The working tree already contains uncommitted prior PR changes. This PR's intentional product changes are documentation-only in `docs_build/dev/PROJECT_INSTRUCTIONS.md`, `docs_build/dev/admin-notes/tools/index.txt`, and `owner/grouping-colors.html`, plus the required BUILD/report artifacts.
