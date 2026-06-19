# BUILD PR_26170_008-workflow-order-governance

## Purpose
- Rename Toolbox-specific workflow ordering governance to shared Workflow Ordering Governance.
- Update Create workflow order so Project Team comes before Game Configuration.

## Scope
- Update current governance documentation and owner notes.
- Update Toolbox grouped renderer workflow order for the Create group.
- Update targeted Toolbox Playwright expectations for Create tile order.
- Do not move Game Journey.
- Do not modify unrelated groups.
- Do not run full samples.

## Required Behavior
- Governance name is `Workflow Ordering Governance`.
- Workflow surfaces order items by likely next action, not alphabetically.
- Workflow ordering is an approved exception to alphabetical ordering.
- Governance applies to Toolbox, Project Workspace, Create, Publish, Progress, and future guided workflows.
- Create group order is:
  1. Game Workspace
  2. Project Team
  3. Game Configuration
  4. Tags

## Validation
- Verify branch is `main`.
- Run targeted documentation/static validation.
- Run targeted Toolbox rendering validation because Create group order metadata changed.
- Skip samples validation.

## Required Artifacts
- `docs_build/dev/reports/PR_26170_008-workflow-order-governance.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26170_008-workflow-order-governance_delta.zip`
