# PROJECT INSTRUCTIONS

You are working in a docs-first repo workflow.

Workflow:
PLAN_PR → BUILD_PR → APPLY_PR

# WORKFLOW & EXECUTION

## PR NAMING STANDARD

PR names MUST follow:

`PR_<YYJJJ>_<TEAM>_<###>-<short-description>`

Where:
- `YY` = year (2 digit)
- `JJJ` = Julian day (001-365)
- `TEAM` = required team ownership token from `docs_build/dev/PROJECT_MULTI_PC.txt`
- `###` = sequence for the day (001+)

Example:
- `PR_26171_ALPHA_065-message-studio-parent-child-table-foundation`
- `PR_26171_BETA_069-message-tts-profile-contract-alignment`
- `PR_26171_GAMMA_071-main-merge-conflict-recovery`

Branch names MUST mirror PR ownership:

`pr/<YYJJJ>-<TEAM>-<###>-<short-description>`

Branch examples:
- `pr/26171-ALPHA-065-message-studio-parent-child-table-foundation`
- `pr/26171-BETA-069-message-tts-profile-contract-alignment`
- `pr/26171-GAMMA-071-main-merge-conflict-recovery`

Rules:
- Must be unique per day
- Must be sortable
- `TEAM` is required
- `TEAM` ownership comes from `docs_build/dev/PROJECT_MULTI_PC.txt`
- Team ownership is independent of machine, workspace, laptop, desktop, or environment
- Description must be short and hyphenated
- Do NOT reuse old `PR_11_*` format for new PRs
- Existing PC/LAPTOP, desktop/laptop, workspace, environment, or machine-parity examples are historical only
- Future PR reports, recovery reports, validation reports, and manual validation notes must include TEAM ownership

## CHATGPT EXECUTION ROLE

ChatGPT no longer creates PLAN_PR, BUILD_PR, APPLY_PR docs, ZIP bundles, or implementation code.

ChatGPT repo workflow response formatting is governed by `OUTPUT RULES` and the newest explicit ChatGPT workflow sections below.

ChatGPT must not:
- create ZIP files
- reference ZIP delivery
- produce PLAN/BUILD/APPLY docs
- write implementation code unless explicitly requested

## CODEX EXECUTION ROLE

Codex creates:
- PLAN_PR docs
- BUILD_PR docs
- APPLY_PR docs when needed
- repo-structured ZIP bundles
- implementation changes
- Playwright/test updates when required
- review artifacts for ChatGPT code review

