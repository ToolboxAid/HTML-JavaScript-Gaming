# BUILD_PR_LEVEL_18_19_TRACK_G_REPO_HYGIENE_COMPLETION

## Purpose
Complete Track G (Repo Hygiene) with one execution-backed PR that performs real repository cleanup work and updates roadmap status only after validation.

## Roadmap intent
This PR may advance only the following Track G items if fully executed and validated:
- `Remove imports to export (should not be import x, export x)` `[ ] -> [x]`
- `Other than templates (games/samples/tools), remove the .keep file, if the folder is empty, delete` `[ ] -> [x]`
- `remove unnecessary .keep files` `[ ] -> [x]`
- `remove empty folders` `[ ] -> [x]`
- `validate folder ownership rules` `[ ] -> [x]`
- `enforce clean repo structure` `[ ] -> [x]`

If the repo also uses a parent Track G status marker in the working roadmap, update that marker from `[ ] -> [x]` only after all Track G items above are complete and validated.

## Scope
Included:
- remove import/export anti-patterns of the form `import x ...; export x`
- replace those patterns with direct exports or locally valid equivalent cleanup
- remove unnecessary `.keep` files
- delete empty folders except protected template keepers under `games/`, `samples/`, and `tools/`
- validate folder ownership against current repo structure rules
- enforce clean repo structure within the scope of hygiene cleanup
- update affected references only where needed by the cleanup
- produce explicit validation reports
- preserve unrelated working-tree changes

Excluded:
- no feature implementation
- no engine/shared/game/tool behavior changes
- no broad refactor beyond the anti-pattern cleanup required here
- no Track H work
- no roadmap text rewrites
- no `start_of_day` modifications
- no deletion of non-empty folders
- no template-folder deletion
- no speculative folder moves without execution need

## Hard guards
- one PR purpose only: complete Track G repo hygiene
- all changes must be validation-backed
- additive reasoning, not blind churn
- no repo-wide scanning beyond what Track G requires
- preserve wording in roadmap; status-only updates only
- remove `.keep` only when safe under the rules above
- if an empty folder is intentionally required outside templates, keep it only with explicit validation note

## Required outputs
Codex must create/update:
- `docs/dev/reports/BUILD_PR_LEVEL_18_19_TRACK_G_REPO_HYGIENE_COMPLETION_IMPORT_EXPORT_CLEANUP.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_19_TRACK_G_REPO_HYGIENE_COMPLETION_KEEP_FILE_AUDIT.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_19_TRACK_G_REPO_HYGIENE_COMPLETION_EMPTY_FOLDER_REMOVAL.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_19_TRACK_G_REPO_HYGIENE_COMPLETION_FOLDER_OWNERSHIP_VALIDATION.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_19_TRACK_G_REPO_HYGIENE_COMPLETION_VALIDATION.md`

## Execution details

### 1) Import/export anti-pattern cleanup
Find and fix patterns where a module imports a symbol only to immediately re-export it.
Examples in scope:
- `import Foo from './Foo.js'; export default Foo;`
- `import { foo } from './foo.js'; export { foo };`

For each changed file, record:
- path
- pattern found
- replacement used
- whether any import path consumers required follow-up

### 2) `.keep` cleanup
Remove unnecessary `.keep` files.
Protected exception:
- template-preservation keepers under `games/`, `samples/`, and `tools/` may remain if needed

For each removed or retained `.keep`, record:
- path
- removed/retained
- reason

### 3) Empty folder cleanup
Delete empty folders that remain after `.keep` cleanup.
Do not delete:
- template folders intentionally preserved under `games/`, `samples/`, or `tools/`
- any folder proven necessary for workflow preservation with explicit report note

### 4) Folder ownership validation
Validate that remaining folders align to current ownership rules:
- engine/runtime folders hold runtime code
- shared holds cross-domain reusable helpers
- games hold game-specific implementation
- samples hold learning/demo content
- tools hold editor/pipeline/debug-authoring content
- docs remains organized per prior Track F cleanup

### 5) Clean structure enforcement
Resolve hygiene-only leftovers revealed by the above work, but do not expand into new structural refactors.

## Acceptance
- in-scope import/export anti-patterns removed
- unnecessary `.keep` files removed
- eligible empty folders removed
- protected template keepers preserved where required
- folder ownership validation completed
- clean repo structure enforced within hygiene scope
- no non-hygiene behavior changes introduced
- unrelated working-tree changes preserved
- roadmap updates are status-only and execution-backed

## Validation requirements
Validation must include:
- count of import/export anti-patterns found and fixed
- count of `.keep` files removed and retained with reasons
- count of empty folders removed
- list of protected template keepers left in place
- confirmation that no non-empty folders were deleted
- confirmation that no `start_of_day` files changed
- confirmation that unrelated working-tree changes were preserved
- confirmation that roadmap changes are status-only and limited to Track G items completed here

## Roadmap update rules
Only update status markers in the current repo roadmap file.

Allowed transitions only if fully executed and validated:
- each listed Track G item `[ ] -> [x]`
- parent `Track G - Repo Hygiene` `[ ] -> [x]` only if all Track G sub-items are complete

Do not change Track H in this PR.
