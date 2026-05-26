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

ChatGPT produces only:
1. Codex command
2. Commit comment
3. What Playwright is testing
4. What the user should test manually

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

1. Determine the next PR.
2. Provide a compact Codex command.
3. Provide commit comment.
4. Provide what Playwright is testing.
5. Provide what the user should test manually.

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
- PRs must include something testable and improve the roadmap.
- Roadmap updates must be status-only unless explicitly requested.
- Valid roadmap status transitions:
  - `[ ]` → `[.]`
  - `[.]` → `[x]`

If a PR is doc-only, bundle it with the next smallest executable/testable change when appropriate.

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

## FIRST-CLASS TOOL REGISTRATION RULE

New first-class tools must include registry, index, and NAV wiring where applicable.

New first-class tools must include Playwright launch coverage.

Tool registration must not rely on hidden defaults or silent fallback.

## TOOL TEMPLATE V2 LOCATION

The official First-Class Tool V2 starter is:

`tools/templates-v2/`

Use the V2 naming consistently:
- Tool Template V2
- First-Class Tool Starter V2
- First-Class Tools Surface V2
- First-Class Tool V2