Codex must place detailed content in:
- `docs_build/pr/*`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/*`

## USER ROLE

User:
- runs Codex
- validates results
- commits approved changes
- uploads deltas/reports when ChatGPT review is needed

## RULES

- One PR purpose only
- Smallest scoped valid change
- BUILD must be one-pass executable
- No vague wording
- No repo-wide scanning unless required
- Do not expand scope beyond the PR
- Do not modify `start_of_day` folders unless requested

## WORKSTREAM BRANCH EXECUTION GUARD

Before any BUILD execution, Codex must verify the current git branch.

Rules:
- Approved execution branches are:
  - `main`
  - approved team workstream branches
- Approved team workstream branch format:
  - `team/<TEAM>/<workstream>`
- Workstream branch examples:
  - `team/ALPHA/game-hub`
  - `team/BETA/messages`
  - `team/GAMMA/admin`
- The repository must be clean before file changes.
- The current branch must not be detached HEAD.
- The current branch must have an origin upstream unless a new PR branch has just been created from an approved execution branch.
- Local branch HEAD must match origin branch HEAD when an origin upstream exists.
- TEAM ownership must match the approved workstream branch and requested PR scope.
- PR scope must stay inside TEAM ownership.
- If the current branch is neither `main` nor an approved team workstream branch:
  - HARD STOP.
  - Do not create code changes.
  - Do not create implementation PRs.
  - Do not create ZIP artifacts.
  - Do not continue execution.
- If the repository is dirty, HARD STOP.
- If the current branch is detached HEAD, HARD STOP.
- If local branch HEAD does not equal origin branch HEAD when an origin upstream exists, HARD STOP.
- If the current branch is ahead of origin or has unpushed commits, HARD STOP.
- If TEAM ownership mismatches the branch or scope, HARD STOP.
- If cross-team scope is attempted without explicit Master Control assignment, HARD STOP.
- Codex must report:
  - current branch
  - expected branch (`main` or approved `team/<TEAM>/<workstream>`)
  - local branches found
  - upstream branch
  - local/origin sync PASS/FAIL
  - TEAM ownership PASS/FAIL
- Codex may continue only after the user explicitly moves to `main` or an approved team workstream branch and all guard checks pass.

Exception:
- Explicit branch-audit or branch-comparison PRs may inspect unapproved branches but must not perform implementation work on them.

Required report output:
- Current branch
- Expected branch
- Upstream branch
- Local/origin sync PASS/FAIL
- TEAM ownership PASS/FAIL
- Branch validation PASS/FAIL

## SLIDER VALUE VISIBILITY REQUIREMENT

All user-adjustable slider controls must display their current value while being adjusted.

Rules:
- Value display must update live during drag/input.
- Creators must not need to release the slider to see the value.
- Value display must remain visible at all times.
- Value display must not rely solely on browser-native tooltips.
- Sliders should prefer:
  - Label + Slider + Current Value
- Example:
  - `Contrast    [------^------] 40%`
  - `Saturation  [------^------] 75%`
  - `Hue Shift   [------^------] +15°`
- Units should be displayed when meaningful:
  - `%`
  - degrees
  - pixels
  - milliseconds
  - volume
  - opacity
- Floating thumb tooltips are optional.
- Persistent visible values are required.
- Applies to:
  - Toolbox tools
  - Game Hub controls
  - Account/Admin pages
  - Theme V2 controls
  - Future tools and pages

## SLIDER RESET BEHAVIOR REQUIREMENT

All user-adjustable sliders must support reset-to-default behavior.

Rules:
- Double-clicking a slider resets it to its default value.
- Reset must occur immediately.
- Reset value must be visible through the live value display.
- Creators must not need a separate reset button for individual sliders.
- Tool-specific Reset buttons may still exist for resetting multiple controls.
- Slider tooltips/help text should identify the default value when practical.
- Applies to:
  - Toolbox tools
  - Game Hub controls
  - Account/Admin pages
  - Theme V2 controls
  - Future tools and pages

## RULE PRECEDENCE

Newer appended sections override earlier overlapping rules.

When rules overlap, use the most specific current section as authoritative.

Conflicting workflow instructions must resolve to the newest explicit section.

Future governance additions should extend existing sections instead of duplicating overlapping guidance.

## GOVERNANCE CLOSEOUT

Docs-only PRs should prefer bundling with related docs/workflow cleanup when safe.

Stabilization/recovery lane rules supersede older generalized workflow assumptions.

Engine/tool/integration boundaries are authoritative for validation routing.

Hidden validation expansion is prohibited.

Workflow and testing language must not assume implicit persisted workspace, toolState, `localStorage`, `sessionStorage`, sample, or runtime state.

Required validation lane names are:
- contract
- runtime
- integration
- engine
- samples
- recovery/UAT

## PROJECT INSTRUCTIONS STABILITY AND MAINTENANCE MODE

`PROJECT_INSTRUCTIONS.md` is now considered architecturally stabilized.

Future additions should prefer targeted amendments instead of broad workflow rewrites.

New rules should extend existing authoritative sections whenever possible.

Avoid introducing parallel governance systems or duplicate rule sets.

Anti-drift governance:
- avoid capability drift across `src/`, deprecated `archive/v1-v2/tools/`, deprecated `archive/v1-v2/games/`, deprecated `archive/v1-v2/samples/`, and `toolbox/`
- avoid workflow drift across overlapping sections
- avoid validation drift between engine, tool, and integration lanes
- avoid UI/UX drift from Workspace V2 ecosystem contracts

Stabilization intent:
- governance exists to reduce monolith growth, hidden coupling, and duplicated runtime behavior
- reusable/shared capability should converge into `src/`
- first-class tools should converge toward shared Workspace V2 lifecycle behavior
- targeted validation is the preferred operational mode

Future guidance:
- future governance PRs should remain small and execution-backed
- implementation, runtime, and tool work should now take priority over additional governance expansion unless a real gap is discovered
- governance additions should solve demonstrated operational problems rather than hypothetical future issues

## NAVIGATION, LIST, AND TOOLBOX MODEL GOVERNANCE

Navigation menus, submenus, nested submenus, and user-facing lists must be alphabetically sorted when they are presented as browseable choices.

Primary top-level header navigation is an explicit product IA exception and must remain:
- Games
- Toolbox
- Marketplace
- Learn
- Account
- Admin

Allowed intentional-order exceptions:
- primary top-level header navigation
- Toolbox groups and tiles when they are presented as creator workflow surfaces
- workflow paths
- Build Path
- dependency paths
- Game Progress
- Launch Progress
- guided creator steps

Every intentional-order exception must be documented in the PR report that introduces or preserves it.

### Workflow Ordering Governance

When a surface represents a creator workflow, items are ordered by the likely next action, not alphabetically.
Workflow ordering is an approved exception to alphabetical ordering.
This applies to Toolbox, Game Hub, Create, Publish, Progress, and future guided workflows.

Rules:
- Order follows how users naturally work:
  - Select -> Create -> Review
  - Left -> Right
  - Top -> Bottom
- The next tile should represent the most likely next creator action.
- Tile ordering should minimize navigation decisions.

Create group order:
1. Game Hub
2. Game Crew
3. Game Configuration
4. Tags

Team planning distinction:
- Studio Team is the account-level roster.
- Game Crew is the game-level assignment surface.
- Current Toolbox implementation focus is Game Crew.
- Creator functionality that previously lived in Account/Team planning should be planned through Create/Game Crew when it is game-specific.

Toolbox status values are:
- Ready
- Wireframe
- Under Construction
- Planned
- Hidden
- Deprecated

Toolbox progress foundation fields are:
- `requiredForTestable`
- `requiredForPublish`
- `requires`
- `status`
- `progressChecklist`

Progress and Build Path views remain wireframe-only until a later implementation PR explicitly introduces a declared registry/data source and runtime behavior.

Game Hub is the next first real Toolbox rebuild target. Its contract owns:
- Project Identity
- Project Status
- Project Progress
- Launch Progress

Do not implement Game Hub runtime behavior, persistence, database behavior, authentication, or save/load flows before the rebuild PR explicitly scopes those capabilities.

## TOOL STATUS GOVERNANCE

The authoritative tool status values are:
- `planned`
- `wireframe`
- `beta`
- `complete`
- `deprecated`

Status definitions:
- `planned`: Not designed yet. No meaningful UI. No ownership defined.
- `wireframe`: Tool exists. User can understand workflow. Data ownership is defined. Not functionally usable.
- `beta`: Functionally usable. Can be used in a real game. May still contain incomplete workflows, placeholder data, UI cleanup issues, unused fields, missing validation, or incomplete code review.
- `complete`: Functionally usable. Code reviewed. Dead code removed. Invalid fields removed. UI cleaned up. No known placeholder data. No known invalid controls. Ready for long-term support.
- `deprecated`: Tool remains supported but is not recommended for new workflows. Must remain deprecated before removal.

UAT rule:
- A tool required for the current MVP game path must be `beta` or `complete` before UAT.
- `complete` is not required for MVP UAT, but `beta` is the minimum usable state.

## TARGETED MSJ VALIDATION GOVERNANCE

Every tool, page, or `src/` change must declare its impacted MSJ/test lane.

Run only the affected MSJ/test lane by default.

Do not run the full suite for small scoped changes unless one of these shared surfaces changes:
- shared runtime behavior
- shared parser behavior
- shared DB behavior
- shared Theme V2 behavior
- cross-tool integration behavior

If a shared source file changes, name the affected dependent lanes and run only those targeted lanes unless the dependency impact proves broader validation is required.

Reports must state:
- impacted lane
- skipped lanes
- why skipped lanes were safe to skip
- when the full suite is required

## SHARED MOCK DB ADAPTER CONTRACT

All current app and tool mock data must flow through the shared DB adapter under `src/engine/persistence`.

Tools must not maintain isolated page-local DB snapshots for data that should be visible to the Mock DB viewer or to another current tool.

The active browser mock implementation is the Mock adapter. UAT and production persistence must swap through the same module-level contract by deployment configuration rather than by changing tool UI code.

The Mock DB viewer must render live adapter state and table schemas, including empty tables with headers. It must not render hardcoded table dumps, hardcoded row counts, or copied static JSON snapshots.

Audit ownership is users-only: every shared table record uses `key`, `createdAt`, `updatedAt`, `createdBy`, and `updatedBy`; the ownership fields reference `users.key`. Roles are modeled with `roles` and `user_roles`.

## DB-BACKED PRODUCT DATA SSOT GOVERNANCE

Web UI must access product data only through API or service contracts backed by DB adapters.

Allowed production flow:
- Web UI -> API/Service Contract -> Server DB

Allowed dev/UAT/test flow:
- Web UI -> API/Service Contract -> DB Adapter
- The DB Adapter may be MEM DB, Local DB, Test DB, or Server DB.

Prohibited product-data ownership:
- page-local product data arrays
- page-local metadata registries
- hardcoded product counts
- duplicated status, group, path, or order data
- duplicated lookup maps that compete with DB-backed metadata
- browser storage as the product source of truth
- UI-only vote, order, or status state
- direct DB-shaped product data embedded in HTML or browser JavaScript pages

Toolbox and Admin tool metadata must use a shared DB-backed tool metadata source for `toolKey`, `toolName`, `group`, `path`, `order`, and `status`. Browser pages may render metadata returned by the API/service contract, but they must not own a separate runtime copy of that metadata.

## DATABASE DIRECTION

SQLite is deprecated.
Postgres is authoritative.

Rules:
- New database work must target Postgres.
- Local API -> Postgres is the required direction.
- New PRs must not introduce SQLite persistence.
- Do not add new SQLite services.
- Do not add new SQLite DDL.
- Do not add new SQLite seed data.
- Do not add new SQLite runtime persistence.
- Legacy SQLite references may remain only as documented technical debt when they already exist.
- Browser code must not own product data or generate authoritative persistence keys.

## DEV RUNTIME BOUNDARY

All mock/dev-only runtime implementation must live under `src/dev-runtime/`.

Required dev-runtime folders:
- `src/dev-runtime/auth/`
- `src/dev-runtime/persistence/`
- `src/dev-runtime/admin/`
- `src/dev-runtime/testing/`
- `src/dev-runtime/guest-seeds/`

Rules:
- UAT/PROD must never import, bundle, or deploy `src/dev-runtime/`.
- Active tools must use declared runtime contracts and must not import `src/dev-runtime/` directly.
- Dev-only adapters may be exposed through existing dev/runtime contract shims only when the deployment boundary keeps `src/dev-runtime/` out of UAT/PROD bundles.
- No fallback auth, session, user, admin, or system user data is allowed.
- Local session state must resolve selected users and roles from persisted Memory DB `users`, `roles`, and `user_roles` records.
- Missing users or roles must fail visibly with actionable diagnostics.

## ENVIRONMENT CONFIGURATION GOVERNANCE

Runtime startup loads `.env` only.

The following files are copy-source files only:
- `.env.dev`
- `.env.ist`
- `.env.uat`
- `.env.prd`

Valid deployment targets are:
- `DEV`
- `IST`
- `UAT`
- `PRD`

Manual deployment-target flow:
1. Copy the selected `.env.<target>` file to `.env`.
2. Run validation.
3. Apply DDL/DML migrations.
4. Start runtime.

Runtime environment parameters are prohibited.

Do not introduce runtime parameters such as:
- `--env`
- `--environment`
- `ENVIRONMENT=DEV`
- `ENVIRONMENT=UAT`
- `ENVIRONMENT=PRD`

`DEV`, `IST`, `UAT`, and `PRD` are deployment targets, not application behaviors.

Application code, runtime code, API/service code, and DB runtime scripts must not branch behavior by deployment target name.

## RUNTIME SCRIPT NAMING GOVERNANCE

Active runtime script names should describe capability rather than vendor/provider.

Preferred runtime naming nouns are:
- `auth`
- `database`
- `storage`
- `telemetry`
- `api`

Avoid provider or vendor names in future active runtime script names.

When an active script is renamed, a temporary compatibility wrapper may remain only when needed for command continuity.

Compatibility wrappers must log:

`Deprecated script name. Use <new-name>.`

## ARCHIVED V1/V2 REFERENCE MATERIAL

Deprecated V1/V2 reference material lives under:

- `archive/v1-v2/tools/`
- `archive/v1-v2/games/`
- `archive/v1-v2/samples/`

Rules:
- Archive material is retained for reference and traceability, not active app ownership.
- Active app navigation must not point users into `archive/v1-v2/`.
- Active validation must not run tests against `archive/v1-v2/` unless a later PR explicitly reclassifies a target.
- New toolbox, game, sample, engine, and Theme V2 work must not use archived material as the implementation source of truth.
- Cleanup and governance docs should refer to archived V1/V2 reference material through `archive/v1-v2/`.

## GAMEFOUNDRYSTUDIO NORTH STAR

GameFoundryStudio should present as an open-web creator destination where players and makers can move fluidly between creator tools, playable games, marketplace assets, tutorials, cloud saves, and community discovery.

The product guidance phrase is:

`Build · Play · Share`

Use that phrase as a compact IA and copywriting anchor:
- Build: tools and creation flow, including asset creation, prototypes, systems, and publishing preparation.
- Play: games and discovery, including playable games, arcade browsing, testing, and saves.
- Share: public game pages, share links, creator profiles, marketplace assets, tutorials/community, ratings, and future publish/export flows.

## GAMEFOUNDRYSTUDIO THEME V2 GOVERNANCE

`assets/theme-v2` is the only approved styling surface for public/root GameFoundryStudio page work as bounded below.

V1/legacy CSS is deprecated and out of play.

### Theme Surface Boundary

`assets/theme-v2/css` owns public/root GameFoundryStudio page styling:
- root Home
- Company pages
- Tools index
- public/root tool pages
- marketing/content surfaces
- placeholder Admin/Account pages until DB/login implementation

`src/engine/theme` owns engine/runtime first-class tool shell styling:
- runtime tool shell
- engine-facing first-class tools
- reusable runtime UI foundations

Rules:
- Do not deprecate `src/engine/theme` at this time.
- Do not duplicate behavior between the two surfaces.
- Do not create competing `.tool-shell` implementations.
- If both public/root tools and runtime first-class tools need the same behavior, document the shared shell contract first.
- Shared behavior must be promoted intentionally rather than patched independently in both places.
- Collapse/rail behavior currently belongs only to the public/root `.tool-workspace` shell unless a later PR explicitly promotes it to shared runtime shell behavior.

### Theme V2 Only CSS Rule

- Theme V2 is the only active styling system for public/root GameFoundryStudio page work.
- V1/legacy CSS is deprecated and out of play.
- V1/legacy CSS must not be used as a source.
- V1/legacy CSS must not be copied.
- V1/legacy CSS must not be ported.
- V1/legacy CSS must not be compared as the desired target.
- V1/legacy CSS must not be extended.
- V1/legacy CSS must not be reintroduced through aliases, duplicate selectors, wrapper selectors, compatibility classes, or fallback imports.
- New CSS must be authored directly in Theme V2 only when approved as reusable Theme V2 design-system styling.
- Pages not migrated to Theme V2 may temporarily retain their existing references until their migration PR.
- Pages that have migrated to Theme V2 must not reference V1/legacy CSS.
- Migration means replacing the page with Theme V2 usage, not copying V1 styles into Theme V2.

If Theme V2 lacks a needed pattern:
1. Document the design-system gap.
2. Request approval.
3. Implement the reusable pattern directly in Theme V2.
4. Do not solve it by using V1.

Rules:
- Do not extend deprecated CSS.
- Do not create new CSS files outside `assets/theme-v2/css`.
- No page-local CSS.
- No tool-local CSS.
- No inline style attributes.
- No `<style>` blocks.
- No JavaScript-generated styling except toggling approved Theme V2 classes.
- No hardcoded colors.
- No hardcoded spacing.
- No hardcoded borders.
- No hardcoded shadows.
- No hardcoded font sizes.
- No hardcoded z-index values.
- No duplicate component styling.
- No copy/paste, porting, aliasing, or wrapper recreation of deprecated selectors into Theme V2.
- No one-off classes for a single page or tool unless approved and promoted into Theme V2.
- New UI work must first attempt to use existing Theme V2 tokens and classes.
- Missing styling requirements must be reported as design-system gaps.
- Design-system gaps should be documented rather than solved locally.

Allowed:
- Adding approved reusable Theme V2 tokens.
- Adding approved reusable Theme V2 component classes.
- Toggling approved Theme V2 classes from JavaScript.
- Ownership cleanup inside Theme V2.
- Consolidation inside Theme V2.
- Removing deprecated dependencies.
- Migrating page families to Theme V2.
- Documenting historical legacy behavior.

### Theme V2 File Ownership

All reusable public/root GameFoundryStudio styling must live under:

`assets/theme-v2/css/`

Approved styling surfaces:
- `theme.css`
- `colors.css`
- `controls.css`
- `typography.css`
- `spacing.css`
- `buttons.css`
- `forms.css`
- `panels.css`
- `accordion.css`
- `status.css`
- `tables.css`
- `dialogs.css`
- `layout.css`

Rules:
- Public/root pages consume `assets/theme-v2`.
- Public/root tools consume `assets/theme-v2`.
- Pages do not define styling.
- Tools do not define styling.
- New CSS files outside `assets/theme-v2/css` are prohibited.
- Styling requests should be implemented as reusable Theme V2 patterns.
- Missing patterns must be documented as design-system gaps.
- No page-specific styling unless approved and promoted into Theme V2.

### Design System Gap Process

When a style is missing:
1. Document the gap.
2. Identify affected pages/tools.
3. Request approval.
4. Add the approved reusable Theme V2 pattern directly in Theme V2.
5. Reuse everywhere.
6. Do not implement locally or solve it by using V1/legacy CSS.

### Theme V2 Consolidation Rule

During migration, allowed:
- ownership cleanup inside Theme V2
- consolidation inside Theme V2
- removing deprecated dependencies
- migration of page families to Theme V2
- documentation of historical legacy behavior

During migration, not allowed:
- restoring legacy CSS
- copying, porting, or using V1/legacy CSS as a source
- comparing V1/legacy CSS as the desired target
- reintroducing deprecated selectors through aliases, duplicate selectors, wrapper selectors, compatibility classes, or fallback imports
- creating new component designs
- creating new visual patterns
- creating new utility systems
- creating new color systems
- creating new layout systems

If a required pattern does not exist:
1. Document it as a Design System Gap.
2. Request approval before implementation.
3. Implement it directly in Theme V2 after approval.
4. Do not solve it by reactivating, copying, porting, or extending V1/legacy CSS.

Exception documentation is required for any approved deviation and must include:
- File.
- Reason.
- Follow-up plan.

Migration order:
1. Home
2. Company pages
3. Admin pages
4. Account pages
5. Tools index
6. Tool families
7. Games
8. Samples

Do not migrate pages during governance-only PRs unless the PR explicitly authorizes migration work.

## FILE SCOPE GUARD

Allowed change scope is PR-specific.

Unless a PR states otherwise, keep changes limited to:
- `toolbox/preview-generator-v2/*`
- `common/*`
- `docs_build/dev/reports/*`

Do not modify unrelated files.

## OUTPUT RULES

ChatGPT MUST output ONLY:

1. Codex command
2. Commit comment
3. What Playwright is testing
4. What to test manually

ChatGPT responses must:
- print a little detail about the PR, 1–3 lines only
- not present options
- assume correct path and proceed
- not create ZIPs
- not reference ZIP delivery
- keep chat response minimal

### ChatGPT Copy Control Output Rule

ChatGPT must provide the Codex command in a copy-button control/code block.

ChatGPT must provide the commit comment in a copy-button control/code block.

This applies to every repo workflow response.

Keep the existing four-part ChatGPT output format unchanged.

### ChatGPT Repo Response Format Standard

ChatGPT repo workflow responses must always use this order:
1. PR detail summary
2. Codex command control
3. Commit comment control
4. What Playwright is testing
5. What to test manually

The compact PR detail summary is limited to 1-3 short lines.

The Codex command and commit comment must each be in separate copy-button controls/code blocks.

Maintain the existing four-part required output contract.

Repo workflow responses should remain compact and minimal.

No extra optional sections are allowed unless explicitly requested.

Do not reference ZIPs in normal ChatGPT repo workflow replies.

Controls must remain copy-friendly and human-readable.

### ChatGPT Workflow Governance Consistency

ChatGPT repo workflow responses are governed by `docs_build/dev/PROJECT_INSTRUCTIONS.md` as the source of truth.

ChatGPT must not drift from the required response ordering.

ChatGPT must not omit required sections.

ChatGPT must keep the Codex command and commit comment in dedicated copy-button controls/code blocks.

ChatGPT must not add ZIP delivery language to standard repo workflow replies.

Repo workflow replies must remain concise and operational.

ChatGPT workflow governance follows `RULE PRECEDENCE` and `GOVERNANCE CLOSEOUT`.

Repo workflow output formatting is part of the enforced workflow contract.

## COMMIT COMMENT FORMAT

Format:

`<description> - <PR info>`

Example:

`Normalize palette contract to manifest SSoT and remove tool-level schema drift - PR_26124_001-palette-baseline`

# TESTING & VALIDATION

## PLAYWRIGHT VALIDATION REQUIREMENT

Every PR must state:

`Playwright impacted: Yes/No`

Playwright impacted is Yes when the PR changes:
- tool runtime behavior
- UI controls or interactions
- workspace or toolState flows
- capture or rendering paths

If Playwright impacted is Yes:
- `npm run test:workspace-v2` must pass.
- the Playwright section must state what behavior is validated
- the Playwright section must state expected pass behavior
- the Playwright section must state expected fail behavior

If Playwright impacted is No:
- include `No Playwright impact. This PR is docs/workflow only.`
- for pure refactors, justify why behavior is unchanged

Playwright is not required for:
- docs-only PRs
- naming/formatting-only PRs
- pure refactors with no behavior change, when justified

Default Playwright command:

`npm run test:workspace-v2`

Playwright is the required validation gate for Workspace V2 and toolState work.

The full samples smoke test rule remains separate and runs only when broadly impacted.

## CODEX REVIEW DIFF REQUIREMENT

Every Codex PR must produce review artifacts so ChatGPT can review the exact code changes.

Codex must create:

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

`codex_review.diff` must contain:
- `git diff --cached`
- or, if files are not staged, `git diff`

`codex_changed_files.txt` must contain:
- `git status --short`
- `git diff --stat`

Rules:
- Do not add pre-commit hooks
- Do not pause commits
- Do not add dependencies
- Do not change runtime behavior just to create review artifacts

When user asks for code review, they should upload:
- PR delta ZIP
- `codex_review.diff`
- `codex_changed_files.txt`

## MANUAL TEST REQUIREMENT

Every PR must include:
- exact manual validation steps
- expected outcome
- any known out-of-scope checks

Manual test steps must not claim sample launch is required until sample JSON files are schema-compliant.

Current sample validation rule:
- sample launch is out-of-scope until sample JSON is updated to match schema
- sample validation will happen in a dedicated sample alignment phase

## NEXT RESOLUTION RULES

If the user says `NEXT`:

1. Look for the highest completed or referenced PR in the conversation.
2. Increment to the next logical PR using the current PR naming standard.
3. If sequence is unclear, STOP and ask for clarification.

Use the current naming standard:

`PR_<YYJJJ>_<TEAM>_<###>-<short-description>`

Do NOT continue old `PR_11_*` naming for new work.

## ONE-SHOT EXECUTION RULE

If the user says:

`Run full workflow for <PR_NAME>`

or:

`NEXT`

Then ChatGPT must:

Determine the next PR and follow `OUTPUT RULES`, `ChatGPT Repo Response Format Standard`, and `ChatGPT Workflow Governance Consistency`.

Do not ask for confirmation unless ambiguity exists.

## ZIP CREATION OWNERSHIP

ZIP creation is handled by Codex only.

ChatGPT must not:
- create ZIP files
- link ZIP files
- reference ZIP delivery as something ChatGPT produced

Codex must produce ZIP artifacts when required by the repo workflow.

## CODEX ZIP STANDARD

Codex ZIPs must:
- be repo-structured
- preserve exact repo-relative paths
- be placed under `<project folder>/tmp/`
- use the PR name in the ZIP filename
- contain no extra files outside the defined structure

Before Codex returns any ZIP, Codex must:
1. Physically create the ZIP file.
2. Verify the file exists on disk.
3. Verify file size > 0.
4. List contents to confirm correct repo structure.
5. Use a new filename for every attempt.
6. Place ZIP under `<project folder>/tmp/`.
7. Never reuse a previous file handle or path.

## TMP DIRECTORY OWNERSHIP

`tmp/` is user-facing artifact output only.

Codex may place only final ZIP artifacts in `tmp/` unless explicitly instructed otherwise.

Codex must not use `tmp/` as:
- scratch workspace
- temp extraction directory
- intermediate build output
- report staging area
- cache location

Reports remain under `docs_build/dev/reports`.

Runtime temp data must use proper temporary or system locations outside repo `tmp/`.

Every ZIP filename must remain unique.

`tmp/` should stay clean and human-readable.

Nested temporary directories inside `tmp/` are prohibited.

Loose files in `tmp/` are prohibited except approved final artifacts.

Generated review artifacts do not belong in `tmp/`.

## FAILURE HANDLING

If ZIP delivery fails more than once:

- Do NOT retry with the same name.
- Generate a new filename with timestamp.
- Rebuild ZIP from scratch.
- If still failing, STOP and provide inline content for manual application.

## EXECUTION DEFAULTS

### ALWAYS CONTINUE

- Never pause for confirmation.
- Never present optional branches.
- Always proceed to the next logical step.
- Assume approval unless blocked.

### NO COMMIT-ONLY PRs

- Roadmap lives at: `docs_build\dev\roadmaps\MASTER_ROADMAP_ENGINE.md`
- Only one roadmap.
- PRs must remain testable through validation appropriate to their scope.
- Roadmap updates must be status-only unless explicitly requested.
- Valid roadmap status transitions:
  - `[ ]` → `[.]`
  - `[.]` → `[x]`

Docs-only PR bundling follows `GOVERNANCE CLOSEOUT`.

Do not add unrelated runtime, sample, or roadmap changes just to make a docs-only PR executable.

## PRODUCTIZATION RULES

- Do not create standalone showcase tracks in future roadmaps.
- Fold showcase importance into the main feature or sample title when needed.

## ROADMAP INSTRUCTION MOVE GUARDS

- If roadmap content is moved to `PROJECT_INSTRUCTIONS.md`, move it and do not delete it without relocation.
- Ensure destination text exists before removing the source text.
- Preserve wording unless the PR explicitly requires rewriting.
- Keep roadmap handling status-only unless explicitly requested otherwise.
- Do not delete roadmap content during cleanup work.
- Do not modify roadmap content during cleanup work.
- Only update status `[ ]`, `[.]`, `[x]` in roadmap content during cleanup work.

## EXECUTION EFFICIENCY

- Bundle PRs whenever it is safe and testable to reduce overall timeline and churn.
- Prefer fewer, higher-quality PR bundles over many small retries.
- Never ask whether to create the next Codex PR; assume it is required.
- Choose the correct path automatically.
- Reduce options presented.
- Complete the task fully and correctly.
- Update roadmap status every PR when execution-backed.
- Every PR must be testable.

## TESTING RULES

Full samples smoke test takes about 20 minutes.

Do NOT run full samples test by default.

Samples validation is on-request or affected-sample only.

Run full samples test ONLY when:
- shared sample loader/framework is modified
- change impacts multiple samples broadly
- correctness cannot be verified with targeted tests

Full samples smoke remains manual/on-request unless the PR broadly impacts sample loading, shared sample framework behavior, or multiple sample runtimes.

Prefer targeted validation:
- syntax checks for changed files
- `npm run test:workspace-v2`
- engine-specific tests when engine/shared runtime code changes
- affected tool-specific tests
- affected sample-specific tests only when sample JSON is in scope

Tool tests may use games that exercise the refined tool as targeted fixtures only; do not expand those checks into broad game validation unless the PR changes game/runtime behavior.

### Engine Test Lane

The engine test lane validates engine/shared runtime behavior independently from tool validation.

Engine runtime changes require engine validation before tool validation.

Shared runtime/framework changes may trigger broader validation when they affect multiple engine surfaces, tools, games, or samples.

PRs that change engine/shared runtime or framework code must name the affected engine surface in the validation plan.

Affected engine surfaces include:
- rendering pipeline
- asset loading
- input systems
- audio runtime
- physics/runtime timing
- shared manifest/runtime parsers

Tool tests must not validate unrelated engine behavior.

Workspace V2 tests validate contract behavior only; they are not engine-runtime acceptance tests.

Targeted tool tests remain the primary default for tool-only PRs.

Affected game fixtures are optional targeted validation only.

Samples are never implicit validation gates.

Engine test matrix expectations:
- name the affected engine surface
- name the targeted engine validation command or manual check
- name the fixture, manifest, or runtime input source
- include one valid path and one failure path when applicable
- state PASS/FAIL/WARN/SKIP criteria
- identify dependent runtime, integration, or samples lanes that are in scope

Engine validation expands lane scope when a shared runtime API, shared parser, timing model, asset path rule, input contract, rendering contract, audio contract, or physics/runtime timing behavior changes.

Tool validation alone is insufficient when the changed behavior lives in engine/shared runtime code, changes a shared runtime contract, or could affect more than one tool, game, or sample through a shared dependency.

### Engine Runtime And Shared Infrastructure Governance

This section is authoritative for engine/runtime/shared infrastructure ownership, boundaries, escalation, and validation routing.

Engine ownership:
- renderer: owns rendering pipeline setup, frame output, render lifecycle behavior, and render failure handling
- audio runtime: owns playback/runtime paths, audio graph behavior, runtime audio state, and audio failure handling
- input system: owns input dispatch, normalized input state, focus routing, and invalid input rejection
- timing/frame scheduler: owns frame cadence, pause/step behavior, deterministic timing, and runtime tick boundaries
- collision/runtime math: owns collision helpers, spatial/runtime math, deterministic math utilities, and edge-case math behavior
- asset loading: owns asset path resolution, loading behavior, missing asset handling, and no-silent-fallback behavior
- manifest/shared parser: owns shared manifest/runtime parser contracts, valid payload acceptance, and invalid payload rejection
- shared runtime utility: owns reusable runtime helpers consumed by multiple tools, games, samples, or engine surfaces

Boundary rules:
- engine/runtime services flow from engine/shared infrastructure to tools
- tools consume engine/runtime services but do not reimplement them
- tools must not duplicate engine logic locally
- tools must not create hidden runtime coupling with other tools
- shared runtime behavior must not leak through tool-specific abstractions
- tool-specific adapters may wrap stable engine contracts only when the adapter does not own engine behavior

`src/` shared capability growth governance:
- the authoritative term for reusable shared behavior is `src/` shared capability
- `src/` is the living shared foundation for reusable runtime, engine, utility, parsing, rendering, audio, input, timing, asset, and validation capabilities
- reusable behavior belongs in `src/` unless it is intentionally local and documented
- deprecated reference games, samples, and tools must not override, hide, shadow, or reimplement behavior that already exists in `src/`
- deprecated reference games, samples, and tools must not implement behavior that clearly belongs in `src/` just to avoid shared-source changes

Authoritative `src/` boundary rules:
- `src/` is the authoritative reusable implementation surface
- reusable logic should converge into `src/` over time
- `archive/v1-v2/tools/`, `archive/v1-v2/games/`, `archive/v1-v2/samples/`, and `toolbox/` are consumers or extensions of `src/`, not alternate engine layers
- `archive/v1-v2/tools/`, `archive/v1-v2/games/`, `archive/v1-v2/samples/`, and `toolbox/` must not become parallel runtime frameworks

Mandatory capability discovery rule:
- before Codex writes new behavior into deprecated `archive/v1-v2/tools/`, deprecated `archive/v1-v2/games/`, deprecated `archive/v1-v2/samples/`, or `toolbox/`, Codex must check whether equivalent or reusable capability already exists in `src/`
- Codex must reuse or extend existing `src/` capability when appropriate
- if capability belongs in `src/` but does not exist, Codex must state that and either add or update `src/` when PR scope authorizes it, or document the required `src/` follow-up instead of creating a local workaround

Mandatory reuse expectations:
- before creating new runtime behavior, Codex must check `src/`, existing shared utilities, and existing reusable services
- if equivalent functionality exists, Codex must reuse or extend it instead of duplicating it
- if reusable functionality is missing, Codex should prefer growing `src/` over creating local copies

Local implementation rules:
- local implementation is allowed only when behavior is truly game-specific, tool-specific, or sample-specific
- local implementations must justify why they are intentionally local
- temporary local implementations must identify required `src/` follow-up work
- local implementation must not mask a missing `src/` shared capability
- local implementation must not create shadow APIs competing with `src/`
- hidden capability forks are prohibited
- games, tools, and samples must not silently diverge from shared `src/` behavior

Prohibited no-shadow behaviors:
- local shared-capability fallbacks
- duplicate render, input, audio, physics, asset, timing, parser, or validation logic
- wrapper code that hides missing `src/` capability
- custom games, samples, or tools behavior that masks a `src/` gap
- shadow APIs that compete with `src/` APIs

Architectural intent:
- `src/` is intended to evolve and grow intentionally over time
- shared capabilities should mature upward into `src/`
- Codex should help identify reusable patterns and promote them into `src/` when appropriate
- stabilization and anti-monolith goals depend on strengthening shared `src/` ownership

Shared infrastructure rules:
- allowed shared infrastructure layers are engine/runtime services, shared manifest/runtime parsers, shared asset/input/audio/rendering helpers, shared validation helpers, and reusable non-tool-specific utilities
- circular dependencies between engine/shared infrastructure and tools are prohibited
- tool-to-tool runtime dependencies are prohibited unless an explicit integration contract names the handoff
- shared infrastructure must not depend on tool-specific UI, toolState payload shape, or tool-local diagnostics
- engine/runtime escalation is required when a change modifies shared infrastructure behavior or changes a shared runtime contract
- validation expands into engine lanes when changed shared infrastructure can affect more than one runtime, tool, game, sample, or parser consumer

Engine-impact classification expectations:
- classify a PR as engine-impacting when it changes renderer, audio runtime, input system, timing/frame scheduler, collision/runtime math, asset loading, manifest/shared parser, or shared runtime utility behavior
- name the affected engine surface and dependent lanes in the validation report
- run engine validation before dependent tool, integration, or samples validation when an engine surface changes

Required engine validation examples:
- renderer: render setup, visible output, render lifecycle behavior, and render failure handling
- audio runtime: playback/runtime path, audio graph behavior, runtime audio state, and failure handling
- input system: input dispatch, focus routing, normalized input state, and invalid input rejection
- timing/frame scheduler: deterministic timing, pause/step behavior, frame cadence, and tick boundary behavior
- collision/runtime math: deterministic collision/math output, spatial helper behavior, and edge-case handling
- asset loading: resolved asset paths, loading behavior, missing asset handling, and no silent fallback
- manifest/shared parser: valid payload acceptance, invalid payload rejection, and shared parser contract behavior
- shared runtime utility: utility behavior, failure handling, and dependent consumer expectations

Engine vs integration escalation rules:
- engine escalation is required when the changed behavior belongs to engine/shared runtime ownership
- integration escalation is required when the changed behavior is an explicit handoff between workspace, tools, manifest, palette, or toolState flows
- when both apply, run engine validation first, then targeted integration validation for affected handoffs
- targeted tool validation is insufficient when the changed behavior is shared, reused by multiple consumers, or changes engine/runtime contracts

### Workspace Contract Test Boundaries

Workspace V2 tests validate contract and lifecycle only.

Tool runtime behavior belongs to tool-specific Playwright suites.

Tests must not rely on shared hidden bootstrap assumptions.

Tests must explicitly declare required manifest, toolState, and runtime inputs.

Invalid payload rejection must be validated independently from tool rendering.

Shared setup utilities may assist launch and logging only.

Shared utilities must not inject hidden runtime state.

Runtime-only workspace state starts clean every run.

Automated tests must not depend on persisted workspace restoration.

Game fixtures are explicit opt-in validation targets only.

Cross-tool assertions are allowed only in dedicated integration tests.

Integration-test-only scope is limited to:
- workspace launch into tool
- manifest handoff
- palette propagation
- toolState open/save contracts

### Test Fixture Isolation And Determinism

Tests must execute deterministically.

No test may depend on prior `localStorage` or `sessionStorage` state.

No test may depend on execution order.

Tests must clean up runtime state after execution.

Each tool owns its tool-specific fixtures.

Shared fixtures must be explicit and versioned.

Hidden auto-generated fixture data is prohibited.

Runtime timestamps and random seeds must be controllable in tests.

Playwright tests must validate explicit expected outcomes.

Flaky retry masking is prohibited unless documented with the underlying failure mode and owner.

Fixture categories:
- minimal contract fixtures
- tool runtime fixtures
- integration fixtures
- affected game fixtures
- failure-case fixtures

Affected game fixtures are opt-in only.

Fixtures must declare required manifests and toolState inputs.

Deterministic runtime cleanup and isolation:
- each lane owns cleanup for runtime state it creates
- `localStorage` and `sessionStorage` must be cleared or namespaced before and after tests that touch them
- parallel tests must isolate browser context, storage keys, ports, output paths, and artifact names
- tests must not share mutable runtime state across workers unless the shared state is the explicit subject under test

Fixture naming and versioning:
- fixture names must identify the owning lane or tool, scenario, and version
- shared fixtures must declare a version and owner
- fixture updates that change expected behavior must bump or clearly annotate the fixture version

Retry and timeout governance:
- hidden retries remain prohibited
- retries must identify the flaky test label, owner, and failure mode
- timeouts must be explicit, lane-appropriate, and documented when raised above the local default
- timeout increases must not hide missing readiness, cleanup, or fixture isolation defects

Validation runtime budget guidance:
- targeted validation should prefer the narrowest command that proves the affected lane
- long-running validation must state why the extra runtime is necessary
- reports must identify skipped long-running lanes and the reason they were skipped

### Test Failure Reporting Contracts

Failure reports must identify the exact tool, fixture, and runtime surface for every `FAIL` or `WARN`.

Shared failures must identify the root shared dependency.

Playwright output must separate:
- contract failures
- runtime failures
- integration failures
- fixture failures

Screenshots, traces, and logs are owned by the tool or lane that produced them.

Test artifacts must be grouped by tool or lane.

Hidden retries and silent reruns are prohibited.

Flaky tests must be explicitly labeled.

Required reporting fields:
- tool name
- fixture name
- manifest/toolState source
- runtime surface
- expected behavior
- actual behavior
- PASS/FAIL/WARN/SKIP

Batch runs continue on isolated failures when possible.

Unrelated tool failures must not block targeted validation lanes.

Integration lanes are the only allowed cross-tool blockers.

Reports must clearly identify whether samples were skipped.

### Validation Lane Routing And Blockers

Targeted PRs execute only affected validation lanes by default.

Full Workspace V2 suite validation is not the default for every PR.

Validation reports must state why each lane was executed.

Lane expansion must be justified in reports.

Hidden validation expansion is prohibited.

Engine or runtime changes may expand validation scope when they affect dependent lanes.

Unrelated failures are `WARN` unless they are explicitly in scope.

Lane ownership:
- contract: manifest, toolState, workspace lifecycle, and validation contract behavior
- runtime: tool-specific runtime behavior and user-facing tool interactions
- integration: explicit cross-tool or workspace handoff behavior
- engine: engine/shared runtime behavior and dependent runtime surfaces
- samples: validation for affected samples when samples scope is active
- recovery/UAT: explicitly requested recovery or user-acceptance validation lanes

Blocker classification rules:
- targeted tool failures block the targeted lane only
- engine failures block dependent lanes
- integration failures block the integration lane only
- failures in the samples lane block only when samples scope is active
- flaky failures cannot automatically escalate to global blockers

Shared-runtime blocker escalation requires identifying the root shared dependency, affected dependent lanes, and the reason the shared dependency blocks those lanes.

Integration-lane escalation is allowed only when an explicit cross-tool, workspace handoff, manifest handoff, palette propagation, or toolState open/save contract is in scope.

Tool tests must not validate unrelated engine behavior.

Boundary ownership surfaces:
- engine owns rendering pipeline, asset loading, input dispatch, audio runtime, physics/runtime timing, shared manifest/runtime parsers, and shared runtime services
- tools own tool UI, tool-specific state, toolState payload interpretation, tool-specific runtime behavior, preview/export actions, and tool diagnostics
- integration owns workspace launch into a tool, manifest handoff, palette propagation, toolState open/save contracts, and explicit cross-tool handoffs

Affected-engine-surface classification rules:
- classify a change as engine-affecting when it modifies shared runtime code, shared parsers, shared asset/input/audio/rendering/physics behavior, or engine-facing runtime contracts
- classify a change as tool-only when it uses stable engine contracts without modifying shared runtime behavior
- if classification is ambiguous, name the likely engine surface and run engine validation before dependent tool validation

Integration escalation rules:
- escalate from tool to integration only when the PR changes a workspace handoff, manifest handoff, palette propagation, toolState open/save contract, or explicit cross-tool workflow
- integration escalation must name the source lane, target lane, handoff contract, and expected behavior
- integration failures block only the integration lane unless an identified shared dependency also blocks a dependent lane

Shared runtime boundary rules:
- shared runtime changes must not be accepted solely through one affected tool test
- shared parser changes require validation of valid and invalid payload handling before dependent tool validation
- shared runtime failures must identify the root shared dependency and every dependent lane that is blocked

### Targeted Validation Execution Templates

Targeted execution is the default operating mode.

Validation scope should remain intentionally narrow unless lane expansion is justified in the report.

Broad validation requires explicit reasoning tied to changed files, changed runtime surfaces, or changed handoff contracts.

Future workflow additions should extend these templates instead of introducing parallel rule systems.

Required PR evidence expectations:
- why a lane executed
- why a lane was skipped
- why samples validation was skipped or included
- expected blocker scope
- expected PASS/WARN behavior

Targeted validation report template:
- lanes executed: `<lane> - <reason>`
- lanes skipped: `<lane> - <reason>`
- samples decision: `RUN` or `SKIP` with reason
- blocker scope: targeted lane, dependent lanes, integration lane, samples lane when active, or recovery/UAT lane
- expected PASS behavior: exact behavior or document state that must pass
- expected WARN behavior: unrelated, advisory, skipped, or pre-existing behavior that must not block the targeted lane

Docs-only validation example:
- lanes executed: contract documentation/static validation because only workflow docs changed
- lanes skipped: runtime, integration, engine, samples, recovery/UAT because no runtime, handoff, engine, samples, or recovery behavior changed
- commands: `git diff --check`; required text or anchor checks; `npm run codex:review-artifacts`
- samples decision: `SKIP` because docs/workflow changes do not affect samples
- blocker scope: docs/static validation only
- expected PASS/WARN behavior: PASS when docs diff and required anchors validate; WARN only for unrelated line-ending or pre-existing repository state

Targeted tool PR reporting example:
- lanes executed: runtime for the affected tool; contract only when manifest or toolState behavior changed
- lanes skipped: engine, integration, samples, recovery/UAT unless the PR changes those surfaces
- commands: changed-file syntax checks; affected tool-specific Playwright or validation command named by the PR
- samples decision: `SKIP` unless affected samples are explicitly in scope
- blocker scope: affected tool runtime lane only unless shared dependencies are identified
- expected PASS/WARN behavior: PASS when affected tool behavior matches expected outcomes; WARN for unrelated tool failures outside scope

Affected-tool validation example:
- use the smallest fixture set that exercises the changed tool behavior
- include valid payload behavior and failure behavior when applicable
- preserve fixture ownership and version expectations
- report selected fixture names and manifest/toolState sources

Engine/runtime PR reporting example:
- lanes executed: engine first, then dependent runtime or integration lanes only when named
- lanes skipped: unrelated tool and samples lanes unless affected by the changed engine surface
- commands: engine-specific tests or checks named by the PR, followed by dependent targeted validation when justified
- samples decision: `SKIP` unless the engine change broadly affects samples or affected samples are named
- blocker scope: engine lane plus dependent lanes identified in the report
- expected PASS/WARN behavior: PASS when engine surface validation and named dependent lanes pass; WARN for unrelated tool failures outside dependent scope

Engine-impact validation examples:
- rendering pipeline: validate render setup, visible output, and render failure handling for the affected surface
- asset loading: validate resolved asset paths, missing asset handling, and no silent fallback
- input systems: validate expected input dispatch, invalid input rejection, and focus or routing behavior
- audio runtime: validate playback/runtime path, failure handling, and no unrelated UI assertions
- physics/runtime timing: validate deterministic timing, pause/step behavior, and failure reporting
- shared manifest/runtime parsers: validate valid payload acceptance and invalid payload rejection before dependent tool validation

Integration PR reporting example:
- lanes executed: integration for explicit handoff contract; contract or runtime lanes only when changed
- lanes skipped: engine and samples unless the integration change depends on those surfaces
- commands: targeted integration check for workspace launch, manifest handoff, palette propagation, or toolState open/save contract
- samples decision: `SKIP` unless samples are explicitly named as integration fixtures
- blocker scope: integration lane only unless a root shared dependency is identified
- expected PASS/WARN behavior: PASS when the handoff contract succeeds and invalid handoff cases fail visibly; WARN for unrelated tool runtime failures

Integration-lane validation examples:
- workspace launch into tool: validate selected tool opens with declared manifest/toolState inputs
- manifest handoff: validate exact manifest fields consumed and invalid payload rejection
- palette propagation: validate active palette source and no hidden persisted workspace state
- toolState open/save contracts: validate saved payload shape, open behavior, and invalid payload rejection

Recovery-lane stabilization reporting example:
- lanes executed: recovery/UAT plus targeted contract/runtime/integration lanes named by the stabilization scope
- lanes skipped: engine or samples unless the recovery scope names affected engine surfaces or samples
- commands: targeted recovery validation commands named by the PR, plus required static checks for changed files
- samples decision: `SKIP` until sample-alignment scope is active or affected samples are named
- blocker scope: recovery/UAT lane and explicitly named dependent lanes
- expected PASS/WARN behavior: PASS when recovery checklist items pass; WARN for unrelated failures that are classified outside recovery scope

Every PR must document:
- whether full samples test was skipped or run
- reason for decision

# RUNTIME & BEHAVIOR CONTRACTS

## WORKSPACE V2 CURRENT CONTRACT

Workspace manifest/toolState context is the runtime contract.

Rules:
- workspace state is runtime-only coordination data and must not persist to JSON, toolState payloads, game manifests, or workspace tool contracts
- game manifest root.tools is SSoT for persisted tool payloads
- no `workspaceSession`
- no `games[]`
- tools own all tool payloads
- no tool payloads at manifest root
- no hidden fallback data
- no silent defaults
- game manifest validation and toolState payload validation are the acceptance gates; no separate Workspace validation contract is required

Palette:
- exactly one active palette
- global workspace state
- lives at `tools.palette-browser`
- not a toolState
- not in Tool State Library
- baseline:
  - `tools.palette-browser.swatches = []`

Tool State:
- use `toolState`, not Workspace V2 “session” terminology
- saved tool states live under Workspace V2 tool state storage
- only one active tool state at a time
- toolState payloads must validate before use
- invalid toolState payloads must be rejected before render
- no partial render on invalid input
- no mutation of incoming payloadJson

Terminology:
- `savedSessions` → `savedToolStates`
- `activeSession` → `activeToolState`
- `sessionId` → `toolStateId`
- `Session Library` → `Tool State Library`
- `Workspace Session` → `Workspace Tool State`
- `Create Session + Launch` → `Create & Open Tool State`
- `New Session` → `New Tool State`
- `Load Fixture` → `Load Tool State`
- `session payload` → `tool state payload`
- `saved session` → `saved tool state`
- `active session` → `active tool state`

Do not rename unrelated browser/sessionStorage/auth/session concepts.

## SAMPLE JSON STATUS

Samples are intentionally out-of-scope until tools are complete.

Rules:
- Do not touch sample JSON unless the PR is explicitly a sample alignment PR.
- Do not require sample launch validation during tool completion.
- Do not claim sample launch works until sample JSON has been updated to schema.
- Sample validation will happen after tool completion.

# TOOL & ARCHITECTURE RULES

## TOOL COMPLETION RULES

During tool completion:
- use the audit as the source for remaining tool gaps
- include exact list of failing tools from the audit
- say which tools are being fixed in the PR
- update audit/report status when execution-backed
- do not fix unlimited tools in one PR
- bundle only when tools are similar, low-risk, and covered by Playwright

Every tool completion PR must include:
- failing tools before
- tools fixed
- remaining failures after
- Playwright result
- manual validation steps

Tool completion exit checklist:
- required toolState payloads validate before render
- invalid payloads reject without partial render
- primary tool workflow is covered by targeted validation
- undo/reset/import/export or equivalent state actions behave as documented when applicable
- tool diagnostics identify PASS/FAIL/WARN/SKIP outcomes for targeted fixtures
- no dead controls, dead accordions, hidden bootstrap assumptions, or silent fallback paths remain in the completed surface
- validation reports identify skipped samples and skipped broad lanes

## CODEX ANTI-PATTERN GUARD

These rules are mandatory for every Codex BUILD execution:

- One concept = one name.
- Do not introduce alias variables or remapping chains such as `name1` → `nameA`.
- Do not create pass-through variables that only copy another variable.
- Do not create `a` → `b` → `c` assignment chains.
- Only introduce a variable when it transforms data, improves a complex expression, or is required for control flow.
- Preserve existing meaningful names unless a rename is required for correctness and is applied consistently.
- Do not add abstraction layers, helper functions, or broad refactors unless the BUILD explicitly requires them.
- Do not change unrelated files.
- Before finishing, review the diff and remove unused, redundant, pass-through, or alias variables.

## ROADMAP GUARD ENFORCEMENT

Codex must validate any roadmap touch against these rules:

- never delete roadmap content
- never rewrite existing roadmap text
- only append new roadmap content when explicitly required by the PR
- only update status markers using:
  - `[ ]` → `[.]`
  - `[.]` → `[x]`

If roadmap status must change:
- edit the existing repo roadmap in place
- status-only transitions only
- place validation findings in `docs_build/dev/reports`

If no roadmap status change is execution-backed:
- leave roadmap content untouched

## CURRENT RECOVERY LANE

The active UAT lane is Workspace V2 and tool completion.

Treat this as a recovery/stabilization lane only.

Do not expand into:
- broader games hub work
- unrelated tool registry rewrites
- unrelated template rewrites
- roadmap rewrites
- sample JSON alignment until tools are complete

Recovery lane completion checklist:
- Workspace V2 contract behavior is stable for launch, manifest handoff, palette propagation, and toolState open/save paths
- targeted tool completion exit checklists are satisfied for the tools in scope
- unresolved failures are classified by lane, owner, fixture, and runtime surface
- unrelated failures are reported as WARN and do not block the recovery lane
- UI consistency blockers are either fixed or explicitly tracked outside the recovery exit
- reports clearly state whether samples were skipped

Transition into the future sample-alignment phase is allowed only after recovery-lane scope is complete, tool completion blockers are cleared or tracked, and sample work is explicitly named as the PR scope.

## ARRAY FORMATTING RULE

Primitive-only arrays in JSON must use compact grouped formatting.

Primitive values are:
- string
- number
- boolean
- null

Valid compact form example:

`[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]`

Do not compact:
- arrays of objects
- nested arrays
- complex structures

Do not change JSON contracts or semantics while applying array formatting.

## PROJECT INSTRUCTIONS LOCATION

PROJECT_INSTRUCTIONS.md lives at:

`docs_build/dev/PROJECT_INSTRUCTIONS.md`

Codex must always read `docs_build/dev/PROJECT_INSTRUCTIONS.md` from this path as the source of truth before executing repository workflow instructions.

## CODEX COMMAND FORMATTING RULE

All Codex commands must be multi-line and human-readable.

Do not provide single-line Codex commands.

Codex commands must use these sections:

Changes:

Validation:

Required reports:

## REQUIRED ZIP OUTPUT

Codex must ALWAYS produce a repo-structured ZIP for every PR.

The ZIP must follow the existing CODEX ZIP STANDARD.

The ZIP is required output, not optional.

## HTML FILE RESTRICTIONS

Never allow `<script>` blocks inside HTML files.

Never allow `<style>` blocks inside HTML files.

HTML must not contain inline event handlers such as `onclick`, `onchange`, `oninput`, `onsubmit`, or similar.

All JavaScript must be external.

All CSS must be external.

Event wiring must live in external JavaScript classes or modules.

## SEPARATION OF CONCERNS

- One class per file.
- One control or section per class.
- App/root class coordinates only and must not own DOM logic or business logic.
- Controls do not reach into other controls directly.
- No `toolbox/shared` dependency is allowed.
- Shared UI behavior must use reusable classes.
- Do not duplicate shared UI behavior logic across controls or tools.

## DEFINITION OF DONE

A PR is complete only when:
- scope is clean
- requested validation passes
- required reports exist
- manual test notes are present

No PR is complete with:
- unresolved console errors
- broken UI controls
- missing review artifacts
- unintended file changes

## PR COMPLETION RULE

A PR is not complete until every requested item is implemented, validated, and explicitly marked PASS.

Before packaging any PR, Codex must:
- re-read the original PR request
- create a requirement-by-requirement checklist
- validate each requested item individually
- fix any failures before packaging
- include PASS/FAIL evidence for each requested item in the PR report

Codex must not package partially completed PRs.

## ERROR HANDLING CONTRACT

- No silent fallback.
- No hidden defaults.
- Failures must be visible, actionable, and logged.
- Invalid input must not partially render.
- Batch failures must identify the exact item that failed.

## UI CONSISTENCY CONTRACT

- Tools must use consistent header, NAV, panel, accordion, status, and action patterns.
- Left and right tool panels must use working accordion sections unless explicitly exempted.
- Dead accordion controls are prohibited.
- Left panel = user input/setup.
- Center = primary work surface.
- Right panel = output/status/logging/diagnostics.
- Status/log sections belong at the bottom of the right panel unless explicitly justified otherwise.

UI consistency validation expectations:
- header, NAV, panel, accordion, status, and action patterns must be verified for affected tool surfaces
- fullscreen or expanded modes must preserve header, status, and primary action visibility unless explicitly designed otherwise
- status areas must report current operation state and actionable failures
- accordion controls must open, close, preserve state when expected, and expose no dead accordion behavior
- dead accordion enforcement is mandatory for tool completion and recovery/UAT lanes

### Summary Table / Notes Table Governance

For tools that present Summary Table or Notes Table note-management surfaces:
- Add Note controls belong below the table.
- Clicking Add Note opens an inline input row inside the table.
- Tables with notes must include Edit and Delete actions on the right.
- System-created notes cannot be deleted.
- System-created notes may only have status changed when the tool explicitly allows status editing.
- Selected Note Metadata must be shown as table columns, not as a separate detached panel.

## TABLE-FIRST WORKSPACE GOVERNANCE

Primary tool work surfaces must be table-first unless a PR explicitly approves another interaction model.

Rules:
- The primary work surface is a table.
- Prefer inline table workflows over forms.
- No detached selected-item context panels.
- No detached notes/detail panels when child rows can render under the parent row.
- Parent name cells own accordion behavior.
- The chevron appears inside the parent name cell.
- The entire parent name cell toggles expansion.
- Child count columns are informational only.
- Only one parent row may be expanded at a time.
- The default state is all collapsed.
- Child rows are indented.
- The child Add button aligns with child rows.
- Metadata remains stored but hidden unless explicitly needed.
- Add buttons are left aligned and self-describing.
- Enumerated fields become dropdowns during edit mode.

Parent/child table pattern examples:
- Idea 1-* Notes
- Character 1-* Dialog
- Quest 1-* Objectives
- Audio Profile 1-* Effects

Visual examples:

1. Default collapsed table.

| Idea | Pitch | Status | Updated | Notes | Actions |
| --- | --- | --- | --- | --- | --- |
| > Sky Orchard | Grow floating islands... | Exploring | 2026-06-20 | 3 Notes | Edit Delete |
| > Clockwork Courier | Deliver messages through looping city... | New | 2026-06-20 | 0 Notes | Edit Delete |
| Add Idea | | | | | |

2. Expanded parent with child rows indented.

| Idea | Pitch | Status | Updated | Notes | Actions |
| --- | --- | --- | --- | --- | --- |
| v Sky Orchard | Grow floating islands... | Exploring | 2026-06-20 | 3 Notes | Edit Delete |
|   Note | Actions | | | | |
|   Wind test needs traversal risks. | Edit Delete | | | | |
|   Island height should read from camera. | Edit Delete | | | | |
|   Add Note | | | | | |

3. Normal row with Edit/Delete.

| Idea | Pitch | Status | Updated | Notes | Actions |
| --- | --- | --- | --- | --- | --- |
| > Sky Orchard | Grow floating islands... | Exploring | 2026-06-20 | 3 Notes | Edit Delete |

4. Edit row with Save/Cancel and dropdown status.

| Idea | Pitch | Status | Updated | Notes | Actions |
| --- | --- | --- | --- | --- | --- |
| [Sky Orchard] | [Grow floating islands...] | [Exploring v] | 2026-06-20 | 3 Notes | Save Cancel |

5. Add row with Save/Cancel.

| Idea | Pitch | Status | Updated | Notes | Actions |
| --- | --- | --- | --- | --- | --- |
| [New idea] | [Pitch] | [New v] | auto | 0 Notes | Save Cancel |

Explicit row-state rules:
- Normal row actions: Edit Delete.
- Edit row actions: Save Cancel.
- Add row actions: Save Cancel.
- Save/Cancel is row-level only.
- No page-level Save for normal row editing.
- Cancel restores previous row state.
- Save commits only the edited row.
- Multiple simultaneous row edits are prohibited unless explicitly approved.

## INPUT RESOLUTION RULES

- Discover real files and directories.
- Never assume numeric sequences.
- Missing inputs are SKIP when batch processing, not FAIL, unless the selected single input is missing.
- Logs must identify resolved paths.

## RENDERING AND CAPTURE RULES

- Capture modes must be explicit.
- Do not silently fall back between capture modes.
- Capture failures must log the mode, target, and underlying error.
- Rendering tools must not claim OK when fallback or partial capture occurred.

## BATCH OPERATION RULES

- Batch operations must log per item.
- Each item must log `OK`, `WARN`, `FAIL`, or `SKIP`.
- One failed item must not stop the batch unless the failure is global.
- Summary must include written, failed, skipped, and warnings.
- Long-running batches must support a stop or cancel pattern when applicable.
- Batch operations must discover real files and directories and must not assume numeric folder sequences.

## PLAYWRIGHT DEPTH AND COVERAGE REQUIREMENT

Playwright must validate behavior, not just page load.

When a PR impacts a tool, Playwright tests must cover:
- the primary user action, such as Generate Preview
- control state transitions, such as enabled and disabled states
- at least one failure case when applicable

Playwright tests must verify actual outcomes, not just element existence.

Playwright tests must not be limited to page loads without error.

Each PR must state what behavior is being validated.

Playwright should validate these tool behaviors when applicable:
- Workspace lifecycle
- reset/load/export/import
- palette baseline
- valid toolState payload render
- invalid toolState payload rejection
- no payload mutation
- active toolState integrity
- no reliance on sample JSON during tool completion

When tool-level Playwright exists:
- tool completion audit should align to Playwright results
- failures must identify tool name
- reports must clearly show PASS/FAIL per tool

When runtime JavaScript changes, Codex must produce a Playwright V8 coverage report.

The coverage report must list changed runtime JavaScript files.

Missing changed runtime JavaScript files in coverage must be reported as `WARN`, not `FAIL`.

Coverage report lines must start with coverage percentage in this format:

`(xx%) <file-path> - <details>`

Coverage is advisory unless a PR explicitly defines thresholds.

Do NOT require:
- full feature coverage
- 100% code coverage
- performance requirements

## CODEX ZIP RETURN CONTRACT

Codex must include the repo-structured ZIP in returned artifacts for user and ChatGPT review.

The ZIP must still follow the CODEX ZIP STANDARD.

## CODE REVIEW EVIDENCE RULE

ChatGPT must not claim code review was completed unless it inspected uploaded source, ZIP contents, or `codex_review.diff`.

Pattern-based or process-based review must be labeled as such.

## First-Class Tool Lifecycle Contract

This is the single authoritative contract for first-class tool creation, template preservation, registration, and Workspace Manager V2 wiring.

First-class tools are Workspace V2 ecosystem members by default.

Required tool location:
- `toolbox/<tool-name>/`

Required template source:
- `toolbox/_tool_template-v2`

The copied template structure is the authoritative starting point.

Tool-specific implementation extends the copied template rather than replacing it.

Required preserved template structure:
- headers
- NAV
- panels
- accordions
- status/logging
- CSS wiring
- JS bootstrapping
- accessibility structure

Required Workspace Manager V2 integration:
- `toolbox/workspace-manager-v2`

Required registration:
- `toolbox/index.html`
- `toolbox/workspace-manager-v2/index.html`

Required workspace lifecycle participation:
- dirty-state handling
- save/cancel lifecycle handling
- workspace launch/navigation patterns
- shared status/logging expectations

Registration must use existing navigation and launch patterns.

New first-class tools must include Playwright launch coverage when runtime/UI behavior is introduced.

Tool registration must not rely on hidden defaults or silent fallback.

Enforcement clarifications:
- isolated/disconnected tool systems require explicit authorization
- isolated launch/navigation systems are prohibited unless explicitly approved
- custom persistence/save systems are prohibited unless explicitly approved
- shell rebuilds are prohibited unless explicitly authorized
- alternate layout systems are prohibited unless explicitly approved
- do not inline CSS or JavaScript
- do not remove template sections unless the PR explicitly authorizes it
- keep HTML free of inline script/style/event handlers
- register the new tool only after the copied template is adapted

Use the V2 naming consistently:
- Tool Template V2
- First-Class Tool Starter V2
- First-Class Tools Surface V2
- First-Class Tool V2

## Targeted Toolbox Rebuild Rule

Targeted Toolbox rebuilds must use existing Theme V2 structure and styling first.

Rules:
- Do not add new CSS unless it is absolutely required for a documented Theme V2 gap.
- Do not create page-local CSS, tool-local CSS, inline styles, or script-generated styling for Toolbox rebuilds.
- Use existing Theme V2 layout, panel, accordion, button, card, status, and typography classes before requesting new styling.
- If existing Theme V2 cannot support a required Toolbox pattern, document the gap before adding an approved reusable Theme V2 pattern.
- Reusable Theme V2 patterns must live under `assets/theme-v2/css/` and must not reintroduce legacy/V1 styling.
- Wireframe-only Toolbox rebuilds must not add implementation logic.

## Tool Layout Width Standard

Theme V2 tool pages are designed for 1440px and larger desktop workspaces.

Desktop targets:
- 1440px minimum comfortable desktop width.
- 1920px ideal desktop width.

Tool page layout is:
- left margin
- left panel
- center panel
- right panel
- right margin

Rules:
- Use percentage-based responsive layout for wide tool pages.
- Do not hardcode per-tool widths.
- Keep left and right panels balanced.
- Keep the center panel dominant.
- Use reusable Theme V2 layout tokens/classes before adding new layout behavior.
- If additional CSS is required, add only reusable Theme V2 layout patterns under `assets/theme-v2/css/` and document the design-system gap.

## Targeted Independent Validation Guidance

Tool, page, and `src/` changes must use the narrowest affected validation lane that proves the changed behavior.

Rules:
- Small scoped tool changes validate the affected tool/page and directly touched shared dependencies only.
- Small scoped page changes validate the affected page and directly touched shared page dependencies only.
- Small scoped `src/` changes validate the affected module and directly dependent runtime/tool surface only.
- Do not trigger broad validation for small scoped changes unless shared runtime behavior, cross-tool launch behavior, engine behavior, or public navigation behavior changed.
- Do not run full samples validation unless samples are explicitly in scope or the changed shared runtime behavior directly affects samples.
- Reports must identify lanes run, broad lanes skipped, and the reason broad validation was not required.

## Tool Registry Planning Governance

Runtime database behavior for tools must not be introduced until tool planning metadata has a declared registry or data source.

The declared tool registry/data source must own:
- tool metadata
- category
- route
- status
- readiness
- requirements
- progress checklist
- deferred flags

Rules:
- Toolbox wireframes may show planning metadata as static text only.
- Future runtime database work must consume the declared data source rather than duplicating tool metadata in page-local code.
- Tool status, readiness, requirements, progress checklist, and deferred flags must be traceable to the declared registry/data source before database-backed behavior ships.

## Game Debug Configuration Governance

Game debug settings may exist for creator testing and development diagnostics.

Rules:
- Debug settings must be visible and configurable for creators/testers.
- Debug settings must not be hidden defaults.
- Debug settings must be disabled, stripped, or rejected when a game is promoted to playable/public release.
- Release validation must fail visibly when public/playable promotion includes enabled debug-only settings.
- Reports for affected game release or publish flows must state whether debug settings were present and how public release gating handled them.

## Game Hub Naming Guidance

Use `Game Hub` for user-facing copy and new test/report prose.

Rules:
- Do not introduce new user-facing `Workspace V2` wording.
- Do not introduce new report/test prose that describes the current user-facing experience as `Workspace V2`.
- Existing package scripts such as `npm run test:workspace-v2`, legacy lane identifiers, and historical test suite names may remain until renamed by a dedicated cleanup PR.
- When a report invokes a legacy command name such as `npm run test:workspace-v2`, the report must explain that the command name is legacy and the user-facing product language is `Game Hub`.

## CODEX GIT WORKFLOW OWNERSHIP

Codex owns Git execution for implementation PRs.

Required workflow:
1. Verify current branch.
2. Checkout `main` or the approved team workstream branch.
3. Pull latest approved execution branch.
4. Verify clean repository.
5. Create PR branch.
6. Implement changes.
7. Stage only scoped files.
8. Commit.
9. Push branch to GitHub.
10. Create Pull Request automatically.
11. Resolve merge conflicts if encountered.
12. Re-run validation after conflict resolution.
13. Merge PR only after explicit owner/EOD approval.
14. Return to main.
15. Pull latest main.
16. Continue to next approved PR.

Rules:
- Do not ask the user if a PR should be created.
- Do not ask the user if a branch should be pushed.
- Treat PR creation as required.
- Treat branch push as required.
- Treat merge as required only after validation passes and explicit owner/EOD approval is provided.
- Local-only commits are prohibited as completed workstream state.
- Every completed PR scope must be committed and pushed before Codex continues to another PR.
- If GitHub prompts `Would you like to create a Pull Request?`, answer YES automatically.
- If merge conflicts occur:
  - preserve latest main
  - preserve PR scope
  - avoid unrelated cleanup
  - revalidate before merge

Required Git workflow report fields:
- current branch
- created branch
- push result
- PR URL
- merge result
- final main commit

## GITHUB AUTHORITATIVE WORKSTREAM RULE

GitHub is the authoritative workstream record.

Rules:
- GitHub branches, commits, and pull requests are the authoritative record for active and completed Codex workstreams.
- Local-only commits are prohibited.
- A PR scope is not complete until its scoped changes are committed and pushed to GitHub.
- Every completed PR scope must be committed and pushed before Codex continues to another PR.
- Push failure is a hard stop until resolved.
- A branch ahead of origin is a hard stop because it contains unpushed commits.
- Detached HEAD execution is prohibited for PR work.
- Ownership mismatch is a hard stop.
- This rule does not authorize merging.
- EOD merge approval remains owner-controlled and requires explicit approval.

Start-gate sync validation:
- PASS when:
  - current branch is not detached
  - repository is clean
  - current branch has an origin upstream
  - `local == origin`
  - local branch HEAD equals origin branch HEAD
  - TEAM ownership matches the requested PR scope
- FAIL when:
  - current branch is detached HEAD
  - repository is dirty
  - branch is ahead of origin
  - branch has unpushed commits
  - local branch HEAD does not equal origin branch HEAD
  - push failure is unresolved
  - TEAM ownership mismatches the requested PR scope

Required report output:
- current branch
- upstream branch
- local commit
- origin commit
- local/origin sync PASS/FAIL
- push result
- TEAM ownership PASS/FAIL

## OWNER-CONTROLLED STABLE AND MERGE APPROVAL

Stable promotion and merge approval are owner-controlled.

Rules:
- Codex may prepare scoped changes, reports, validation evidence, ZIP artifacts, branches, and PRs.
- Codex must not merge a PR or mark a workstream stable without explicit approval from the assigned Team Alpha, Team Beta, or Team Gamma owner.
- Master Control may recommend sequencing or assignment, but affected workstream owners control stable and merge approval.
- This targeted section supersedes older automatic-merge wording when approval ownership is in question.
- EOD merge approval remains owner-controlled and requires explicit approval.

## CODEX INSTRUCTION ENFORCEMENT START GATE

Codex must run this gate before every PR execution and before any file changes.

Required instruction reads:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Read `docs_build/dev/PROJECT_MULTI_PC.txt`.
- Treat the newest applicable section in `PROJECT_INSTRUCTIONS.md` as authoritative when rules overlap.
- Treat the current team ownership section in `PROJECT_MULTI_PC.txt` as authoritative for TEAM routing.

Required pre-change report:
- Codex must report instruction compliance as `PASS` or `FAIL` before making file changes.
- The report must include branch, expected branch, upstream branch, local/origin sync status, clean status, PR TEAM owner, implementation path, validation scope, required report list, and ZIP requirement.
- Any `FAIL` is a hard stop unless the PR explicitly scopes branch audit or recovery documentation without implementation.

Hard stops before changes:
- If the current branch is neither `main` nor an approved team workstream branch, HARD STOP.
- If the repository is not clean before the PR branch is created, HARD STOP.
- If the current branch is detached HEAD, HARD STOP.
- If local branch HEAD does not equal origin branch HEAD when an origin upstream exists, HARD STOP.
- If the current branch is ahead of origin or has unpushed commits, HARD STOP.
- If a previous push failed and remains unresolved, HARD STOP.
- If the PR name does not include a required TEAM token, HARD STOP.
- If the PR TEAM owner does not match the team ownership map in `PROJECT_MULTI_PC.txt`, HARD STOP.
- If cross-team scope is attempted without explicit Master Control assignment, HARD STOP.
- If the PR asks for implementation and the implementation path is wrong, HARD STOP.
- If a PR asks for functional parity and only placeholder-only work is possible, HARD STOP and report the missing source or blocker.
- If scoped validation is skipped without a documented reason, HARD STOP.

Path enforcement:
- Use the active path named by the PR and verified in the repository.
- Do not create wrong replacement paths.
- For Text To Speech work, the active toolbox path is `toolbox/text-to-speech/`.
- Do not create `tools/text2speech/` for new work.
- If a PR names archived tools, games, or samples as a functionality sample, treat the archive as a read-only reference sample, not as a reason to skip implementation.

Completion hard stops:
- If the required repo ZIP is missing, HARD STOP.
- If the required repo ZIP is empty or not under `tmp/`, HARD STOP.
- If required reports are missing, HARD STOP.
- If `docs_build/dev/reports/codex_review.diff` is missing, HARD STOP.
- If `docs_build/dev/reports/codex_changed_files.txt` is missing, HARD STOP.
- If manual validation notes are missing, HARD STOP.
- If the PR-specific report is missing, HARD STOP.
- If an instruction compliance checklist is required and missing, HARD STOP.
- If requested scoped validation did not run and no explicit skip reason is recorded, HARD STOP.

Functional parity rule:
- A PR that asks to restore or rebuild working functionality must produce functional parity with the approved sample or source.
- Placeholder shells, dead controls, static mockups, and nonfunctional UI are not acceptable completion states for functional parity PRs.
- If functional parity cannot be reached in scope, Codex must stop and report the exact blocker instead of packaging placeholder-only work.
