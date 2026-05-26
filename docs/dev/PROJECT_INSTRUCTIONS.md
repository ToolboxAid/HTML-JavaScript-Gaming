# PROJECT INSTRUCTIONS

You are working in a docs-first repo workflow.

Workflow:
PLAN_PR → BUILD_PR → APPLY_PR

# WORKFLOW & EXECUTION

## PR NAMING STANDARD

PR names MUST follow:

`PR_<YYJJJ>_<###>-<short-description>`

Where:
- `YY` = year (2 digit)
- `JJJ` = Julian day (001–365)
- `###` = sequence for the day (001+)

Example:
- `PR_26124_001-palette-baseline`
- `PR_26124_002-tool-fix-asset-manager`

Rules:
- Must be unique per day
- Must be sortable
- Description must be short and hyphenated
- Do NOT reuse old `PR_11_*` format for new PRs

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
- `docs/pr/*`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/reports/*`

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

## FILE SCOPE GUARD

Allowed change scope is PR-specific.

Unless a PR states otherwise, keep changes limited to:
- `tools/preview-generator-v2/*`
- `common/*`
- `docs/dev/reports/*`

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

ChatGPT repo workflow responses are governed by `docs/dev/PROJECT_INSTRUCTIONS.md` as the source of truth.

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

- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/codex_changed_files.txt`

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

`PR_<YYJJJ>_<###>-<short-description>`

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

Reports remain under `docs/dev/reports`.

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

- Roadmap lives at: `docs\dev\roadmaps\MASTER_ROADMAP_ENGINE.md`
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
- place validation findings in `docs/dev/reports`

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

`docs/dev/PROJECT_INSTRUCTIONS.md`

Codex must always read `docs/dev/PROJECT_INSTRUCTIONS.md` from this path as the source of truth before executing repository workflow instructions.

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
- No `tools/shared` dependency is allowed.
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

## FIRST-CLASS TOOL LIFECYCLE CONTRACTS

First-class tools are part of the Workspace V2 ecosystem by default.

New first-class tools must live under `tools/<tool-name>/`.

New first-class tools must be created by copying `tools/_templates-v2/`.

The copied template structure is the authoritative starting point.

Tool-specific logic extends the copied template rather than replacing it.

Preserve:
- header shell
- NAV shell
- panel layout
- accordion structure
- status/logging regions
- CSS wiring
- JS bootstrapping
- accessibility structure

New first-class tools must integrate with `tools/workspace-manager-v2`.

New first-class tools must register in:
- `tools/index.html`
- `tools/workspace-manager-v2/index.html`

New first-class tools must participate in:
- dirty-state handling
- save/cancel lifecycle handling
- workspace launch/navigation patterns
- shared status/logging expectations

Registration must use existing navigation and launch patterns.

New first-class tools must include Playwright launch coverage when runtime/UI behavior is introduced.

Tool registration must not rely on hidden defaults or silent fallback.

Enforcement clarifications:
- isolated launch/navigation systems are prohibited unless explicitly approved
- custom persistence/save systems are prohibited unless explicitly approved
- shell rebuilds and alternate layout systems are prohibited unless explicitly approved
- do not inline CSS or JavaScript
- do not remove template sections unless the PR explicitly authorizes it
- keep HTML free of inline script/style/event handlers
- register the new tool only after the copied template is adapted

## TOOL TEMPLATE V2 LOCATION

The official First-Class Tool V2 starter is:

`tools/_templates-v2/`

Use the V2 naming consistently:
- Tool Template V2
- First-Class Tool Starter V2
- First-Class Tools Surface V2
- First-Class Tool V2
