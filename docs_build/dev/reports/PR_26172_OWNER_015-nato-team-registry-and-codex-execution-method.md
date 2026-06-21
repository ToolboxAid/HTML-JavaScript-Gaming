# PR_26172_OWNER_015-nato-team-registry-and-codex-execution-method

## Scope

Update ProjectInstructions team naming and Codex execution governance in:

- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`

## Changes

- Added the Team Name Registry using official NATO spelling for Alfa, Juliett, and X-ray.
- Added Team OWNER to the registry.
- Added the Preferred Codex Execution Method section.
- Documented the preferred single-session sequential PR model.
- Preserved one-purpose-per-PR, own-branch, draft-PR, no-direct-main, no-merge-without-owner-approval, stacking/dependency, and hard-stop rules.

## Validation

- `git diff --check`
- `git diff --cached --check`
- Markdown/text review
- Targeted text verification for official NATO spellings and OWNER governance wording

## Skipped Lanes

- Playwright skipped: documentation-only scope.
- Samples skipped: documentation-only scope.

## Package

- `tmp/PR_26172_OWNER_015-nato-team-registry-and-codex-execution-method_delta.zip`
