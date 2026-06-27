# PR_26152_057 Theme Surface Boundary Validation

## Scope
- Read docs_build/dev/PROJECT_INSTRUCTIONS.md before implementation.
- Documentation/governance and reports only.
- Added Theme Surface Boundary guidance to docs_build/dev/PROJECT_INSTRUCTIONS.md.
- No CSS, HTML, JavaScript, runtime behavior, or page migration changes were made.
- The tracked docs delta is present in HEAD as commit 9952aaf69 (PI update); review artifacts were generated from that commit range.

## Documentation Change
PASS - Added a Theme Surface Boundary section under GameFoundryStudio Theme V2 governance.
PASS - Documented GameFoundryStudio/assets/css/theme/v2 ownership for public/root GameFoundryStudio page styling:
- root Home
- Company pages
- Tools index
- public/root tool pages
- marketing/content surfaces
- placeholder Admin/Account pages until DB/login implementation
PASS - Documented src/engine/theme ownership for engine/runtime first-class tool shell styling:
- runtime tool shell
- engine-facing first-class tools
- reusable runtime UI foundations
PASS - Documented that src/engine/theme is not deprecated at this time.
PASS - Documented no behavior duplication between Theme V2 and src/engine/theme.
PASS - Documented no competing .tool-shell implementations.
PASS - Documented that shared public/root and runtime behavior requires a shared shell contract before promotion.
PASS - Documented that collapse/rail behavior currently belongs only to the public/root .tool-workspace shell unless promoted by a later PR.
PASS - Updated older Theme V2 governance wording so it applies to public/root GameFoundryStudio page work and does not conflict with src/engine/theme runtime ownership.

## Validation Commands
- rg -n "Theme Surface Boundary|GameFoundryStudio/assets/css/theme/v2|src/engine/theme|Do not deprecate src/engine/theme|Collapse/rail behavior currently belongs only" docs_build/dev/PROJECT_INSTRUCTIONS.md
- git diff -- docs_build/dev/PROJECT_INSTRUCTIONS.md
- git diff --name-only -- "*.css" "*.html" "*.js"
- git diff --name-only -- GameFoundryStudio tools admin Admin account Account company Company games Games samples Samples index.html
- git diff --check -- docs_build/dev/PROJECT_INSTRUCTIONS.md
- git diff --check HEAD~1 HEAD -- docs_build/dev/PROJECT_INSTRUCTIONS.md
- git diff --name-only HEAD~1 HEAD -- "*.css" "*.html" "*.js"
- git diff --name-only HEAD~1 HEAD -- GameFoundryStudio tools admin Admin account Account company Company games Games samples Samples index.html
- git diff --name-only HEAD~1 HEAD

## Static Validation Results
PASS - Theme Surface Boundary section exists in docs_build/dev/PROJECT_INSTRUCTIONS.md.
PASS - Boundary section names both GameFoundryStudio/assets/css/theme/v2 and src/engine/theme ownership.
PASS - HEAD~1..HEAD changed only docs_build/dev/PROJECT_INSTRUCTIONS.md.
PASS - No CSS files changed.
PASS - No HTML files changed.
PASS - No JavaScript files changed.
PASS - No GameFoundryStudio page files changed outside docs_build/dev/PROJECT_INSTRUCTIONS.md.
PASS - No Tools, Admin, Account, Company, Games, Samples, or root index page migration files changed.
PASS - git diff --check passed for docs_build/dev/PROJECT_INSTRUCTIONS.md and HEAD~1..HEAD.
WARN - Git reported the existing working-copy line-ending normalization warning during the pre-commit working-copy check; no whitespace errors were reported.

## Lanes
Executed:
- contract documentation/static validation because this PR changes governance text only.

Skipped:
- runtime, integration, engine, samples, and recovery/UAT because no CSS, HTML, JavaScript, runtime, engine, sample, or page behavior changed.

## Playwright Impact
Playwright impacted: No. This PR is docs/workflow only.

## Samples Decision
SKIP - No sample files or sample runtime behavior changed.

## Tests Intentionally Not Run
- No repo-wide tests were run.
- No tests outside GameFoundryStudio/docs scope were run.
