# BUILD PR_26170_005-toolbox-create-idea-color-model

## Purpose
- Align the Toolbox Game Journey display model after the Create group split.
- Move Tags into Create and Creator Learning into Idea.
- Update the Owner group color reference to the current rainbow-ordered Toolbox groups.

## Scope
- Update Toolbox grouped-view display mapping only where required.
- Update Owner Group Color Model, Usage Notes, and Color Groups documentation.
- Include `#RRGGBB` values wherever group colors are listed in the Owner reference.
- Keep tool routes, statuses, database behavior, workspace behavior, runtime behavior, and metadata contracts unchanged.

## Validation
- Verify the current branch is `main` before changes.
- Run targeted syntax/static checks for changed files.
- Run targeted Toolbox Playwright validation if Toolbox group rendering changes.
- Do not run full samples.

## Required Artifacts
- `docs_build/dev/reports/PR_26170_005-toolbox-create-idea-color-model.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26170_005-toolbox-create-idea-color-model_delta.zip`
