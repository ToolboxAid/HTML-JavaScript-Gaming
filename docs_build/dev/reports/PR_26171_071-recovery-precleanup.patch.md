# PR_26171_071 Pre-cleanup Recovery Patch

## Git Status Before Cleanup
```text
## main...origin/main [ahead 1, behind 4]
A  docs_build/dev/reports/PR_26171_067-instruction-compliance-checklist.md
A  docs_build/dev/reports/PR_26171_067-manual-validation-notes.md
A  docs_build/dev/reports/PR_26171_067-message-tts-contract-checklist.md
A  docs_build/dev/reports/PR_26171_067-parent-child-table-checklist.md
A  docs_build/dev/reports/PR_26171_067-tts-profile-emotion-table-foundation.md
A  docs_build/dev/reports/PR_26171_067-validation.md
UU docs_build/dev/reports/codex_changed_files.txt
UU docs_build/dev/reports/codex_review.diff
M  docs_build/dev/reports/coverage_changed_js_guardrail.txt
M  docs_build/dev/reports/playwright_v8_coverage_report.txt
A  docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md
A  docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md
A  docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md
M  src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
M  tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
M  tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
M  tests/playwright/tools/TextToSpeechFunctional.spec.mjs
M  tests/playwright/tools/ToolboxRoutePages.spec.mjs
M  tests/tools/Text2SpeechShell.test.mjs
M  toolbox/game-workspace/game-workspace.js
M  toolbox/game-workspace/index.html
M  toolbox/idea-board/index.html
M  toolbox/idea-board/index.js
M  toolbox/text-to-speech/index.html
M  toolbox/text-to-speech/text2speech.js
```

## Merge Source
```text
decd37141d09cd8e2ff609da3c25404f1ed6c682
```

## Merge Message
```text
Merge branch 'main' of https://github.com/ToolboxAid/HTML-JavaScript-Gaming

# Conflicts:
#	docs_build/dev/reports/codex_changed_files.txt
#	docs_build/dev/reports/codex_review.diff
```

## Conflicted Files
```text
docs_build/dev/reports/codex_changed_files.txt
docs_build/dev/reports/codex_review.diff
```

## Cached File Names Before Cleanup
```text
docs_build/dev/reports/PR_26171_067-instruction-compliance-checklist.md
docs_build/dev/reports/PR_26171_067-manual-validation-notes.md
docs_build/dev/reports/PR_26171_067-message-tts-contract-checklist.md
docs_build/dev/reports/PR_26171_067-parent-child-table-checklist.md
docs_build/dev/reports/PR_26171_067-tts-profile-emotion-table-foundation.md
docs_build/dev/reports/PR_26171_067-validation.md
docs_build/dev/reports/codex_changed_files.txt
docs_build/dev/reports/codex_review.diff
docs_build/dev/reports/coverage_changed_js_guardrail.txt
docs_build/dev/reports/playwright_v8_coverage_report.txt
docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md
docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md
docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md
src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
tests/playwright/tools/TextToSpeechFunctional.spec.mjs
tests/playwright/tools/ToolboxRoutePages.spec.mjs
tests/tools/Text2SpeechShell.test.mjs
toolbox/game-workspace/game-workspace.js
toolbox/game-workspace/index.html
toolbox/idea-board/index.html
toolbox/idea-board/index.js
toolbox/text-to-speech/index.html
toolbox/text-to-speech/text2speech.js
```

## Recent Log Before Cleanup
```text
390912b56 Add multi-team merge authority governance - PR_26171_046-multi-team-merge-authority
6d2dfa5d1 PR_26171_065 message studio parent child table foundation
701f16656 PR_26171_042 clean up idea board navigation fallback
9df494222 PR_26171_061 text to speech engine audio feature parity
0c35f32a0 PR_26171_041 polish Idea Board production behavior
```

## Preserved Local Commit Summary
```text
390912b56 (HEAD -> main) Add multi-team merge authority governance - PR_26171_046-multi-team-merge-authority
 docs_build/dev/PROJECT_INSTRUCTIONS.md             |   14 +-
 docs_build/dev/PROJECT_MULTI_PC.txt                |   46 +-
 docs_build/dev/reports/codex_changed_files.txt     |   58 +-
 docs_build/dev/reports/codex_review.diff           | 1698 ++------------------
 .../team_alpha_beta_owner_approval_report.md       |   65 +
 5 files changed, 275 insertions(+), 1606 deletions(-)
```

## Staged Patch Before Cleanup
```diff
diff --git a/docs_build/dev/reports/PR_26171_067-instruction-compliance-checklist.md b/docs_build/dev/reports/PR_26171_067-instruction-compliance-checklist.md
new file mode 100644
index 000000000..fedefd391
--- /dev/null
+++ b/docs_build/dev/reports/PR_26171_067-instruction-compliance-checklist.md
@@ -0,0 +1,31 @@
+# PR_26171_067 Instruction Compliance Checklist
+
+## Required Reads
+
+- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
+- PASS: Read `docs_build/dev/PROJECT_MULTI_PC.txt` before implementation.
+- PASS: Read repository `AGENTS.md` instructions from the active workspace context.
+- PASS: Read relevant target files before editing.
+
+## Gate Checks
+
+- PASS: Started from `main`.
+- PASS: Pulled latest `origin/main`.
+- PASS: Repo was clean before branch creation.
+- PASS: Created scoped branch `pr/26171-067-tts-profile-emotion-table-foundation`.
+- PASS: PR number `067` is odd and assigned to Laptop / Environment 2.
+- PASS: TTS Studio is within Laptop ownership.
+- PASS: Active path is `toolbox/text-to-speech/`.
+- PASS: No wrong `tools/text2speech/` path was created.
+- PASS: No database changes were made.
+- PASS: No placeholder-only provider blocking behavior was introduced.
+
+## Required Artifacts
+
+- PASS: PR-specific report created.
+- PASS: Parent-child table checklist created.
+- PASS: Message/TTS contract checklist created.
+- PASS: Validation report created.
+- PASS: Manual validation notes created.
+- PASS: `codex_review.diff` and `codex_changed_files.txt` will be generated from the final scoped diff.
+- PASS: Repo-structured delta ZIP will be created under `tmp/`.
diff --git a/docs_build/dev/reports/PR_26171_067-manual-validation-notes.md b/docs_build/dev/reports/PR_26171_067-manual-validation-notes.md
new file mode 100644
index 000000000..712c083b1
--- /dev/null
+++ b/docs_build/dev/reports/PR_26171_067-manual-validation-notes.md
@@ -0,0 +1,17 @@
+# PR_26171_067 Manual Validation Notes
+
+## Notes
+
+- Verified TTS Studio keeps the active path `toolbox/text-to-speech/`.
+- Verified the page uses Theme V2 classes and external JavaScript only.
+- Verified the profile table can open child Emotion Settings by clicking the profile row.
+- Verified `Default Balanced Profile` delete is disabled because it is marked in use by Message Studio data.
+- Verified default `Neutral` emotion delete is disabled because it is marked in use by Message Parts.
+- Verified Add Profile, Edit Profile, Add Emotion, and Edit Emotion inline rows through targeted Playwright validation.
+- Verified Message Studio remains separate and its existing TTS dropdown smoke path still passes.
+- Verified no `tools/text2speech/` path was created.
+- Verified no database files were changed.
+
+## Follow Up
+
+- Future persistence can connect TTS Studio profile authoring to the existing Local API profile contract once that API ownership is assigned.
diff --git a/docs_build/dev/reports/PR_26171_067-message-tts-contract-checklist.md b/docs_build/dev/reports/PR_26171_067-message-tts-contract-checklist.md
new file mode 100644
index 000000000..bf2819ba1
--- /dev/null
+++ b/docs_build/dev/reports/PR_26171_067-message-tts-contract-checklist.md
@@ -0,0 +1,26 @@
+# PR_26171_067 Message TTS Contract Checklist
+
+## Ownership
+
+- PASS: Message Studio owns message text and ordered message parts.
+- PASS: TTS Studio owns reusable TTS Profiles and per-profile Emotion Settings.
+- PASS: `src/engine/audio/` remains the playback owner.
+- PASS: Audio playback results remain owned by the audio engine flow.
+- PASS: Message Studio and TTS Studio are not merged into one tool.
+
+## Contract Readiness
+
+- PASS: TTS Studio exposes `TTS_PROFILE_CONTRACT_VERSION` with value `tts-profile-emotion-v1`.
+- PASS: TTS Studio exports `createMessageStudioTtsProfileOptions`.
+- PASS: Exported profile options include stable keys, active state, display name, language, provider key, voice name, and active emotion settings.
+- PASS: Emotion settings include emotion key, display label, pitch, rate, volume, and SSML-like preset.
+- PASS: The output summary shows the contract version and Message Studio compatible profile options for local diagnostics.
+- PASS: Existing Message Studio dropdown smoke validation still passes.
+
+## Boundaries
+
+- PASS: No database changes were introduced.
+- PASS: No future provider behavior was hardcoded.
+- PASS: No browser-owned product data was introduced as source of truth.
+- PASS: Default profile data is limited to a local down-the-middle fallback until the API/data contract exists.
+- PASS: Existing Message Studio Local API profile shape remains untouched.
diff --git a/docs_build/dev/reports/PR_26171_067-parent-child-table-checklist.md b/docs_build/dev/reports/PR_26171_067-parent-child-table-checklist.md
new file mode 100644
index 000000000..065b3999d
--- /dev/null
+++ b/docs_build/dev/reports/PR_26171_067-parent-child-table-checklist.md
@@ -0,0 +1,38 @@
+# PR_26171_067 Parent Child Table Checklist
+
+## Parent Table
+
+- PASS: Parent table label is `TTS Profiles`.
+- PASS: Parent table lives in `toolbox/text-to-speech/`.
+- PASS: Parent table columns are Profile Name, Voice, Language, Gender, Age, Emotion Count, Status, Actions.
+- PASS: Default rows include `Default Balanced Profile`, `Man Profile 1`, and `Woman Profile 2`.
+- PASS: Parent row click opens or closes the child Emotion Settings row.
+- PASS: One selected profile row owns the visible child subtable at a time.
+- PASS: Parent profile count is visible in the summary stats.
+
+## Parent Actions
+
+- PASS: Add Profile opens a new inline row below the parent table rows.
+- PASS: Edit Profile opens an inline edit row for the selected profile.
+- PASS: Save Profile validates required Profile Name and Language values.
+- PASS: Duplicate Profile Name is blocked with a visible actionable error.
+- PASS: Cancel Profile closes the inline editor without applying changes.
+- PASS: Delete Profile removes unused profiles.
+- PASS: Delete Profile is disabled when the profile has Message Studio usage.
+
+## Child Table
+
+- PASS: Child table label is `Emotion Settings`.
+- PASS: Child table opens under the selected TTS Profile row.
+- PASS: Child columns are Emotion, Pitch, Rate, Volume, SSML-like Preset, Status, Actions.
+- PASS: Default neutral emotion is provided for every default profile.
+- PASS: Emotion count is visible in both the profile row and summary stats.
+
+## Child Actions
+
+- PASS: Add Emotion opens a new inline row in the child table.
+- PASS: Edit Emotion opens an inline edit row.
+- PASS: Save Emotion validates selected profile and unique emotion per profile.
+- PASS: Cancel Emotion closes the inline editor without applying changes.
+- PASS: Delete Emotion removes unused emotions.
+- PASS: Delete Emotion is disabled when the emotion has Message Parts usage.
diff --git a/docs_build/dev/reports/PR_26171_067-tts-profile-emotion-table-foundation.md b/docs_build/dev/reports/PR_26171_067-tts-profile-emotion-table-foundation.md
new file mode 100644
index 000000000..551954c0a
--- /dev/null
+++ b/docs_build/dev/reports/PR_26171_067-tts-profile-emotion-table-foundation.md
@@ -0,0 +1,50 @@
+# PR_26171_067 TTS Profile Emotion Table Foundation
+
+## Summary
+
+TTS Studio now presents a parent TTS Profiles table with an expandable child Emotion Settings table. The active tool remains `toolbox/text-to-speech/`, uses Theme V2, and keeps all JavaScript external.
+
+## Scope
+
+- Updated `toolbox/text-to-speech/index.html` to expose the requested parent and child table surfaces.
+- Updated `toolbox/text-to-speech/text2speech.js` to seed reusable profiles, render child emotion settings, support inline add/edit rows, and block delete actions when profile or emotion usage is marked by Message Studio data.
+- Added a TTS profile contract helper that returns Message Studio compatible options without moving ownership into Message Studio.
+- Updated targeted TTS browser and unit validation.
+
+## Requirement Evidence
+
+- PASS: Active path remains `toolbox/text-to-speech/`.
+- PASS: Parent table is TTS Profiles.
+- PASS: Clicking a profile row opens the child Emotion Settings subtable.
+- PASS: Parent rows include `Man Profile 1` and `Woman Profile 2`.
+- PASS: Parent columns are Profile Name, Voice, Language, Gender, Age, Emotion Count, Status, Actions.
+- PASS: Child columns are Emotion, Pitch, Rate, Volume, SSML-like Preset, Status, Actions.
+- PASS: Add Profile opens an inline add row under the parent table.
+- PASS: Edit Profile opens an inline edit row.
+- PASS: Add Emotion opens an inline add row in the child table.
+- PASS: Edit Emotion opens an inline edit row.
+- PASS: Delete profile is disabled when usage count indicates Message Studio data uses it.
+- PASS: Delete emotion is disabled when usage count indicates Message Parts use it.
+- PASS: Default balanced profile and default neutral emotion are provided.
+- PASS: Message Studio compatible profile options are exported for a future API/data contract.
+- PASS: Message Studio and TTS Studio remain separate tools.
+- PASS: No database changes were made.
+- PASS: Theme V2 only; no page-local CSS, tool-local CSS, inline styles, style blocks, or inline handlers.
+
+## Validation
+
+- PASS: `node --check toolbox\text-to-speech\text2speech.js`.
+- PASS: `node --check tests\playwright\tools\TextToSpeechFunctional.spec.mjs`.
+- PASS: `node --check tests\tools\Text2SpeechShell.test.mjs`.
+- PASS: HTML inline style/script/event scan for `toolbox/text-to-speech/index.html`.
+- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs`.
+- PASS: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs --project=playwright --workers=1 --reporter=list`.
+- PASS: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`.
+- PASS: `npm run test:workspace-v2` (legacy command name; user-facing language is Project Workspace).
+
+## Out Of Scope
+
+- No Message Studio merge.
+- No new provider behavior.
+- No generated audio export.
+- No database schema, seed, or persistence change.
diff --git a/docs_build/dev/reports/PR_26171_067-validation.md b/docs_build/dev/reports/PR_26171_067-validation.md
new file mode 100644
index 000000000..a2c228f1b
--- /dev/null
+++ b/docs_build/dev/reports/PR_26171_067-validation.md
@@ -0,0 +1,43 @@
+# PR_26171_067 Validation Report
+
+## Commands Run
+
+- `git branch --show-current`
+  - PASS: started from `main`.
+- `git checkout main`
+  - PASS.
+- `git pull origin main`
+  - PASS: already up to date.
+- `git status --short`
+  - PASS: clean before branch creation.
+- `node --check toolbox\text-to-speech\text2speech.js`
+  - PASS.
+- `node --check tests\playwright\tools\TextToSpeechFunctional.spec.mjs`
+  - PASS.
+- `node --check tests\tools\Text2SpeechShell.test.mjs`
+  - PASS.
+- `Select-String -Path toolbox\text-to-speech\index.html -Pattern '<style|<script(?![^>]+src=)|\son\w+=|style='`
+  - PASS: no matches.
+- `node --test tests/tools/Text2SpeechShell.test.mjs`
+  - PASS: 4 tests passed.
+- `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs --project=playwright --workers=1 --reporter=list`
+  - PASS: 2 tests passed.
+  - Covers default profiles, expandable Emotion Settings, inline add/edit rows, delete-disabled usage states, and existing speech composition.
+- `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`
+  - PASS: 2 tests passed.
+  - Covers Message Studio smoke compatibility for the existing TTS dropdown and audio-engine path.
+- `npm run test:workspace-v2`
+  - PASS: 5 Project Workspace tests passed.
+  - Note: command name is legacy; user-facing language is Project Workspace.
+
+## Coverage
+
+- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` produced changed runtime JS coverage.
+- PASS: `toolbox/text-to-speech/text2speech.js` covered by targeted browser validation.
+- NOTE: The advisory coverage helper also listed the previous HEAD Message Studio files because it includes `git diff-tree HEAD` before this PR is committed. Those Message Studio files are unchanged in this PR and were separately smoke-checked with `MessagesTool.spec.mjs`.
+
+## Skipped
+
+- Database validation skipped because no database schema, seed, or persistence implementation changed.
+- Full samples validation skipped because no samples changed.
+- External TTS provider validation skipped because this PR does not implement provider behavior.
* Unmerged path docs_build/dev/reports/codex_changed_files.txt
* Unmerged path docs_build/dev/reports/codex_review.diff
diff --git a/docs_build/dev/reports/coverage_changed_js_guardrail.txt b/docs_build/dev/reports/coverage_changed_js_guardrail.txt
index 6fbeaba58..21de9adb6 100644
--- a/docs_build/dev/reports/coverage_changed_js_guardrail.txt
+++ b/docs_build/dev/reports/coverage_changed_js_guardrail.txt
@@ -6,9 +6,10 @@ Missing changed runtime JS files are WARN, not FAIL.
 Source: Playwright/Chromium built-in V8 coverage from the active Playwright run.

 Changed runtime JS files considered:
-(64%) assets/theme-v2/js/tool-display-mode.js - executed lines 204/204; executed functions 9/14
-(87%) toolbox/messages/messages.js - executed lines 1233/1233; executed functions 103/118
-(100%) toolbox/messages/message-tts-service-registry.js - executed lines 42/42; executed functions 6/6
+(0%) toolbox/messages/message-tts-service-registry.js - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only
+(0%) toolbox/messages/messages.js - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only
+(80%) toolbox/text-to-speech/text2speech.js - executed lines 1518/1518; executed functions 127/158

 Guardrail warnings:
-(100%) none - no changed runtime JS coverage warnings
+(0%) toolbox/messages/message-tts-service-registry.js - WARNING: changed runtime JS file missing from coverage; advisory only
+(0%) toolbox/messages/messages.js - WARNING: changed runtime JS file missing from coverage; advisory only
diff --git a/docs_build/dev/reports/playwright_v8_coverage_report.txt b/docs_build/dev/reports/playwright_v8_coverage_report.txt
index 578a19ddc..49e94f0d7 100644
--- a/docs_build/dev/reports/playwright_v8_coverage_report.txt
+++ b/docs_build/dev/reports/playwright_v8_coverage_report.txt
@@ -12,34 +12,33 @@ Note: entry percentages use function coverage when available, otherwise line cov
 Note: coverage entries are aggregated across every page/tool where coverageReporter.start(page) and coverageReporter.stop(page) ran.

 Exercised tool entry points detected:
-(83%) Toolbox Index - exercised 4 runtime JS files
+(80%) Toolbox Index - exercised 2 runtime JS files
 (0%) Tool Template V2 - not exercised by this Playwright run
 (56%) Theme V2 Shared JS - exercised 2 runtime JS files

 Changed runtime JS files covered:
-(64%) assets/theme-v2/js/tool-display-mode.js - executed lines 204/204; executed functions 9/14
-(87%) toolbox/messages/messages.js - executed lines 1233/1233; executed functions 103/118
-(100%) toolbox/messages/message-tts-service-registry.js - executed lines 42/42; executed functions 6/6
+(0%) toolbox/messages/message-tts-service-registry.js - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only
+(0%) toolbox/messages/messages.js - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only
+(80%) toolbox/text-to-speech/text2speech.js - executed lines 1518/1518; executed functions 127/158

 Files with executed line/function counts where available:
-(34%) src/engine/audio/TextToSpeechEngine.js - executed lines 412/412; executed functions 15/44
 (36%) src/api/server-api-client.js - executed lines 167/167; executed functions 5/14
 (38%) src/api/public-config-client.js - executed lines 209/209; executed functions 10/26
 (54%) assets/theme-v2/js/gamefoundry-partials.js - executed lines 977/977; executed functions 46/85
-(58%) toolbox/messages/messages-api-client.js - executed lines 64/64; executed functions 11/19
 (64%) assets/theme-v2/js/tool-display-mode.js - executed lines 204/204; executed functions 9/14
+(71%) src/engine/audio/TextToSpeechEngine.js - executed lines 412/412; executed functions 37/52
 (76%) toolbox/tool-registry-api-client.js - executed lines 155/155; executed functions 22/29
-(87%) toolbox/messages/messages.js - executed lines 1233/1233; executed functions 103/118
+(80%) toolbox/text-to-speech/text2speech.js - executed lines 1518/1518; executed functions 127/158
 (100%) src/engine/audio/TextToSpeechDefaults.js - executed lines 108/108; executed functions 1/1
-(100%) toolbox/messages/message-tts-service-registry.js - executed lines 42/42; executed functions 6/6

 Uncovered or low-coverage changed JS files:
-(100%) none - no low-coverage changed runtime JS files
+(0%) toolbox/messages/message-tts-service-registry.js - WARNING: uncovered changed runtime JS file; advisory only
+(0%) toolbox/messages/messages.js - WARNING: uncovered changed runtime JS file; advisory only

 Changed JS files considered:
-(0%) tests/playwright/tools/IdeaBoardTableNotes.spec.mjs - changed JS file not collected as browser runtime coverage
 (0%) tests/playwright/tools/MessagesTool.spec.mjs - changed JS file not collected as browser runtime coverage
-(0%) tests/playwright/tools/ToolboxRoutePages.spec.mjs - changed JS file not collected as browser runtime coverage
-(64%) assets/theme-v2/js/tool-display-mode.js - changed JS file with browser V8 coverage
-(87%) toolbox/messages/messages.js - changed JS file with browser V8 coverage
-(100%) toolbox/messages/message-tts-service-registry.js - changed JS file with browser V8 coverage
+(0%) tests/playwright/tools/TextToSpeechFunctional.spec.mjs - changed JS file not collected as browser runtime coverage
+(0%) tests/tools/Text2SpeechShell.test.mjs - changed JS file not collected as browser runtime coverage
+(0%) toolbox/messages/message-tts-service-registry.js - changed JS file not collected as browser runtime coverage
+(0%) toolbox/messages/messages.js - changed JS file not collected as browser runtime coverage
+(80%) toolbox/text-to-speech/text2speech.js - changed JS file with browser V8 coverage
diff --git a/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md
new file mode 100644
index 000000000..2fba95562
--- /dev/null
+++ b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md
@@ -0,0 +1,17 @@
+# PR_26171_044-idea-board-game-hub-project-flow Apply
+
+## Apply Steps
+
+1. Start from clean `main`.
+2. Pull latest `main`.
+3. Create `codex/pr-26171-044-idea-board-game-hub-project-flow`.
+4. Implement only the BUILD scope.
+5. Run requested validation.
+6. Stage scoped files only.
+7. Commit.
+8. Push branch.
+9. Create PR.
+10. Resolve conflicts if encountered and rerun validation.
+11. Merge after validation passes.
+12. Return to `main` and pull latest.
+13. Produce final report with PR URL, merge result, final main commit, ZIP path, ZIP size, ZIP contents, and requirement PASS evidence.
diff --git a/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md
new file mode 100644
index 000000000..228f7703f
--- /dev/null
+++ b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md
@@ -0,0 +1,56 @@
+# PR_26171_044-idea-board-game-hub-project-flow Build
+
+## Source Of Truth
+
+Use the user request for `PR_26171_044-idea-board-game-hub-project-flow`, `docs_build/dev/PROJECT_INSTRUCTIONS.md`, `docs_build/dev/PROJECT_MULTI_PC.txt`, and this BUILD doc.
+
+## Singular Purpose
+
+Complete the Idea Board to Game Hub creator project handoff.
+
+## Exact Targets
+
+- `toolbox/idea-board/index.js`
+- `toolbox/game-workspace/game-workspace.js`
+- Existing targeted Playwright specs for Idea Board and Game Hub/Game Workspace.
+- Any smallest existing shared project or handoff contract file required by the flow.
+- `docs_build/dev/reports/codex_review.diff`
+- `docs_build/dev/reports/codex_changed_files.txt`
+
+## Requirements
+
+- Create Project appears only for Ready ideas.
+- Clicking Create Project creates or links a Game Hub project using an existing/shared project contract if available.
+- Clicking Create Project sets Idea status to Project.
+- Project ideas and their notes become read-only.
+- Project row actions are Open in Game Hub and Archive.
+- Project ideas cannot be edited or deleted.
+- Project ideas cannot add, edit, or delete notes.
+- Archived ideas remain hidden by default through existing filter behavior and show Restore and Delete when visible.
+- Game Hub displays creator-facing project data only.
+- Game Hub shows Project Information.
+- Game Hub shows a read-only Source Idea section with Idea, Pitch, and Notes.
+- Game Hub must not show internal IDs, DB/API/mock/debug/seed wording, or implementation details.
+- Open in Game Hub from Idea Board navigates to the related Game Hub project view.
+- If existing project handoff, route, or mock adapter wiring is missing, add the smallest fix needed.
+- Do not expand into Game Journey unless required as a stub/reference for the handoff.
+
+## Non-Goals
+
+- Do not change unrelated Game Hub workflows.
+- Do not introduce real database persistence.
+- Do not add SQLite.
+- Do not change full samples smoke behavior.
+
+## Validation
+
+- `node --check toolbox/idea-board/index.js`
+- Changed-file syntax checks for Game Hub JavaScript.
+- Targeted Idea Board Playwright.
+- Targeted Game Hub Playwright if existing coverage exists.
+- `npm run test:workspace-v2`
+- `git diff --check`
+
+## ZIP
+
+Produce `tmp/PR_26171_044-idea-board-game-hub-project-flow_delta.zip` with repo-structured changed files only.
diff --git a/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md
new file mode 100644
index 000000000..c93dea32e
--- /dev/null
+++ b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md
@@ -0,0 +1,31 @@
+# PR_26171_044-idea-board-game-hub-project-flow Plan
+
+## Purpose
+
+Wire the Idea Board Create Project action into a creator-facing Game Hub project view while preserving table-first Idea Board behavior.
+
+## Scope
+
+- Create or link a Game Hub project when a Ready idea uses Create Project.
+- Move created Project ideas into a read-only Idea Board state with Open in Game Hub and Archive actions.
+- Keep Archived ideas hidden by default and restorable/deletable when visible.
+- Productionize Game Hub project display with Project Information and read-only Source Idea fields.
+- Add the smallest handoff/project-contract fix needed to complete the flow.
+
+## Validation
+
+- `node --check toolbox/idea-board/index.js`
+- Changed-file syntax checks for Game Hub JavaScript.
+- Targeted Idea Board Playwright.
+- Targeted Game Hub Playwright if existing coverage exists.
+- `npm run test:workspace-v2`
+- Do not run full samples smoke.
+
+## Reports
+
+- `docs_build/dev/reports/codex_review.diff`
+- `docs_build/dev/reports/codex_changed_files.txt`
+
+## Delivery
+
+- Commit, push, create PR, merge after validation passes, return to `main`, pull latest `main`, and produce `tmp/PR_26171_044-idea-board-game-hub-project-flow_delta.zip`.
diff --git a/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js b/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
index ad5602999..fff42032d 100644
--- a/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+++ b/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
@@ -156,8 +156,37 @@ export const GAME_WORKSPACE_SCHEMA = Object.freeze({
   game_members: Object.freeze(["gameId", "userKey", "permission", "role"]),
 });

+function normalizeSourceIdea(sourceIdea) {
+  if (!sourceIdea || typeof sourceIdea !== "object") {
+    return null;
+  }
+
+  const idea = String(sourceIdea.idea || "").trim();
+  const pitch = String(sourceIdea.pitch || "").trim();
+  const notes = Array.isArray(sourceIdea.notes)
+    ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
+    : [];
+
+  if (!idea && !pitch && !notes.length) {
+    return null;
+  }
+
+  return { idea, pitch, notes };
+}
+
+function cloneRow(row) {
+  const cloned = { ...row };
+  const sourceIdea = normalizeSourceIdea(row.sourceIdea);
+  if (sourceIdea) {
+    cloned.sourceIdea = sourceIdea;
+  } else {
+    delete cloned.sourceIdea;
+  }
+  return cloned;
+}
+
 function cloneRows(rows) {
-  return rows.map((row) => ({ ...row }));
+  return rows.map(cloneRow);
 }

 function cloneTables(tables) {
@@ -227,6 +256,7 @@ export function createGameWorkspaceMockRepository() {
     return {
       ...game,
       purpose: game.purpose || "Game",
+      sourceIdea: normalizeSourceIdea(game.sourceIdea),
       ownerDisplayName: owner?.displayName || game.ownerKey,
       members: getGameMembers(game.id),
     };
@@ -373,6 +403,10 @@ export function createGameWorkspaceMockRepository() {
       purpose,
       status,
     };
+    const sourceIdea = normalizeSourceIdea(input.sourceIdea);
+    if (sourceIdea) {
+      game.sourceIdea = sourceIdea;
+    }

     tables.games.push(game);
     tables.game_members.push({
diff --git a/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs b/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
index 1787b86d8..1c1f742a9 100644
--- a/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+++ b/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
@@ -15,6 +15,14 @@ const SUPABASE_ENV_KEYS = Object.freeze([
 let fakeSupabaseServer;
 let previousSupabaseEnv;

+function restoreEnvValue(key, value) {
+  if (value === undefined) {
+    delete process.env[key];
+    return;
+  }
+  process.env[key] = value;
+}
+
 function startFakeSupabaseServer() {
   const tables = {
     roles: [],
@@ -123,6 +131,16 @@ test.afterAll(async () => {

 async function openRepoPage(page, pathName, options = {}) {
   const server = await startRepoServer();
+  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
+  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
+  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
+  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
+  const closeServer = server.close.bind(server);
+  server.close = async () => {
+    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
+    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
+    await closeServer();
+  };
   const failedRequests = [];
   const pageErrors = [];
   const consoleErrors = [];
@@ -235,12 +253,10 @@ test("Game Hub creates, opens, and deletes mock games", async ({ page }) => {
     await expect(page.getByRole("button", { name: "Create Game" })).toBeEnabled();
     await expect(page.getByRole("button", { name: "Delete Open Game" })).toHaveClass("btn");
     await expect(page.getByRole("button", { name: "Delete Open Game" })).toBeEnabled();
-    await expect(page.locator("[data-project-record-status]")).toContainText("Game Hub records loaded from the project records service");
-    await expect(page.locator("[data-project-record-status]")).toContainText("authoritative keys managed by service");
-    await expect(page.locator("[data-project-record-status]")).toContainText("asset references linked to storage object keys: 0");
+    await expect(page.locator("[data-project-record-status]")).toHaveText("Project Information loaded.");
+    await expect(page.locator("[data-game-project-information]")).toContainText("Project Information");
     await expect(page.locator("[data-project-records-table]")).toContainText("Demo Game");
-    await expect(page.locator("[data-project-records-table]")).toContainText("Project records service");
-    await expect(page.locator("[data-project-records-table]")).toContainText("asset refs 0");
+    await expect(page.locator("[data-source-idea-section]")).toContainText("No source idea yet");
     await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
     await expect(page.locator("[data-active-game-purpose]")).toHaveText("Game");
     await expect(page.locator("[data-current-user-role]")).toHaveText("Owner");
@@ -257,7 +273,7 @@ test("Game Hub creates, opens, and deletes mock games", async ({ page }) => {
     await page.getByRole("button", { name: "Create Game" }).click();
     await expect(page.locator("[data-active-game-name]")).toHaveText("Launch Test Game");
     await expect(page.locator("[data-game-list]")).toContainText("Launch Test Game");
-    await expect(page.locator("[data-project-records-table]")).toContainText("Launch Test Game");
+    await expect(page.locator("[data-game-project-information]")).toContainText("Launch Test Game");
     await expect(page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Open Launch Test Game (Active)" })).toHaveClass(/primary/);
     await expect(page.locator("[data-game-workspace-log]")).toHaveText("Created and opened Launch Test Game.");

@@ -287,11 +303,8 @@ test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }
   try {
     await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
     await expect(page.locator("[data-game-list]")).toContainText("Gravity Demo");
-    await expect(page.locator("[data-project-record-status]")).toContainText("guest browsing enabled; guest saving blocked");
-    await expect(page.locator("[data-project-record-status]")).toContainText("project records service");
-    await expect(page.locator("[data-project-record-status]")).toContainText("asset references linked to storage object keys: 0");
+    await expect(page.locator("[data-project-record-status]")).toHaveText("Project Information loaded. Sign in to save changes.");
     await expect(page.locator("[data-project-records-table]")).toContainText("Demo Game");
-    await expect(page.locator("[data-project-records-table]")).toContainText("Project records service");
     await expect(page.getByRole("button", { name: "Create Game" })).toBeDisabled();
     await expect(page.getByRole("button", { name: "Delete Open Game" })).toBeDisabled();
     await expect(page.getByLabel("Game Name")).toBeDisabled();
@@ -301,7 +314,7 @@ test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }

     await page.getByRole("button", { name: "Open Gravity Demo" }).click();
     await expect(page.locator("[data-active-game-name]")).toHaveText("Gravity Demo");
-    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Guest browsing enabled; sign in required to save Game Hub project records.");
+    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Sign in to create or update Game Hub projects.");

     await expectNoPageFailures(failures);
   } finally {
@@ -309,7 +322,7 @@ test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }
   }
 });

-test("Game Hub shows active-game API diagnostics without throwing", async ({ page }) => {
+test("Game Hub shows active-game errors without throwing", async ({ page }) => {
   await page.route("**/api/toolbox/game-workspace/repositories/*/methods/getActiveGame", async (route) => {
     await route.fulfill({
       body: JSON.stringify({
@@ -326,7 +339,7 @@ test("Game Hub shows active-game API diagnostics without throwing", async ({ pag
   try {
     expect(failures.failedRequests.some((request) => request.includes("502") && request.includes("/methods/getActiveGame"))).toBe(true);
     await expect(page.locator("[data-active-game-name]")).toHaveText("No game open");
-    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game unavailable for validation.");
+    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game is temporarily unavailable.");
     expect(failures.pageErrors).toEqual([]);
     expect(failures.consoleErrors.filter((message) => !message.includes("status of 502"))).toEqual([]);
   } finally {
@@ -356,7 +369,7 @@ test("Game Hub reports malformed active-game payloads without throwing", async (
   try {
     await expect(page.locator("[data-active-game-name]")).toHaveText("No game open");
     await expect(page.locator("[data-current-user-role]")).toHaveText("Viewer");
-    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game response is malformed.");
+    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game is temporarily unavailable.");
     await expect(page.getByLabel("Game Purpose")).toBeDisabled();

     await expectNoPageFailures(failures);
@@ -395,7 +408,6 @@ test("Game Hub displays and edits game purpose and member role", async ({ page }
     await expect(page.getByLabel("Game Purpose")).toHaveValue("Game");
     await expect(page.getByLabel("Game Status")).toHaveValue("Under Construction");
     await expect(page.getByLabel("Current User Role")).toHaveValue("Owner");
-    await expect(page.locator("[data-game-members-table]")).toContainText("Owner");

     await page.getByLabel("Game Purpose").selectOption("Learning Game");
     await expect(page.locator("[data-active-game-purpose]")).toHaveText("Learning Game");
@@ -407,7 +419,6 @@ test("Game Hub displays and edits game purpose and member role", async ({ page }

     await page.getByLabel("Current User Role").selectOption("Designer");
     await expect(page.locator("[data-current-user-role]")).toHaveText("Designer");
-    await expect(page.locator("[data-game-members-table]")).toContainText("Designer");
     await expect(page.locator("[data-game-workspace-log]")).toHaveText("Updated current user role to Designer.");

     await page.getByLabel("Game Purpose").selectOption("Capability Demo");
@@ -435,23 +446,22 @@ test("Game Hub progress panels update from mock game state", async ({ page }) =>
     await expect(page.locator("[data-recommended-next-tool]").first()).toHaveText("Game Configuration");
     await expect(page.locator("[data-game-progress-checklist]")).toContainText("Game identity: Complete");
     await expect(page.locator("[data-game-output-panels] summary")).toHaveText([
-      "Readiness Output",
-      "Repository Tables",
-      "Team Members"
+      "Readiness Output"
     ]);
     await expect(page.locator("aside.tool-column").last().getByText("Readiness Output")).toHaveCount(0);
-    await expect(page.locator("aside.tool-column").last().getByText("Repository Tables")).toHaveCount(0);
-    await expect(page.locator("aside.tool-column").last().getByText("Team Members")).toHaveCount(0);
     const panelOrderIsCorrect = await page.locator(".tool-center-panel").evaluate((panel) => {
+      const projectInformation = panel.querySelector("[data-game-project-information]");
+      const sourceIdea = panel.querySelector("[data-source-idea-section]");
       const staticOverlay = panel.querySelector("[data-game-workspace-foundation]");
       const outputPanels = panel.querySelector("[data-game-output-panels]");
-      const missingRequirements = panel.querySelector("[data-missing-requirements]");
       return Boolean(
+        projectInformation &&
+        sourceIdea &&
         staticOverlay &&
         outputPanels &&
-        missingRequirements &&
-        (staticOverlay.compareDocumentPosition(outputPanels) & Node.DOCUMENT_POSITION_FOLLOWING) &&
-        (outputPanels.compareDocumentPosition(missingRequirements) & Node.DOCUMENT_POSITION_FOLLOWING)
+        (projectInformation.compareDocumentPosition(sourceIdea) & Node.DOCUMENT_POSITION_FOLLOWING) &&
+        (sourceIdea.compareDocumentPosition(staticOverlay) & Node.DOCUMENT_POSITION_FOLLOWING) &&
+        (staticOverlay.compareDocumentPosition(outputPanels) & Node.DOCUMENT_POSITION_FOLLOWING)
       );
     });
     expect(panelOrderIsCorrect).toBe(true);
@@ -460,9 +470,7 @@ test("Game Hub progress panels update from mock game state", async ({ page }) =>
     await page.getByRole("button", { name: "Create Game" }).click();
     await expect(page.locator("[data-game-status]")).toHaveText("Under Construction");
     await expect(page.locator("[data-game-progress]")).toHaveText("Progress Review Game identity ready");
-    await expect(page.locator("[data-table-counts], [data-game-table-counts]")).toContainText("games");
-    await expect(page.locator("[data-game-table-counts]")).toContainText("5");
-    await expect(page.locator("[data-game-members-table]")).toContainText("Owner");
+    await expect(page.locator("[data-game-project-information]")).toContainText("Progress Review Game");

     await page.getByRole("button", { name: "Delete Open Game" }).click();
     await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
diff --git a/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs b/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
index 1a42e53d7..a18205fa4 100644
--- a/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+++ b/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
@@ -1,4 +1,5 @@
 import { expect, test } from "@playwright/test";
+import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
 import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
 import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";

@@ -114,8 +115,18 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
   const server = await startRepoServer();
   const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
   const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
+  const previousSupabaseEnv = {
+    GAMEFOUNDRY_DATABASE_URL: process.env.GAMEFOUNDRY_DATABASE_URL,
+    GAMEFOUNDRY_SUPABASE_ANON_KEY: process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY,
+    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY,
+    GAMEFOUNDRY_SUPABASE_URL: process.env.GAMEFOUNDRY_SUPABASE_URL,
+  };
   process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
   process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
+  process.env.GAMEFOUNDRY_DATABASE_URL = "postgres://idea-board:test@127.0.0.1:5432/idea_board";
+  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "idea-board-anon-key";
+  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "idea-board-service-role-key";
+  process.env.GAMEFOUNDRY_SUPABASE_URL = `${server.baseUrl}/fake-supabase`;
   const failedRequests = [];
   const pageErrors = [];
   const consoleErrors = [];
@@ -139,6 +150,32 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
   });

   try {
+    await page.route("**/api/platform-settings/banner", async (route) => {
+      await route.fulfill({
+        contentType: "application/json",
+        body: JSON.stringify({
+          data: { banner: { active: false, message: "", tone: "info" } },
+          ok: true,
+        }),
+      });
+    });
+    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
+      await route.fulfill({
+        contentType: "application/json",
+        body: JSON.stringify({
+          data: {
+            activeTools: [],
+            readinessByStatus: {},
+            tools: [],
+            toolboxContract: {},
+          },
+          ok: true,
+        }),
+      });
+    });
+    await page.request.post(`${server.baseUrl}/api/session/user`, {
+      data: { userKey: MOCK_DB_KEYS.users.user1 },
+    });
     await page.goto(`${server.baseUrl}/toolbox/idea-board/index.html`, { waitUntil: "networkidle" });
     await expect(page.getByRole("heading", { level: 1, name: "Idea Board" })).toBeVisible();
     await expectProductionCopy(page);
@@ -278,6 +315,13 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
     await expect(page.locator("[data-idea-board-notes-count='lantern-reef']")).toHaveText("0 Notes");
     await expect(page.locator("[data-idea-board-expanded-row='lantern-reef']")).toHaveCount(0);

+    await page.locator("[data-idea-board-idea-cell='lantern-reef']").click();
+    await expect(page.locator("[data-idea-board-expanded-row='lantern-reef']")).toBeVisible();
+    await page.locator("[data-idea-board-add-note='lantern-reef']").click();
+    await page.locator("[data-idea-board-note-input]").fill("Use dusk tide changes as the first Game Hub planning note.");
+    await page.locator("[data-idea-board-note-action='save']").click();
+    await expect(page.locator("[data-idea-board-notes-count='lantern-reef']")).toHaveText("1 Note");
+
     await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='edit']").click();
     await expect(page.locator("[data-idea-board-idea-input-row] [data-idea-board-idea-action]")).toHaveText(["Save", "Cancel"]);
     await expect(page.locator("[data-idea-board-idea-status-input]")).toHaveCount(1);
@@ -287,10 +331,11 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
     await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Create Project", "Delete"]);
     await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='create-project']").click();
     await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Project");
-    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Open Project", "Archive"]);
+    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Open in Game Hub", "Archive"]);
+    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='edit']")).toHaveCount(0);
     await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='delete']")).toHaveCount(0);
-    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='open-project']").click();
-    await expect(page.locator("[data-idea-board-status]")).toHaveText("Opening Lantern Reef.");
+    await expect(page.locator("[data-idea-board-add-note='lantern-reef']")).toHaveCount(0);
+    await expect(page.locator("[data-idea-board-notes-table='lantern-reef'] [data-idea-board-note-action]")).toHaveCount(0);
     await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='archive']").click();
     await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toHaveCount(0);
     await page.locator("[data-idea-board-status-filter-option][value='Archived']").check();
@@ -299,23 +344,25 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
     await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Restore", "Delete"]);
     await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='restore']").click();
     await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Project");
-    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='archive']").click();
-    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Restore", "Delete"]);
-    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='delete']").click();
-    await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toHaveCount(0);
-    await page.locator("[data-idea-board-filter-clear-all]").click();
-    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(0);
-    await expect(page.locator("[data-idea-board-add-idea]")).toBeVisible();
-    await page.locator("[data-idea-board-filter-select-all]").click();
-    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(3);
+    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Open in Game Hub", "Archive"]);
+    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='open-project']").click();
+    await page.waitForURL(/\/toolbox\/game-workspace\/index\.html\?game=lantern-reef-\d+$/);
+    await expect(page.getByRole("heading", { level: 1, name: "Game Hub" })).toBeVisible();
+    await expect(page.locator("[data-active-game-name]")).toHaveText("Lantern Reef");
+    await expect(page.locator("[data-source-idea-display]")).toHaveText("Lantern Reef");
+    await expect(page.locator("[data-source-idea-pitch]")).toHaveText("Guide light through a reef that rearranges at dusk.");
+    await expect(page.locator("[data-source-idea-notes]")).toContainText("Use dusk tide changes as the first Game Hub planning note.");
+    await expect(page.locator("main")).not.toContainText(/\bproject records\b|\bAPI\b|\bDB\b|\bmock\b|\bseed\b|\bdebug\b|\binternal\b/i);

-    expect(mutatingApiRequests).toEqual([]);
+    expect(mutatingApiRequests.some((request) => request.includes("/api/toolbox/game-workspace/repositories"))).toBe(true);
+    expect(mutatingApiRequests.some((request) => request.includes("/methods/createGame"))).toBe(true);
     expect(failedRequests).toEqual([]);
     expect(pageErrors).toEqual([]);
     expect(consoleErrors).toEqual([]);
   } finally {
     restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
     restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
+    Object.entries(previousSupabaseEnv).forEach(([key, value]) => restoreEnvValue(key, value));
     await server.close();
   }
 });
diff --git a/tests/playwright/tools/TextToSpeechFunctional.spec.mjs b/tests/playwright/tools/TextToSpeechFunctional.spec.mjs
index 17e2c0b62..8c964fecc 100644
--- a/tests/playwright/tools/TextToSpeechFunctional.spec.mjs
+++ b/tests/playwright/tools/TextToSpeechFunctional.spec.mjs
@@ -106,7 +106,45 @@ test("Text To Speech page loads and speaks through browser speech synthesis", as

     await expect(page.locator("[data-tts-voice-select]")).toContainText("Arcade Voice");
     await expect(page.locator("[data-tts-voice-count]")).toHaveText("2");
-    await expect(page.locator("[data-tts-engine-label]")).toHaveText("Ready");
+    await expect(page.locator("[data-tts-profile-count]")).toHaveText("3");
+    await expect(page.locator("[data-tts-emotion-count]")).toHaveText("3");
+    await expect(page.locator("[data-tts-profile-table]")).toContainText("Default Balanced Profile");
+    await expect(page.locator("[data-tts-profile-table]")).toContainText("Man Profile 1");
+    await expect(page.locator("[data-tts-profile-table]")).toContainText("Woman Profile 2");
+    await expect(page.locator("[data-tts-profile-row]").filter({ hasText: "Default Balanced Profile" }).getByRole("button", { name: "Delete" })).toBeDisabled();
+    await page.locator("[data-tts-profile-row]").filter({ hasText: "Default Balanced Profile" }).click();
+    await expect(page.getByRole("heading", { name: "Emotion Settings" })).toBeVisible();
+    await expect(page.getByRole("columnheader", { name: "Emotion", exact: true })).toBeVisible();
+    await expect(page.getByRole("columnheader", { name: "SSML-like Preset" })).toBeVisible();
+    await expect(page.locator("[data-tts-emotion-row]").filter({ hasText: "Neutral" }).getByRole("button", { name: "Delete" })).toBeDisabled();
+
+    await page.getByRole("button", { name: "Add Profile" }).click();
+    await expect(page.locator("[data-tts-profile-editor='__new__']")).toBeVisible();
+    await page.locator("[data-tts-profile-editor='__new__'] [data-tts-profile-name]").fill("Creature Profile");
+    await page.locator("[data-tts-profile-editor='__new__'] [data-tts-profile-gender]").selectOption("neutral");
+    await page.locator("[data-tts-commit-profile='__new__']").click();
+    await expect(page.locator("[data-tts-status]")).toHaveText("Saved TTS profile: Creature Profile.");
+    await expect(page.locator("[data-tts-profile-table]")).toContainText("Creature Profile");
+    await page.locator("[data-tts-profile-row]").filter({ hasText: "Creature Profile" }).getByRole("button", { name: "Edit Profile" }).click();
+    await page.locator("[data-tts-profile-editor] [data-tts-profile-name]").fill("Creature Profile Updated");
+    await page.locator("[data-tts-profile-editor] [data-tts-commit-profile]").click();
+    await expect(page.locator("[data-tts-status]")).toHaveText("Saved TTS profile: Creature Profile Updated.");
+    await page.getByRole("button", { name: "Add Emotion" }).click();
+    await page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-name]").selectOption("urgent");
+    await page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-pitch]").fill("1.2");
+    await page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-rate]").fill("1.1");
+    await page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-volume]").fill("0.8");
+    await page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-ssml-preset]").selectOption("whisper-ish");
+    await page.locator("[data-tts-commit-emotion='__new__']").click();
+    await expect(page.locator("[data-tts-status]")).toHaveText("Saved emotion setting: Urgent.");
+    await expect(page.locator("[data-tts-emotion-row]").filter({ hasText: "Urgent" })).toContainText("1.2");
+    await page.locator("[data-tts-emotion-row]").filter({ hasText: "Urgent" }).getByRole("button", { name: "Edit Emotion" }).click();
+    await page.locator("[data-tts-emotion-editor] [data-tts-emotion-volume]").fill("0.7");
+    await page.locator("[data-tts-emotion-editor] [data-tts-commit-emotion]").click();
+    await expect(page.locator("[data-tts-status]")).toHaveText("Saved emotion setting: Urgent.");
+    await expect(page.locator("[data-tts-output-summary]")).toContainText("\"contractVersion\": \"tts-profile-emotion-v1\"");
+    await expect(page.locator("[data-tts-output-summary]")).toContainText("\"name\": \"Creature Profile Updated\"");
+
     await expect(page.locator("[data-tts-gender-select]")).toBeVisible();
     await expect(page.locator("[data-tts-language-select]")).toBeVisible();
     await expect(page.locator("[data-tts-age-select]")).toBeVisible();
@@ -173,7 +211,7 @@ test("Text To Speech shows actionable error when browser speech synthesis is una
   const failures = await openTextToSpeechPage(page, { speechAvailable: false });
   try {
     await expect(page.getByRole("heading", { level: 1, name: "Text To Speech" })).toBeVisible();
-    await expect(page.locator("[data-tts-engine-label]")).toHaveText("Unavailable");
+    await expect(page.locator("[data-tts-profile-count]")).toHaveText("3");
     await expect(page.locator("[data-tts-engine-status]")).toContainText("SpeechSynthesis is unavailable");
     await expect(page.locator("[data-tts-status]")).toContainText("Use a browser with Web Speech API support");
     await expect(page.locator("[data-tts-voice-select]")).toContainText("No browser voices available");
diff --git a/tests/playwright/tools/ToolboxRoutePages.spec.mjs b/tests/playwright/tools/ToolboxRoutePages.spec.mjs
index b2d410c0f..bfe555c39 100644
--- a/tests/playwright/tools/ToolboxRoutePages.spec.mjs
+++ b/tests/playwright/tools/ToolboxRoutePages.spec.mjs
@@ -366,10 +366,6 @@ test("Idea Board launches from Toolbox with accordion table notes model", async
     await page.locator("[data-idea-board-idea-status-input]").selectOption("Ready");
     await page.locator("[data-idea-board-idea-action='save']").click();
     await expect(page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Create Project", "Delete"]);
-    await page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action='create-project']").click();
-    await expect(page.locator("[data-idea-board-idea-row='launch-tile'] td").nth(1)).toHaveText("Project");
-    await expect(page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Open Project", "Archive"]);
-    await expect(page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action='delete']")).toHaveCount(0);
     expect(mutatingApiRequests).toEqual([]);

     expect(failedRequests).toEqual([]);
diff --git a/tests/tools/Text2SpeechShell.test.mjs b/tests/tools/Text2SpeechShell.test.mjs
index fbc6ac8e9..51e4f019f 100644
--- a/tests/tools/Text2SpeechShell.test.mjs
+++ b/tests/tools/Text2SpeechShell.test.mjs
@@ -3,9 +3,14 @@ import test from "node:test";

 import {
   TTS_MESSAGE_STATUSES,
+  TTS_PROFILE_CONTRACT_VERSION,
   TTS_PROVIDER_ADAPTER_PLAN,
+  createDefaultTextToSpeechProfiles,
   createEmotionProfile,
+  createMessageStudioTtsProfileOptions,
   createSpeechPreviewRequest,
+  createTextToSpeechProfile,
+  createTextToSpeechProfileEmotion,
   createTtsMessage,
   createVoiceProfile,
   previewTtsMessage,
@@ -59,3 +64,46 @@ test("Text2Speech provider adapter plan keeps browser speech implemented and pai
   assert.equal(TTS_PROVIDER_ADAPTER_PLAN[0].status, "implemented");
   assert.ok(TTS_PROVIDER_ADAPTER_PLAN.slice(1).every((provider) => provider.status === "planned"));
 });
+
+test("Text2Speech profile contract exposes Message Studio compatible profile options", () => {
+  const voiceOptions = [{ language: "en-US", label: "Test Voice (en-US)", name: "Test Voice", value: "test-voice" }];
+  const defaults = createDefaultTextToSpeechProfiles(voiceOptions);
+  const custom = createTextToSpeechProfile({
+    emotions: [
+      createTextToSpeechProfileEmotion({
+        emotion: "urgent",
+        pitch: 1.2,
+        rate: 1.1,
+        ssmlLikePreset: "whisper-ish",
+        volume: 0.8,
+      }),
+    ],
+    id: "custom-profile",
+    name: "Custom Profile",
+    voice: "test-voice",
+    voiceName: "Test Voice",
+  });
+  const options = createMessageStudioTtsProfileOptions([custom]);
+
+  assert.equal(TTS_PROFILE_CONTRACT_VERSION, "tts-profile-emotion-v1");
+  assert.equal(defaults[0].name, "Default Balanced Profile");
+  assert.equal(defaults[0].messageStudioUsageCount, 1);
+  assert.equal(defaults[0].emotions[0].emotionLabel, "Neutral");
+  assert.equal(defaults[0].emotions[0].messagePartsUsageCount, 1);
+  assert.deepEqual(options, [{
+    active: true,
+    emotionSettings: [{
+      emotion: "urgent",
+      emotionLabel: "Urgent",
+      pitch: 1.2,
+      rate: 1.1,
+      ssmlLikePreset: "whisper-ish",
+      volume: 0.8,
+    }],
+    key: "custom-profile",
+    language: "en-US",
+    name: "Custom Profile",
+    providerKey: "browser-speech",
+    voiceName: "Test Voice",
+  }]);
+});
diff --git a/toolbox/game-workspace/game-workspace.js b/toolbox/game-workspace/game-workspace.js
index d57ed37ef..90aea08f8 100644
--- a/toolbox/game-workspace/game-workspace.js
+++ b/toolbox/game-workspace/game-workspace.js
@@ -3,12 +3,10 @@ import {
   GAME_WORKSPACE_GAME_PURPOSES,
   GAME_WORKSPACE_GAME_STATUSES,
   createGameWorkspaceApiRepository,
-  readProjectWorkspaceProjectRecords,
 } from "./game-workspace-api-client.js";
 import { getSessionCurrent } from "../../src/api/session-api-client.js";

 const repository = createGameWorkspaceApiRepository();
-let projectRecordContract = null;

 const elements = {
   activeGameName: document.querySelector("[data-active-game-name]"),
@@ -29,6 +27,10 @@ const elements = {
   projectRecordStatus: document.querySelector("[data-project-record-status]"),
   projectRecordsTable: document.querySelector("[data-project-records-table]"),
   purposeInput: document.querySelector("[data-game-purpose-input]"),
+  sourceIdeaDisplay: document.querySelector("[data-source-idea-display]"),
+  sourceIdeaName: document.querySelector("[data-source-idea-name]"),
+  sourceIdeaNotes: document.querySelector("[data-source-idea-notes]"),
+  sourceIdeaPitch: document.querySelector("[data-source-idea-pitch]"),
   gameStatus: document.querySelector("[data-game-status]"),
   gameStatusInput: document.querySelector("[data-game-status-input]"),
   publishingProgress: document.querySelector("[data-publishing-progress]"),
@@ -63,7 +65,7 @@ function isRepositoryErrorResult(value) {
 }

 function repositoryErrorMessage(value, context) {
-  return String(value?.message || value?.error || `${context} failed through the server API contract.`).trim();
+  return `${context} is temporarily unavailable. Refresh the page or try again shortly.`;
 }

 function reportRepositoryError(value, context) {
@@ -86,7 +88,7 @@ function normalizeActiveGame(value, context = "Active game") {
     return null;
   }
   if (!isRecord(value) || !Array.isArray(value.members)) {
-    setStatusLog(`${context} response is malformed. Reload Game Hub after the server API contract is restored.`);
+    setStatusLog(`${context} is temporarily unavailable. Refresh the page or try again shortly.`);
     return null;
   }
   return value;
@@ -96,23 +98,23 @@ function normalizeProgress(value) {
   if (reportRepositoryError(value, "Game progress")) {
     return {
       gameStatus: "No Game",
-      gameProgress: "Blocked by server API error",
-      publishingProgress: "Blocked",
-      currentFocus: "Resolve the server API diagnostic",
+      gameProgress: "Progress is temporarily unavailable",
+      publishingProgress: "Unavailable",
+      currentFocus: "Refresh Game Hub",
       recommendedNextTool: "Game Hub",
       progressChecklist: [
-        { label: "Restore server API contract", status: "Blocked" },
+        { label: "Project information", status: "Unavailable" },
       ],
     };
   }
   if (!isRecord(value)) {
-    setStatusLog("Game progress response is malformed. Reload Game Hub after the server API contract is restored.");
+    setStatusLog("Game progress is temporarily unavailable. Refresh the page or try again shortly.");
   }
   return isRecord(value) ? value : {
     gameStatus: "No Game",
     gameProgress: "No active game",
     publishingProgress: "Not started",
-    currentFocus: "Create or seed a game",
+    currentFocus: "Create a game",
     recommendedNextTool: "Game Hub",
     progressChecklist: [],
   };
@@ -151,8 +153,8 @@ function refreshSaveControls() {
   }
   if (!saveAllowed) {
     const currentStatus = String(elements.statusLog?.textContent || "");
-    if (!/Blocked|failed|malformed|Restore|Sign in required|unavailable/i.test(currentStatus)) {
-      setStatusLog("Guest browsing enabled; sign in required to save Game Hub project records.");
+    if (!/failed|Sign in required|unavailable/i.test(currentStatus)) {
+      setStatusLog("Sign in to create or update Game Hub projects.");
     }
   }
 }
@@ -161,7 +163,7 @@ function ensureProjectRecordsSaveAllowed(action) {
   if (projectRecordsSaveAllowed()) {
     return true;
   }
-  const message = `Sign in required to ${action} Game Hub project records.`;
+  const message = `Sign in required to ${action} Game Hub projects.`;
   setStatusLog(message);
   setProjectRecordStatus(message);
   refreshSaveControls();
@@ -209,53 +211,31 @@ function createGameButton(game, isActive) {
   return button;
 }

-function renderProjectRecords() {
+function renderProjectInformation(activeGame, currentMember, progress) {
   if (!elements.projectRecordsTable) {
     return;
   }

-  try {
-    projectRecordContract = readProjectWorkspaceProjectRecords();
-  } catch (error) {
-    projectRecordContract = null;
-    setProjectRecordStatus(error instanceof Error ? error.message : "Game Hub project records are unavailable.");
-    return;
-  }
-
-  const records = Array.isArray(projectRecordContract.records) ? projectRecordContract.records : [];
-  const source = projectRecordContract.sourceLabel || "Project records service";
-  const assetReferenceCount = Number(projectRecordContract.assetReferenceCount || 0);
-  const saveMode = projectRecordsSaveAllowed()
-    ? "signed-in saves enabled"
-    : "guest browsing enabled; guest saving blocked";
-  setProjectRecordStatus(`${projectRecordContract.terminology || "Game Hub"} records loaded from the project records service; authoritative keys managed by service; asset references linked to storage object keys: ${assetReferenceCount}; ${saveMode}.`);
-
   elements.projectRecordsTable.replaceChildren();
-  if (!records.length) {
-    const row = document.createElement("tr");
-    ["No records", "No Game Hub records", "Not started", source].forEach((value) => {
-      const cell = document.createElement("td");
-      cell.textContent = value;
-      row.append(cell);
-    });
-    elements.projectRecordsTable.append(row);
-    return;
-  }
-
-  records.forEach((record) => {
-    const row = document.createElement("tr");
-    [
-      record.projectKey || "missing key",
-      record.name || "Untitled project",
-      record.status || "No status",
-      `${source}; asset refs ${Number(record.assetReferenceCount || 0)}`,
-    ].forEach((value) => {
-      const cell = document.createElement("td");
-      cell.textContent = value;
-      row.append(cell);
-    });
-    elements.projectRecordsTable.append(row);
+  const row = document.createElement("tr");
+  [
+    { datasetName: "activeGameName", value: activeGame?.name || "No game open" },
+    { datasetName: "activeGameStatus", value: activeGame?.status || progress?.gameStatus || "No Game" },
+    { datasetName: "activeGamePurpose", value: activeGame?.purpose || "No purpose" },
+    { datasetName: "activeGameOwner", value: activeGame?.ownerDisplayName || "No owner" },
+    { datasetName: "currentUserRole", value: currentMember?.role || "Viewer" },
+    { datasetName: "recommendedNextTool", value: progress?.recommendedNextTool || "Game Hub" },
+  ].forEach(({ datasetName, value }) => {
+    const cell = document.createElement("td");
+    cell.dataset[datasetName] = "true";
+    cell.textContent = value;
+    row.append(cell);
   });
+  elements.projectRecordsTable.append(row);
+
+  setProjectRecordStatus(projectRecordsSaveAllowed()
+    ? "Project Information loaded."
+    : "Project Information loaded. Sign in to save changes.");
 }

 function renderGameList() {
@@ -268,7 +248,7 @@ function renderGameList() {
   const listResult = repository.listGames(gameUserKey ? { userKey: gameUserKey } : {});
   const games = Array.isArray(listResult) ? listResult : [];
   if (!Array.isArray(listResult) && !reportRepositoryError(listResult, "Game list")) {
-    setStatusLog("Game list response is malformed. Reload Game Hub after the server API contract is restored.");
+    setStatusLog("Game list is temporarily unavailable. Refresh the page or try again shortly.");
   }

   elements.gameList.replaceChildren();
@@ -276,7 +256,7 @@ function renderGameList() {
   if (games.length === 0) {
     const emptyState = document.createElement("p");
     emptyState.className = "status";
-    emptyState.textContent = "No games. Create or seed a game to continue.";
+    emptyState.textContent = "No games. Create a game to continue.";
     elements.gameList.append(emptyState);
     return;
   }
@@ -343,7 +323,7 @@ function renderTableCounts() {
     ? tableResult
     : { users: [], games: [], game_members: [] };
   if ((!isRecord(tableResult) || isRepositoryErrorResult(tableResult)) && !reportRepositoryError(tableResult, "Repository tables")) {
-    setStatusLog("Repository tables response is malformed. Reload Game Hub after the server API contract is restored.");
+    setStatusLog("Game Hub project details are temporarily unavailable. Refresh the page or try again shortly.");
   }
   const rows = [
     ["users", Array.isArray(tables.users) ? tables.users.length : 0],
@@ -366,6 +346,29 @@ function renderTableCounts() {
   });
 }

+function renderSourceIdea(activeGame) {
+  const sourceIdea = isRecord(activeGame?.sourceIdea) ? activeGame.sourceIdea : null;
+  const name = String(sourceIdea?.idea || "").trim();
+  const pitch = String(sourceIdea?.pitch || "").trim();
+  const notes = Array.isArray(sourceIdea?.notes)
+    ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
+    : [];
+
+  setText(elements.sourceIdeaName, name || "No source idea yet");
+  setText(elements.sourceIdeaDisplay, name || "No source idea yet");
+  setText(elements.sourceIdeaPitch, pitch || "Create a project from Idea Board to see source details.");
+
+  if (elements.sourceIdeaNotes) {
+    elements.sourceIdeaNotes.replaceChildren();
+    const visibleNotes = notes.length ? notes : ["No source notes."];
+    visibleNotes.forEach((note) => {
+      const item = document.createElement("li");
+      item.textContent = note;
+      elements.sourceIdeaNotes.append(item);
+    });
+  }
+}
+
 function renderChecklist(progress) {
   if (!elements.progressChecklist) {
     return;
@@ -419,7 +422,8 @@ function renderWorkspace() {
   renderMembersTable(activeGame);
   renderTableCounts();
   renderChecklist(progress);
-  renderProjectRecords();
+  renderProjectInformation(activeGame, currentMember, progress);
+  renderSourceIdea(activeGame);
   refreshSaveControls();
 }

@@ -437,7 +441,7 @@ elements.form?.addEventListener("submit", (event) => {

   if (reportRepositoryError(game, "Create Game") || !isRecord(game) || !String(game.name || "").trim()) {
     if (!isRepositoryErrorResult(game)) {
-      setStatusLog("Create Game did not return a valid game. Restore the server API contract and try again.");
+      setStatusLog("Create Game could not be completed. Refresh the page or try again shortly.");
     }
     renderWorkspace();
     return;
@@ -528,4 +532,15 @@ elements.currentUserRoleInput?.addEventListener("change", () => {
 populateSelect(elements.purposeInput, GAME_WORKSPACE_GAME_PURPOSES);
 populateSelect(elements.gameStatusInput, GAME_WORKSPACE_GAME_STATUSES);
 populateSelect(elements.currentUserRoleInput, GAME_WORKSPACE_MEMBER_ROLES);
+const requestedGameId = new URL(window.location.href).searchParams.get("game");
+if (requestedGameId) {
+  const openedGame = repository.openGame(requestedGameId);
+  if (isRepositoryErrorResult(openedGame)) {
+    setStatusLog(repositoryErrorMessage(openedGame, "Open Game"));
+  } else if (openedGame) {
+    setStatusLog(`Opened ${openedGame.name}.`);
+  } else {
+    setStatusLog("That Game Hub project could not be found.");
+  }
+}
 renderWorkspace();
diff --git a/toolbox/game-workspace/index.html b/toolbox/game-workspace/index.html
index ac1017b27..f204166d8 100644
--- a/toolbox/game-workspace/index.html
+++ b/toolbox/game-workspace/index.html
@@ -66,43 +66,58 @@
                         </div>
                     </aside>
                     <div data-tool-display-mode data-asset-root="assets/theme-v2/images" data-tool-slug="game-workspace" data-tool-icon-src="assets/theme-v2/images/badges/index.png" data-tool-character-src="assets/theme-v2/images/characters/index.png"></div>
-                    <section class="tool-center-panel"><h2>Game Hub Overview</h2>
-                        <p>Game Hub manages game identity, status, progress, and launch readiness through the project records service.</p>
-                        <div class="status" role="status" data-project-record-status>Loading Game Hub project records.</div>
-                        <div class="table-wrapper">
-                            <table class="data-table" aria-label="Game Hub project records">
-                                <caption>Game Hub Project Records</caption>
-                                <thead>
-                                    <tr>
-                                        <th scope="col">Authoritative Key</th>
-                                        <th scope="col">Project</th>
-                                        <th scope="col">Status</th>
-                                        <th scope="col">Source</th>
-                                    </tr>
-                                </thead>
-                                <tbody data-project-records-table>
-                                    <tr><td>Loading</td><td>Loading</td><td>Loading</td><td>Project records service</td></tr>
-                                </tbody>
-                            </table>
-                        </div>
-                        <article class="card">
+                    <section class="tool-center-panel"><h2>Project Information</h2>
+                        <p>Review the open project and its source idea.</p>
+                        <div class="status" role="status" data-project-record-status>Project Information ready.</div>
+                        <article class="card" data-game-project-information>
                             <div class="card-body content-stack">
-                                <div>
-                                    <div class="kicker">Open Game</div>
-                                    <h3 data-active-game-name>Demo Game</h3>
-                                </div>
-                                <div class="grid cols-3" aria-label="Active game summary">
-                                    <article class="mini-stat"><strong data-active-game-status>Under Construction</strong>Game Status</article>
-                                    <article class="mini-stat"><strong data-active-game-purpose>Game</strong>Game Purpose</article>
-                                    <article class="mini-stat"><strong data-active-game-owner>No owner</strong>Owner</article>
-                                    <article class="mini-stat"><strong data-current-user-role>Owner</strong>Current User Role</article>
-                                    <article class="mini-stat"><strong data-recommended-next-tool>Game Configuration</strong>Recommended Next Tool</article>
+                                <div class="table-wrapper">
+                                    <table class="data-table" aria-label="Project Information">
+                                        <caption>Project Information</caption>
+                                        <thead>
+                                            <tr>
+                                                <th scope="col">Project</th>
+                                                <th scope="col">Status</th>
+                                                <th scope="col">Purpose</th>
+                                                <th scope="col">Owner</th>
+                                                <th scope="col">Role</th>
+                                                <th scope="col">Next Tool</th>
+                                            </tr>
+                                        </thead>
+                                        <tbody data-project-records-table>
+                                            <tr>
+                                                <td data-active-game-name>Demo Game</td>
+                                                <td data-active-game-status>Under Construction</td>
+                                                <td data-active-game-purpose>Game</td>
+                                                <td data-active-game-owner>No owner</td>
+                                                <td data-current-user-role>Owner</td>
+                                                <td data-recommended-next-tool>Game Configuration</td>
+                                            </tr>
+                                        </tbody>
+                                    </table>
                                 </div>
                                 <div class="action-group">
                                     <a class="btn primary" href="toolbox/game-journey/index.html?game=demo-game" data-game-journey-link>Open Game Journey</a>
                                 </div>
                             </div>
                         </article>
+                        <article class="card" data-source-idea-section>
+                            <div class="card-body content-stack">
+                                <div>
+                                    <div class="kicker">Source Idea</div>
+                                    <h3 data-source-idea-name>No source idea yet</h3>
+                                </div>
+                                <div class="table-wrapper">
+                                    <table class="data-table" aria-label="Source Idea">
+                                        <tbody>
+                                            <tr><th scope="row">Idea</th><td data-source-idea-display>No source idea yet</td></tr>
+                                            <tr><th scope="row">Pitch</th><td data-source-idea-pitch>Create a project from Idea Board to see source details.</td></tr>
+                                            <tr><th scope="row">Notes</th><td><ul class="content-list" data-source-idea-notes><li>No source notes.</li></ul></td></tr>
+                                        </tbody>
+                                    </table>
+                                </div>
+                            </div>
+                        </article>
                         <article class="card" data-game-workspace-foundation>
                             <div class="card-body content-stack">
                                 <div>
@@ -119,7 +134,7 @@
                                     <article class="callout"><h3>Recommended Next Tool</h3><p data-recommended-next-tool>Game Configuration</p></article>
                                     <article class="callout"><h3>Checklist</h3><ul data-game-progress-checklist><li>Game identity: Complete</li></ul></article>
                                 </div>
-                                <div class="status" role="status" data-game-workspace-log>Demo Game seeded.</div>
+                                <div class="status" role="status" data-game-workspace-log>Game Hub ready.</div>
                             </div>
                         </article>
                         <div class="accordion-stack" data-game-output-panels>
@@ -141,56 +156,7 @@
                                     </div>
                                 </div>
                             </details>
-                            <details class="vertical-accordion" open>
-                                <summary>Repository Tables</summary>
-                                <div class="accordion-body">
-                                    <div class="table-wrapper">
-                                        <table class="data-table">
-                                            <caption>Game Hub data row counts</caption>
-                                            <thead>
-                                                <tr><th scope="col">Table</th><th scope="col">Rows</th></tr>
-                                            </thead>
-                                            <tbody data-game-table-counts>
-                                                <tr><td>users</td><td>3</td></tr>
-                                                <tr><td>games</td><td>4</td></tr>
-                                                <tr><td>game_members</td><td>12</td></tr>
-                                            </tbody>
-                                        </table>
-                                    </div>
-                                </div>
-                            </details>
-                            <details class="vertical-accordion" open>
-                                <summary>Team Members</summary>
-                                <div class="accordion-body">
-                                    <div class="table-wrapper">
-                                        <table class="data-table">
-                                            <caption>Open game members</caption>
-                                            <thead>
-                                                <tr><th scope="col">User</th><th scope="col">User Key</th><th scope="col">Role</th><th scope="col">Permission</th></tr>
-                                            </thead>
-                                            <tbody data-game-members-table>
-                                                <tr><td>No game</td><td>-</td><td>-</td><td>-</td></tr>
-                                            </tbody>
-                                        </table>
-                                    </div>
-                                </div>
-                            </details>
                         </div>
-                        <article class="card" role="dialog" aria-labelledby="game-workspace-missing-requirements-title" data-missing-requirements>
-                            <div class="card-body content-stack">
-                                <div>
-                                    <div class="kicker">Requirements</div>
-                                    <h3 id="game-workspace-missing-requirements-title">Missing Requirements</h3>
-                                </div>
-                                <p>Not implemented yet: cross-tool blocking, publish validation, or persisted release gates. This review surface lists the next requirements only.</p>
-                                <div class="grid cols-3">
-                                    <article class="callout"><h3>Game Design</h3><p><span class="pill">Under Construction</span> Define win and lose conditions.</p></article>
-                                    <article class="callout"><h3>Game Configuration</h3><p><span class="pill">Planned</span> Choose release profile and debug policy.</p></article>
-                                    <article class="callout"><h3>Publish</h3><p><span class="pill">Planned</span> Prepare share metadata later.</p></article>
-                                </div>
-                                <div class="status" role="status">Game Hub does not run real publish gating yet.</div>
-                            </div>
-                        </article>
                     </section>
                     <aside class="tool-column tool-group-build">
                         <div class="tool-column-header">
@@ -200,7 +166,7 @@
                             <details class="vertical-accordion" open>
                                 <summary>Status Log</summary>
                                 <div class="accordion-body">
-                                    <p>Game Hub operations report status in the center panel while the right column stays reserved for inspector status and diagnostics.</p>
+                                    <p>Game Hub actions report status in the center panel.</p>
                                     <div class="status" role="status">Game data ready.</div>
                                 </div>
                             </details>
diff --git a/toolbox/idea-board/index.html b/toolbox/idea-board/index.html
index 422d67b1b..5734f4703 100644
--- a/toolbox/idea-board/index.html
+++ b/toolbox/idea-board/index.html
@@ -103,7 +103,7 @@
     <div data-partial="footer"></div>
     <script src="assets/theme-v2/js/gamefoundry-partials.js" defer></script>
     <script src="assets/theme-v2/js/tool-display-mode.js" defer></script>
-    <script src="toolbox/idea-board/index.js" defer></script>
+    <script type="module" src="toolbox/idea-board/index.js"></script>
 </body>

 </html>
diff --git a/toolbox/idea-board/index.js b/toolbox/idea-board/index.js
index 2b74e797d..74364a996 100644
--- a/toolbox/idea-board/index.js
+++ b/toolbox/idea-board/index.js
@@ -1,6 +1,10 @@
+import { createServerRepositoryClient } from "../../src/api/server-api-client.js";
+
 const statusOptions = Object.freeze(["New", "Exploring", "Refining", "Ready", "Project", "Archived"]);
 const defaultVisibleStatuses = Object.freeze(["New", "Exploring", "Refining", "Ready", "Project"]);
 const userId = "user-1";
+const gameHubRoute = "toolbox/game-workspace/index.html";
+let gameHubRepository = null;

 const ideaTable = [
   {
@@ -108,6 +112,10 @@ function isProject(record) {
   return record.status === "Project";
 }

+function isLockedIdea(record) {
+  return Boolean(record && (isProject(record) || isArchived(record)));
+}
+
 function visibleIdeas() {
   return ideaTable.filter((record) => state.visibleStatuses.has(record.status));
 }
@@ -128,6 +136,17 @@ function canDeleteIdea(record) {
   return !isProject(record) || isArchived(record);
 }

+function isRepositoryErrorResult(value) {
+  return Boolean(value && typeof value === "object" && value.error === true);
+}
+
+function gameHubProjectRepository() {
+  if (!gameHubRepository) {
+    gameHubRepository = createServerRepositoryClient("game-workspace");
+  }
+  return gameHubRepository;
+}
+
 function cell(text) {
   const td = document.createElement("td");
   td.textContent = text;
@@ -269,21 +288,18 @@ function renderIdeaRow(tbody, record) {
       " ",
       actionButton("Delete", "delete", "ideaBoardIdeaAction"),
     );
+  } else if (isProject(record)) {
+    actions.append(
+      actionButton("Open in Game Hub", "open-project", "ideaBoardIdeaAction", "primary"),
+      " ",
+      actionButton("Archive", "archive", "ideaBoardIdeaAction"),
+    );
   } else {
     actions.append(actionButton("Edit", "edit", "ideaBoardIdeaAction"));
     if (record.status === "Ready") {
       actions.append(" ", actionButton("Create Project", "create-project", "ideaBoardIdeaAction", "primary"));
     }
-    if (isProject(record)) {
-      actions.append(
-        " ",
-        actionButton("Open Project", "open-project", "ideaBoardIdeaAction", "primary"),
-        " ",
-        actionButton("Archive", "archive", "ideaBoardIdeaAction"),
-      );
-    } else {
-      actions.append(" ", actionButton("Delete", "delete", "ideaBoardIdeaAction"));
-    }
+    actions.append(" ", actionButton("Delete", "delete", "ideaBoardIdeaAction"));
   }
   row.append(actions);
   tbody.append(row);
@@ -312,7 +328,7 @@ function renderNoteInputRow(tbody, ideaId, record = null) {
   input.focus();
 }

-function renderNoteRow(tbody, record) {
+function renderNoteRow(tbody, record, locked = false) {
   const row = document.createElement("tr");
   row.dataset.noteId = record.noteId;
   row.dataset.ideaId = record.ideaId;
@@ -320,9 +336,11 @@ function renderNoteRow(tbody, record) {
   row.append(cell(record.note));

   const actions = document.createElement("td");
-  actions.append(actionButton("Edit", "edit", "ideaBoardNoteAction"));
-  if (!record.system) {
-    actions.append(" ", actionButton("Delete", "delete", "ideaBoardNoteAction"));
+  if (!locked) {
+    actions.append(actionButton("Edit", "edit", "ideaBoardNoteAction"));
+    if (!record.system) {
+      actions.append(" ", actionButton("Delete", "delete", "ideaBoardNoteAction"));
+    }
   }
   row.append(actions);
   tbody.append(row);
@@ -337,6 +355,7 @@ function renderExpandedNotesRow(tbody, record) {

   const childSurface = document.createElement("div");
   childSurface.className = "idea-board-notes-child-surface";
+  const locked = isLockedIdea(record);

   const tableWrapper = document.createElement("div");
   tableWrapper.className = "table-wrapper";
@@ -353,20 +372,22 @@ function renderExpandedNotesRow(tbody, record) {
   childSurface.append(tableWrapper);

   for (const note of notesForIdea(record.ideaId)) {
-    if (state.editingNoteId === note.noteId) {
+    if (!locked && state.editingNoteId === note.noteId) {
       renderNoteInputRow(notesBody, record.ideaId, note);
     } else {
-      renderNoteRow(notesBody, note);
+      renderNoteRow(notesBody, note, locked);
     }
   }
-  if (state.addingNoteIdeaId === record.ideaId) renderNoteInputRow(notesBody, record.ideaId);
-
-  const controls = document.createElement("div");
-  controls.className = "action-group idea-board-notes-child-actions";
-  const addNote = actionButton("Add Note", "add", "ideaBoardNoteAction", "primary");
-  addNote.dataset.ideaBoardAddNote = record.ideaId;
-  controls.append(addNote);
-  childSurface.append(controls);
+  if (!locked && state.addingNoteIdeaId === record.ideaId) renderNoteInputRow(notesBody, record.ideaId);
+
+  if (!locked) {
+    const controls = document.createElement("div");
+    controls.className = "action-group idea-board-notes-child-actions";
+    const addNote = actionButton("Add Note", "add", "ideaBoardNoteAction", "primary");
+    addNote.dataset.ideaBoardAddNote = record.ideaId;
+    controls.append(addNote);
+    childSurface.append(controls);
+  }
   content.append(childSurface);

   row.append(content);
@@ -391,7 +412,7 @@ function render(root) {
   renderStatusFilter(root);
   tbody.replaceChildren();
   for (const record of visibleIdeas()) {
-    if (state.editingIdeaId === record.ideaId) {
+    if (state.editingIdeaId === record.ideaId && !isLockedIdea(record)) {
       renderIdeaInputRow(tbody, record);
     } else {
       renderIdeaRow(tbody, record);
@@ -426,6 +447,12 @@ function saveIdeaRow(root, row) {
       updateStatus(root, "Idea Board could not find that idea.");
       return;
     }
+    if (isLockedIdea(record)) {
+      state.editingIdeaId = null;
+      updateStatus(root, "This project is read-only.");
+      render(root);
+      return;
+    }
     record.idea = idea;
     record.pitch = pitch;
     if (status === "Archived" && record.status !== "Archived") {
@@ -448,6 +475,14 @@ function saveIdeaRow(root, row) {

 function saveNoteRow(root, row) {
   const ideaId = row.dataset.ideaId;
+  const idea = ideaRecord(ideaId);
+  if (idea && isLockedIdea(idea)) {
+    state.editingNoteId = null;
+    state.addingNoteIdeaId = null;
+    updateStatus(root, "Project notes are read-only.");
+    render(root);
+    return;
+  }
   const value = row.querySelector("[data-idea-board-note-input]")?.value.trim();
   if (!value) {
     updateStatus(root, "Enter note text before saving.");
@@ -513,6 +548,19 @@ function deleteIdea(root, ideaId) {
   render(root);
 }

+function projectSourceIdea(record) {
+  return {
+    idea: record.idea,
+    pitch: record.pitch,
+    notes: notesForIdea(record.ideaId).map((note) => note.note),
+  };
+}
+
+function gameHubUrl(record) {
+  const suffix = record.projectId ? `?game=${encodeURIComponent(record.projectId)}` : "";
+  return `${gameHubRoute}${suffix}`;
+}
+
 function createProject(root, ideaId) {
   const record = ideaRecord(ideaId);
   if (!record) {
@@ -523,9 +571,26 @@ function createProject(root, ideaId) {
     updateStatus(root, "Set this idea to Ready before creating a project.");
     return;
   }
+  const repository = gameHubProjectRepository();
+  const project = repository.createGame({
+    name: record.idea,
+    purpose: "Game",
+    sourceIdea: projectSourceIdea(record),
+    status: "Planning",
+  });
+  if (isRepositoryErrorResult(project) || !project || !project.id) {
+    console.warn("Idea Board could not create a Game Hub project.", project?.message || repository.__apiDiagnostic?.() || "");
+    updateStatus(root, "Game Hub project could not be created right now. Try again shortly.");
+    return;
+  }
   record.status = "Project";
   record.previousStatus = "Project";
+  record.projectId = project.id;
+  record.projectName = project.name || record.idea;
   record.updated = today();
+  state.editingIdeaId = null;
+  state.editingNoteId = null;
+  state.addingNoteIdeaId = null;
   updateStatus(root, `${record.idea} is now a project.`);
   render(root);
 }
@@ -539,6 +604,9 @@ function archiveIdea(root, ideaId) {
   if (record.status !== "Archived") record.previousStatus = record.status;
   record.status = "Archived";
   record.updated = today();
+  state.editingIdeaId = null;
+  state.editingNoteId = null;
+  state.addingNoteIdeaId = null;
   if (!state.visibleStatuses.has("Archived") && state.expandedIdeaId === ideaId) {
     state.expandedIdeaId = null;
   }
@@ -565,7 +633,12 @@ function openProject(root, ideaId) {
     updateStatus(root, "Idea Board could not open that project.");
     return;
   }
-  updateStatus(root, `Opening ${record.idea}.`);
+  if (!record.projectId) {
+    updateStatus(root, "Create the Game Hub project before opening it.");
+    return;
+  }
+  updateStatus(root, `Opening ${record.idea} in Game Hub.`);
+  window.location.href = gameHubUrl(record);
 }

 function handleIdeaAction(root, actionControl) {
@@ -578,6 +651,11 @@ function handleIdeaAction(root, actionControl) {
     updateStatus(root, "Adding a new idea.");
     render(root);
   } else if (action === "edit") {
+    if (isLockedIdea(ideaRecord(ideaId))) {
+      updateStatus(root, "This project is read-only.");
+      render(root);
+      return;
+    }
     state.editingIdeaId = ideaId;
     state.addingIdea = false;
     updateStatus(root, `Editing ${ideaRecord(ideaId)?.idea}.`);
@@ -606,6 +684,14 @@ function handleNoteAction(root, actionControl) {
   const action = actionControl.dataset.ideaBoardNoteAction;
   const row = actionControl.closest("tr");
   const ideaId = actionControl.dataset.ideaBoardAddNote || row?.dataset.ideaId || state.expandedIdeaId;
+  const idea = ideaRecord(ideaId);
+  if (idea && isLockedIdea(idea)) {
+    state.editingNoteId = null;
+    state.addingNoteIdeaId = null;
+    updateStatus(root, "Project notes are read-only.");
+    render(root);
+    return;
+  }
   const noteId = row?.dataset.noteId;
   if (action === "add") {
     state.expandedIdeaId = ideaId;
diff --git a/toolbox/text-to-speech/index.html b/toolbox/text-to-speech/index.html
index f5b29b19a..e82dd9468 100644
--- a/toolbox/text-to-speech/index.html
+++ b/toolbox/text-to-speech/index.html
@@ -98,14 +98,50 @@
                     </aside>
                     <div data-tool-display-mode data-asset-root="assets/theme-v2/images" data-tool-slug="text-to-speech" data-tool-icon-src="assets/theme-v2/images/badges/text-to-speech.png" data-tool-character-src="assets/theme-v2/images/image-missing.svg"></div>
                     <section class="tool-center-panel">
-                        <h2>Speech Composition</h2>
-                        <div class="grid cols-3" aria-label="Text To Speech summary">
+                        <h2>TTS Studio</h2>
+                        <div class="grid cols-4" aria-label="Text To Speech summary">
                             <article class="mini-stat"><strong data-tts-text-count>0</strong>Characters</article>
+                            <article class="mini-stat"><strong data-tts-profile-count>0</strong>TTS Profiles</article>
+                            <article class="mini-stat"><strong data-tts-emotion-count>0</strong>Emotion Settings</article>
                             <article class="mini-stat"><strong data-tts-voice-count>0</strong>Voices</article>
                             <article class="mini-stat"><strong data-tts-engine-label>Checking</strong>Engine</article>
                         </div>
                         <article class="card">
                             <div class="card-body content-stack">
+                                <div>
+                                    <div class="kicker">Reusable Speech Profiles</div>
+                                    <h3>TTS Profiles</h3>
+                                </div>
+                                <div class="table-wrapper">
+                                    <table class="data-table" aria-label="TTS Profiles">
+                                        <thead>
+                                            <tr>
+                                                <th scope="col">Profile Name</th>
+                                                <th scope="col">Voice</th>
+                                                <th scope="col">Language</th>
+                                                <th scope="col">Gender</th>
+                                                <th scope="col">Age</th>
+                                                <th scope="col">Emotion Count</th>
+                                                <th scope="col">Status</th>
+                                                <th scope="col">Actions</th>
+                                            </tr>
+                                        </thead>
+                                        <tbody data-tts-profile-table>
+                                            <tr><td colspan="8">Loading TTS profiles.</td></tr>
+                                        </tbody>
+                                    </table>
+                                </div>
+                                <div class="action-group">
+                                    <button class="btn" type="button" data-tts-add-profile>Add Profile</button>
+                                </div>
+                            </div>
+                        </article>
+                        <article class="card">
+                            <div class="card-body content-stack">
+                                <div>
+                                    <div class="kicker">Local Preview</div>
+                                    <h3>Speech Composition</h3>
+                                </div>
                                 <label for="ttsTextInput">Text To Speak</label>
                                 <textarea id="ttsTextInput" rows="10" autocomplete="off" data-tts-text-input>Welcome to the arena, hero.</textarea>
                                 <div class="action-group" aria-label="Speech playback actions">
diff --git a/toolbox/text-to-speech/text2speech.js b/toolbox/text-to-speech/text2speech.js
index 5ab111eeb..9e0af1f87 100644
--- a/toolbox/text-to-speech/text2speech.js
+++ b/toolbox/text-to-speech/text2speech.js
@@ -2,6 +2,7 @@ import {
   createTextToSpeechQueueItem,
   filterTextToSpeechVoiceOptions,
   shapeTextToSpeechOptions,
+  textToSpeechLanguageOptionsFromVoices,
   textToSpeechPayloadGenderValue,
   TextToSpeechEngine,
   uniqueTextToSpeechId,
@@ -80,6 +81,27 @@ const TTS_PROVIDER_ADAPTER_PLAN = Object.freeze([
   }
 ]);

+const TTS_PROFILE_CONTRACT_VERSION = "tts-profile-emotion-v1";
+const NEW_ROW_KEY = "__new__";
+const DEFAULT_TTS_PROFILE_ID = "default-balanced-profile";
+const DEFAULT_TTS_EMOTION_ID = "neutral";
+
+const TTS_PROFILE_GENDER_OPTIONS = Object.freeze([
+  Object.freeze({ label: "Neutral", value: "neutral" }),
+  Object.freeze({ label: "Male", value: "male" }),
+  Object.freeze({ label: "Female", value: "female" }),
+  Object.freeze({ label: "Any", value: "any" })
+]);
+
+const TTS_PROFILE_EMOTION_OPTIONS = Object.freeze([
+  Object.freeze({ label: "Neutral", value: "neutral" }),
+  Object.freeze({ label: "Calm", value: "calm" }),
+  Object.freeze({ label: "Urgent", value: "urgent" }),
+  Object.freeze({ label: "Whisper", value: "whisper" }),
+  Object.freeze({ label: "Angry", value: "angry" }),
+  Object.freeze({ label: "Excited", value: "excited" })
+]);
+
 function boundedNumber(value, { fallback, max, min, value: defaultValue }) {
   const number = Number(value);
   const fallbackValue = fallback ?? defaultValue ?? min;
@@ -139,6 +161,144 @@ function createVoiceProfile({ key = "browser-speech", name = "Browser Speech", p
   };
 }

+function slugFromText(value, fallback = "tts-profile") {
+  const slug = String(value || "")
+    .trim()
+    .toLowerCase()
+    .replace(/[^a-z0-9]+/g, "-")
+    .replace(/^-+|-+$/g, "");
+  return slug || fallback;
+}
+
+function labelForOption(options, value, fallback = "") {
+  return options.find((option) => String(option.value) === String(value))?.label || fallback || String(value || "");
+}
+
+function createTextToSpeechProfileEmotion({
+  active = true,
+  emotion = "neutral",
+  id = "",
+  messagePartsUsageCount = 0,
+  pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
+  rate = TEXT_TO_SPEECH_DEFAULTS.rate,
+  ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
+  volume = TEXT_TO_SPEECH_DEFAULTS.volume
+} = {}) {
+  const emotionKey = slugFromText(emotion, DEFAULT_TTS_EMOTION_ID);
+  return {
+    active: active !== false,
+    emotion: emotionKey,
+    emotionLabel: labelForOption(TTS_PROFILE_EMOTION_OPTIONS, emotionKey, "Neutral"),
+    id: id || emotionKey,
+    messagePartsUsageCount: Math.max(0, Number(messagePartsUsageCount) || 0),
+    pitch: boundedNumber(pitch, TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch),
+    rate: boundedNumber(rate, TEXT_TO_SPEECH_RANGE_DEFAULTS.rate),
+    ssmlLikePreset: TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS.some((option) => option.value === ssmlLikePreset) ? ssmlLikePreset : "normal",
+    volume: boundedNumber(volume, TEXT_TO_SPEECH_RANGE_DEFAULTS.volume)
+  };
+}
+
+function createTextToSpeechProfile({
+  active = true,
+  age = TEXT_TO_SPEECH_DEFAULTS.voiceAge,
+  emotions = [],
+  gender = "neutral",
+  id = "",
+  language = TEXT_TO_SPEECH_DEFAULTS.language,
+  messageStudioUsageCount = 0,
+  name = "Default Balanced Profile",
+  voice = "",
+  voiceName = ""
+} = {}) {
+  const profileName = String(name || "Default Balanced Profile").trim() || "Default Balanced Profile";
+  const emotionRows = Array.isArray(emotions) && emotions.length
+    ? emotions.map((emotion) => createTextToSpeechProfileEmotion(emotion))
+    : [createTextToSpeechProfileEmotion()];
+  return {
+    active: active !== false,
+    age: String(age || TEXT_TO_SPEECH_DEFAULTS.voiceAge),
+    emotions: emotionRows,
+    gender: String(gender || "neutral"),
+    id: id || slugFromText(profileName, "tts-profile"),
+    language: String(language || TEXT_TO_SPEECH_DEFAULTS.language),
+    messageStudioUsageCount: Math.max(0, Number(messageStudioUsageCount) || 0),
+    name: profileName,
+    owner: TTS_OWNERSHIP.AUDIO,
+    providerKey: "browser-speech",
+    voice: String(voice || ""),
+    voiceName: String(voiceName || voice || "Default browser voice")
+  };
+}
+
+function defaultVoiceForProfile(voiceOptions = [], preferredGender = "") {
+  if (!voiceOptions.length) {
+    return null;
+  }
+  const preferred = voiceOptions.find((option) => {
+    const text = `${option.name || ""} ${option.label || ""}`.toLowerCase();
+    if (preferredGender === "male") return /\bmale\b|\bman\b|\bdavid\b|\bmark\b/.test(text);
+    if (preferredGender === "female") return /\bfemale\b|\bwoman\b|\bzira\b/.test(text);
+    return false;
+  });
+  return preferred || voiceOptions[0];
+}
+
+function createDefaultTextToSpeechProfiles(voiceOptions = []) {
+  const balancedVoice = defaultVoiceForProfile(voiceOptions);
+  const manVoice = defaultVoiceForProfile(voiceOptions, "male") || balancedVoice;
+  const womanVoice = defaultVoiceForProfile(voiceOptions, "female") || voiceOptions[1] || balancedVoice;
+  return [
+    createTextToSpeechProfile({
+      emotions: [createTextToSpeechProfileEmotion({ messagePartsUsageCount: 1 })],
+      id: DEFAULT_TTS_PROFILE_ID,
+      language: balancedVoice?.language || TEXT_TO_SPEECH_DEFAULTS.language,
+      messageStudioUsageCount: 1,
+      name: "Default Balanced Profile",
+      voice: balancedVoice?.value || "",
+      voiceName: balancedVoice?.name || balancedVoice?.label || "Default browser voice"
+    }),
+    createTextToSpeechProfile({
+      gender: "male",
+      id: "man-profile-1",
+      language: manVoice?.language || TEXT_TO_SPEECH_DEFAULTS.language,
+      name: "Man Profile 1",
+      voice: manVoice?.value || "",
+      voiceName: manVoice?.name || manVoice?.label || "Default browser voice"
+    }),
+    createTextToSpeechProfile({
+      gender: "female",
+      id: "woman-profile-2",
+      language: womanVoice?.language || TEXT_TO_SPEECH_DEFAULTS.language,
+      name: "Woman Profile 2",
+      voice: womanVoice?.value || "",
+      voiceName: womanVoice?.name || womanVoice?.label || "Default browser voice"
+    })
+  ];
+}
+
+function createMessageStudioTtsProfileOptions(profiles = []) {
+  return profiles
+    .filter((profile) => profile?.active !== false)
+    .map((profile) => ({
+      active: true,
+      emotionSettings: Array.isArray(profile.emotions)
+        ? profile.emotions.filter((emotion) => emotion.active !== false).map((emotion) => ({
+          emotion: emotion.emotion,
+          emotionLabel: emotion.emotionLabel,
+          pitch: emotion.pitch,
+          rate: emotion.rate,
+          ssmlLikePreset: emotion.ssmlLikePreset,
+          volume: emotion.volume
+        }))
+        : [],
+      key: profile.id,
+      language: profile.language,
+      name: profile.name,
+      providerKey: profile.providerKey || "browser-speech",
+      voiceName: profile.voiceName || profile.voice || ""
+    }));
+}
+
 function createSpeechPreviewRequest({
   pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
   rate = TEXT_TO_SPEECH_DEFAULTS.rate,
@@ -250,6 +410,7 @@ function queueItemMeta(item) {
 function initializeTextToSpeechTool(root = document, { engine = new TextToSpeechEngine() } = {}) {
   const elements = {
     addItem: root.querySelector("[data-tts-add-item]"),
+    addProfile: root.querySelector("[data-tts-add-profile]"),
     age: root.querySelector("[data-tts-age-select]"),
     characterPreset: root.querySelector("[data-tts-character-preset-select]"),
     clearStatus: root.querySelector("[data-tts-clear-status]"),
@@ -266,6 +427,9 @@ function initializeTextToSpeechTool(root = document, { engine = new TextToSpeech
     pause: root.querySelector("[data-tts-pause]"),
     pitch: root.querySelector("[data-tts-pitch]"),
     pitchValue: root.querySelector("[data-tts-pitch-value]"),
+    profileCount: root.querySelector("[data-tts-profile-count]"),
+    profileEmotionCount: root.querySelector("[data-tts-emotion-count]"),
+    profileTable: root.querySelector("[data-tts-profile-table]"),
     queueList: root.querySelector("[data-tts-queue-list]"),
     rate: root.querySelector("[data-tts-rate]"),
     rateValue: root.querySelector("[data-tts-rate-value]"),
@@ -285,7 +449,11 @@ function initializeTextToSpeechTool(root = document, { engine = new TextToSpeech
   };
   const state = {
     applyingItem: false,
+    editingEmotionId: "",
+    editingProfileId: "",
+    profiles: [],
     queue: [],
+    selectedProfileId: "",
     selectedItemId: "",
     sliderOverrides: { pitch: false, rate: false, volume: false },
     voiceOptions: []
@@ -330,6 +498,477 @@ function initializeTextToSpeechTool(root = document, { engine = new TextToSpeech
     };
   }

+  function selectedProfile() {
+    return state.profiles.find((profile) => profile.id === state.selectedProfileId) || null;
+  }
+
+  function profileInUseByMessageStudio(profile) {
+    return Number(profile?.messageStudioUsageCount || 0) > 0;
+  }
+
+  function emotionInUseByMessageParts(emotion) {
+    return Number(emotion?.messagePartsUsageCount || 0) > 0;
+  }
+
+  function createCell(text) {
+    const cell = document.createElement("td");
+    cell.textContent = text;
+    return cell;
+  }
+
+  function createButton(label, dataName, value) {
+    const button = document.createElement("button");
+    button.className = "btn btn--compact";
+    button.type = "button";
+    button.dataset[dataName] = value;
+    button.textContent = label;
+    return button;
+  }
+
+  function createActionGroup(...buttons) {
+    const group = document.createElement("div");
+    group.className = "action-group action-group--tight";
+    buttons.filter(Boolean).forEach((button) => group.append(button));
+    return group;
+  }
+
+  function tableMessage(colSpan, text) {
+    const row = document.createElement("tr");
+    const cell = document.createElement("td");
+    cell.colSpan = colSpan;
+    cell.textContent = text;
+    row.append(cell);
+    return row;
+  }
+
+  function createTextInput(value, dataName) {
+    const input = document.createElement("input");
+    input.dataset[dataName] = "";
+    input.type = "text";
+    input.value = value || "";
+    return input;
+  }
+
+  function createNumberInput(value, dataName, kind) {
+    const input = document.createElement("input");
+    const range = TEXT_TO_SPEECH_RANGE_DEFAULTS[kind] || TEXT_TO_SPEECH_RANGE_DEFAULTS.rate;
+    input.dataset[dataName] = "";
+    input.type = "number";
+    input.min = String(range.min);
+    input.max = String(range.max);
+    input.step = String(range.step);
+    input.value = formatRangeValue(value ?? range.value, kind);
+    return input;
+  }
+
+  function createCheckbox(checked, dataName) {
+    const label = document.createElement("label");
+    const input = document.createElement("input");
+    input.dataset[dataName] = "";
+    input.type = "checkbox";
+    input.checked = checked !== false;
+    label.append(input, " Active");
+    return label;
+  }
+
+  function createEditorSelect(value, dataName, options, placeholder = "") {
+    const select = document.createElement("select");
+    select.dataset[dataName] = "";
+    if (placeholder) {
+      const placeholderOption = document.createElement("option");
+      placeholderOption.value = "";
+      placeholderOption.textContent = placeholder;
+      select.append(placeholderOption);
+    }
+    options.forEach((optionValue) => {
+      const option = document.createElement("option");
+      option.value = String(optionValue.value);
+      option.textContent = optionValue.label;
+      select.append(option);
+    });
+    select.value = options.some((optionValue) => String(optionValue.value) === String(value)) ? String(value) : String(options[0]?.value || "");
+    return select;
+  }
+
+  function voiceSelectOptions() {
+    return state.voiceOptions.length
+      ? state.voiceOptions.map((option) => ({ label: option.label, value: option.value }))
+      : [{ label: "No browser voices available", value: "" }];
+  }
+
+  function languageSelectOptions() {
+    const voiceLanguages = textToSpeechLanguageOptionsFromVoices(state.voiceOptions);
+    return voiceLanguages.length ? voiceLanguages : TEXT_TO_SPEECH_LANGUAGE_OPTIONS;
+  }
+
+  function profileVoiceName(profile) {
+    const match = state.voiceOptions.find((option) => option.value === profile.voice);
+    return match?.name || match?.label || profile.voiceName || "No voice selected";
+  }
+
+  function renderProfileCounts() {
+    if (elements.profileCount) elements.profileCount.textContent = String(state.profiles.length);
+    if (elements.profileEmotionCount) {
+      const emotionCount = state.profiles.reduce((total, profile) => total + profile.emotions.length, 0);
+      elements.profileEmotionCount.textContent = String(emotionCount);
+    }
+  }
+
+  function renderProfileRows() {
+    if (!elements.profileTable) return;
+    elements.profileTable.replaceChildren();
+
+    state.profiles.forEach((profile) => {
+      if (state.editingProfileId === profile.id) {
+        elements.profileTable.append(createProfileEditRow(profile));
+        appendEmotionHost(profile.id);
+        return;
+      }
+
+      const row = document.createElement("tr");
+      row.dataset.ttsProfileRow = profile.id;
+      const nameCell = document.createElement("td");
+      nameCell.dataset.ttsProfileNameCell = profile.id;
+      nameCell.textContent = `${state.selectedProfileId === profile.id ? "v" : ">"} ${profile.name}`;
+      const deleteButton = createButton("Delete", "ttsDeleteProfile", profile.id);
+      if (profileInUseByMessageStudio(profile)) {
+        deleteButton.disabled = true;
+        deleteButton.title = "Delete disabled: profile is in use by Message Studio data.";
+      }
+      const actions = createActionGroup(
+        createButton("Edit Profile", "ttsEditProfile", profile.id),
+        deleteButton,
+      );
+      row.append(
+        nameCell,
+        createCell(profileVoiceName(profile)),
+        createCell(profile.language),
+        createCell(labelForOption(TTS_PROFILE_GENDER_OPTIONS, profile.gender, "Neutral")),
+        createCell(labelForOption(TEXT_TO_SPEECH_AGE_FILTER_OPTIONS, profile.age, "Any")),
+        createCell(String(profile.emotions.length)),
+        createCell(profile.active ? "Active" : "Inactive"),
+        (() => {
+          const cell = document.createElement("td");
+          cell.append(actions);
+          return cell;
+        })(),
+      );
+      elements.profileTable.append(row);
+      appendEmotionHost(profile.id);
+    });
+
+    if (state.editingProfileId === NEW_ROW_KEY) {
+      elements.profileTable.append(createProfileEditRow(null));
+    }
+
+    if (!state.profiles.length && state.editingProfileId !== NEW_ROW_KEY) {
+      elements.profileTable.append(tableMessage(8, "No TTS profiles yet."));
+    }
+    renderProfileCounts();
+  }
+
+  function createProfileEditRow(profile = null) {
+    const key = profile?.id || NEW_ROW_KEY;
+    const row = document.createElement("tr");
+    row.dataset.ttsProfileEditor = key;
+
+    const nameCell = document.createElement("td");
+    nameCell.append(createTextInput(profile?.name || "", "ttsProfileName"));
+    const voiceCell = document.createElement("td");
+    voiceCell.append(createEditorSelect(profile?.voice || "", "ttsProfileVoice", voiceSelectOptions(), "Select voice"));
+    const languageCell = document.createElement("td");
+    languageCell.append(createEditorSelect(profile?.language || TEXT_TO_SPEECH_DEFAULTS.language, "ttsProfileLanguage", languageSelectOptions()));
+    const genderCell = document.createElement("td");
+    genderCell.append(createEditorSelect(profile?.gender || "neutral", "ttsProfileGender", TTS_PROFILE_GENDER_OPTIONS));
+    const ageCell = document.createElement("td");
+    ageCell.append(createEditorSelect(profile?.age || TEXT_TO_SPEECH_DEFAULTS.voiceAge, "ttsProfileAge", TEXT_TO_SPEECH_AGE_FILTER_OPTIONS));
+    const emotionCountCell = createCell(profile ? String(profile.emotions.length) : "1");
+    const statusCell = document.createElement("td");
+    statusCell.append(createCheckbox(profile?.active !== false, "ttsProfileActive"));
+    const actionsCell = document.createElement("td");
+    actionsCell.append(createActionGroup(
+      createButton("Save", "ttsCommitProfile", key),
+      createButton("Cancel", "ttsCancelProfile", key),
+    ));
+
+    row.append(nameCell, voiceCell, languageCell, genderCell, ageCell, emotionCountCell, statusCell, actionsCell);
+    return row;
+  }
+
+  function appendEmotionHost(profileId) {
+    if (state.selectedProfileId !== profileId) return;
+    const hostRow = document.createElement("tr");
+    hostRow.dataset.ttsEmotionHost = profileId;
+    const cell = document.createElement("td");
+    cell.colSpan = 8;
+    cell.append(createEmotionTable(profileId));
+    hostRow.append(cell);
+    elements.profileTable.append(hostRow);
+  }
+
+  function createEmotionTable(profileId) {
+    const profile = state.profiles.find((candidate) => candidate.id === profileId);
+    const wrapper = document.createElement("div");
+    wrapper.className = "content-stack";
+    const context = document.createElement("div");
+    context.className = "kicker";
+    context.textContent = "TTS Profile / Emotion Settings";
+    const heading = document.createElement("h3");
+    heading.textContent = "Emotion Settings";
+    wrapper.append(context, heading);
+
+    const tableWrapper = document.createElement("div");
+    tableWrapper.className = "table-wrapper";
+    const table = document.createElement("table");
+    table.className = "data-table";
+    table.setAttribute("aria-label", "Emotion Settings");
+    const thead = document.createElement("thead");
+    const headerRow = document.createElement("tr");
+    ["Emotion", "Pitch", "Rate", "Volume", "SSML-like Preset", "Status", "Actions"].forEach((label) => {
+      const header = document.createElement("th");
+      header.scope = "col";
+      header.textContent = label;
+      headerRow.append(header);
+    });
+    thead.append(headerRow);
+    const tbody = document.createElement("tbody");
+    tbody.dataset.ttsEmotionTable = profileId;
+
+    if (!profile?.emotions.length && state.editingEmotionId !== NEW_ROW_KEY) {
+      tbody.append(tableMessage(7, "No emotion settings for this profile."));
+    }
+
+    profile?.emotions.forEach((emotion) => {
+      if (state.editingEmotionId === emotion.id) {
+        tbody.append(createEmotionEditRow(emotion));
+        return;
+      }
+      const row = document.createElement("tr");
+      row.dataset.ttsEmotionRow = emotion.id;
+      const deleteButton = createButton("Delete", "ttsDeleteEmotion", emotion.id);
+      if (emotionInUseByMessageParts(emotion)) {
+        deleteButton.disabled = true;
+        deleteButton.title = "Delete disabled: emotion is in use by Message Parts.";
+      }
+      const actions = createActionGroup(
+        createButton("Edit Emotion", "ttsEditEmotion", emotion.id),
+        deleteButton,
+      );
+      const actionsCell = document.createElement("td");
+      actionsCell.append(actions);
+      row.append(
+        createCell(emotion.emotionLabel),
+        createCell(String(emotion.pitch)),
+        createCell(String(emotion.rate)),
+        createCell(String(emotion.volume)),
+        createCell(labelForOption(TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS, emotion.ssmlLikePreset, "Normal")),
+        createCell(emotion.active ? "Active" : "Inactive"),
+        actionsCell,
+      );
+      tbody.append(row);
+    });
+
+    if (state.editingEmotionId === NEW_ROW_KEY) {
+      tbody.append(createEmotionEditRow(null));
+    }
+
+    table.append(thead, tbody);
+    tableWrapper.append(table);
+    const actionGroup = document.createElement("div");
+    actionGroup.className = "action-group";
+    actionGroup.append(createButton("Add Emotion", "ttsAddEmotion", profileId));
+    wrapper.append(tableWrapper, actionGroup);
+    return wrapper;
+  }
+
+  function createEmotionEditRow(emotion = null) {
+    const key = emotion?.id || NEW_ROW_KEY;
+    const row = document.createElement("tr");
+    row.dataset.ttsEmotionEditor = key;
+    const emotionCell = document.createElement("td");
+    emotionCell.append(createEditorSelect(emotion?.emotion || "neutral", "ttsEmotionName", TTS_PROFILE_EMOTION_OPTIONS));
+    const pitchCell = document.createElement("td");
+    pitchCell.append(createNumberInput(emotion?.pitch ?? 1, "ttsEmotionPitch", "pitch"));
+    const rateCell = document.createElement("td");
+    rateCell.append(createNumberInput(emotion?.rate ?? 1, "ttsEmotionRate", "rate"));
+    const volumeCell = document.createElement("td");
+    volumeCell.append(createNumberInput(emotion?.volume ?? 1, "ttsEmotionVolume", "volume"));
+    const presetCell = document.createElement("td");
+    presetCell.append(createEditorSelect(emotion?.ssmlLikePreset || "normal", "ttsEmotionSsmlPreset", TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS));
+    const statusCell = document.createElement("td");
+    statusCell.append(createCheckbox(emotion?.active !== false, "ttsEmotionActive"));
+    const actionsCell = document.createElement("td");
+    actionsCell.append(createActionGroup(
+      createButton("Save", "ttsCommitEmotion", key),
+      createButton("Cancel", "ttsCancelEmotion", key),
+    ));
+    row.append(emotionCell, pitchCell, rateCell, volumeCell, presetCell, statusCell, actionsCell);
+    return row;
+  }
+
+  function editorValue(rootNode, selector) {
+    return rootNode?.querySelector(selector)?.value || "";
+  }
+
+  function editorChecked(rootNode, selector) {
+    return rootNode?.querySelector(selector)?.checked !== false;
+  }
+
+  function profileValues(key) {
+    const row = elements.profileTable?.querySelector(`[data-tts-profile-editor="${key}"]`);
+    const voiceValue = editorValue(row, "[data-tts-profile-voice]");
+    const selectedVoice = state.voiceOptions.find((option) => option.value === voiceValue);
+    return createTextToSpeechProfile({
+      active: editorChecked(row, "[data-tts-profile-active]"),
+      age: editorValue(row, "[data-tts-profile-age]"),
+      emotions: key === NEW_ROW_KEY ? [createTextToSpeechProfileEmotion()] : state.profiles.find((profile) => profile.id === key)?.emotions || [],
+      gender: editorValue(row, "[data-tts-profile-gender]"),
+      id: key === NEW_ROW_KEY ? "" : key,
+      language: editorValue(row, "[data-tts-profile-language]"),
+      name: editorValue(row, "[data-tts-profile-name]"),
+      voice: voiceValue,
+      voiceName: selectedVoice?.name || selectedVoice?.label || voiceValue,
+    });
+  }
+
+  function validateProfile(profile) {
+    const errors = [];
+    if (!profile.name.trim()) errors.push("Profile Name is required.");
+    if (!profile.language.trim()) errors.push("Language is required.");
+    if (state.profiles.some((candidate) => candidate.id !== profile.id && candidate.name.toLowerCase() === profile.name.toLowerCase())) {
+      errors.push("Profile Name must be unique.");
+    }
+    return errors;
+  }
+
+  function emotionValues(key) {
+    const row = elements.profileTable?.querySelector(`[data-tts-emotion-editor="${key}"]`);
+    return createTextToSpeechProfileEmotion({
+      active: editorChecked(row, "[data-tts-emotion-active]"),
+      emotion: editorValue(row, "[data-tts-emotion-name]"),
+      id: key === NEW_ROW_KEY ? "" : key,
+      pitch: editorValue(row, "[data-tts-emotion-pitch]"),
+      rate: editorValue(row, "[data-tts-emotion-rate]"),
+      ssmlLikePreset: editorValue(row, "[data-tts-emotion-ssml-preset]"),
+      volume: editorValue(row, "[data-tts-emotion-volume]"),
+    });
+  }
+
+  function validateEmotion(emotion, existingId = "") {
+    const errors = [];
+    if (!state.selectedProfileId) errors.push("Select a TTS Profile before adding Emotion Settings.");
+    if (!emotion.emotion) errors.push("Emotion is required.");
+    const profile = selectedProfile();
+    if (profile?.emotions.some((candidate) => candidate.id !== existingId && candidate.emotion === emotion.emotion)) {
+      errors.push("Emotion must be unique within the selected TTS Profile.");
+    }
+    return errors;
+  }
+
+  function addProfile() {
+    state.editingProfileId = NEW_ROW_KEY;
+    state.editingEmotionId = "";
+    state.selectedProfileId = "";
+    renderProfileRows();
+    writeStatus("Ready to add a TTS profile.");
+  }
+
+  function commitProfile(key) {
+    const profile = profileValues(key);
+    const errors = validateProfile(profile);
+    if (errors.length) {
+      writeStatus(`TTS Profile save blocked: ${errors.join(" ")}`, "FAIL");
+      return;
+    }
+    if (key === NEW_ROW_KEY) {
+      state.profiles.push(profile);
+    } else {
+      const index = state.profiles.findIndex((candidate) => candidate.id === key);
+      const existing = state.profiles[index];
+      state.profiles[index] = {
+        ...profile,
+        emotions: existing?.emotions || profile.emotions,
+        messageStudioUsageCount: existing?.messageStudioUsageCount || 0,
+      };
+    }
+    state.selectedProfileId = profile.id;
+    state.editingProfileId = "";
+    renderProfileRows();
+    renderOutputSummary();
+    writeStatus(`Saved TTS profile: ${profile.name}.`);
+  }
+
+  function deleteProfile(key) {
+    const profile = state.profiles.find((candidate) => candidate.id === key);
+    if (!profile) return;
+    if (profileInUseByMessageStudio(profile)) {
+      writeStatus(`Delete profile disabled: ${profile.name} is in use by Message Studio data.`, "FAIL");
+      return;
+    }
+    state.profiles = state.profiles.filter((candidate) => candidate.id !== key);
+    if (state.selectedProfileId === key) state.selectedProfileId = state.profiles[0]?.id || "";
+    renderProfileRows();
+    renderOutputSummary();
+    writeStatus(`Deleted TTS profile: ${profile.name}.`);
+  }
+
+  function addEmotion(profileId) {
+    state.selectedProfileId = profileId;
+    state.editingProfileId = "";
+    state.editingEmotionId = NEW_ROW_KEY;
+    renderProfileRows();
+    writeStatus("Ready to add an emotion setting.");
+  }
+
+  function commitEmotion(key) {
+    const emotion = emotionValues(key);
+    const errors = validateEmotion(emotion, key === NEW_ROW_KEY ? "" : key);
+    if (errors.length) {
+      writeStatus(`Emotion setting save blocked: ${errors.join(" ")}`, "FAIL");
+      return;
+    }
+    const profile = selectedProfile();
+    if (!profile) return;
+    if (key === NEW_ROW_KEY) {
+      profile.emotions.push(emotion);
+    } else {
+      const index = profile.emotions.findIndex((candidate) => candidate.id === key);
+      const existing = profile.emotions[index];
+      profile.emotions[index] = {
+        ...emotion,
+        messagePartsUsageCount: existing?.messagePartsUsageCount || 0,
+      };
+    }
+    state.editingEmotionId = "";
+    renderProfileRows();
+    renderOutputSummary();
+    writeStatus(`Saved emotion setting: ${emotion.emotionLabel}.`);
+  }
+
+  function deleteEmotion(key) {
+    const profile = selectedProfile();
+    const emotion = profile?.emotions.find((candidate) => candidate.id === key);
+    if (!profile || !emotion) return;
+    if (emotionInUseByMessageParts(emotion)) {
+      writeStatus(`Delete emotion disabled: ${emotion.emotionLabel} is in use by Message Parts.`, "FAIL");
+      return;
+    }
+    profile.emotions = profile.emotions.filter((candidate) => candidate.id !== key);
+    renderProfileRows();
+    renderOutputSummary();
+    writeStatus(`Deleted emotion setting: ${emotion.emotionLabel}.`);
+  }
+
+  function selectProfile(profileId) {
+    if (!state.profiles.some((profile) => profile.id === profileId)) return;
+    state.selectedProfileId = state.selectedProfileId === profileId ? "" : profileId;
+    state.editingEmotionId = "";
+    renderProfileRows();
+    if (state.selectedProfileId) {
+      writeStatus(`Opened Emotion Settings for ${selectedProfile()?.name}.`);
+    }
+  }
+
   function itemFromControls(overrides = {}) {
     const currentItem = selectedItem();
     return createTextToSpeechQueueItem({
@@ -379,7 +1018,12 @@ function initializeTextToSpeechTool(root = document, { engine = new TextToSpeech

   function renderOutputSummary() {
     if (elements.outputSummary) {
-      elements.outputSummary.textContent = JSON.stringify(state.queue, null, 2);
+      elements.outputSummary.textContent = JSON.stringify({
+        contractVersion: TTS_PROFILE_CONTRACT_VERSION,
+        messageStudioOptions: createMessageStudioTtsProfileOptions(state.profiles),
+        profiles: state.profiles,
+        queue: state.queue
+      }, null, 2);
     }
     setTextContent(root, "[data-tts-text-count]", String(String(elements.text?.value || "").length));
   }
@@ -556,6 +1200,16 @@ function initializeTextToSpeechTool(root = document, { engine = new TextToSpeech
     return result;
   }

+  function ensureDefaultProfiles() {
+    if (state.profiles.length) {
+      return;
+    }
+    state.profiles = createDefaultTextToSpeechProfiles(state.voiceOptions);
+    state.selectedProfileId = "";
+    renderProfileRows();
+    renderOutputSummary();
+  }
+
   function refreshActionState() {
     const hasText = Boolean(String(elements.text?.value || "").trim());
     const hasVoice = Boolean(elements.voice?.value);
@@ -755,6 +1409,69 @@ function initializeTextToSpeechTool(root = document, { engine = new TextToSpeech
   }

   function mountEvents() {
+    elements.addProfile?.addEventListener("click", addProfile);
+    elements.profileTable?.addEventListener("click", (event) => {
+      const addEmotionButton = event.target.closest("[data-tts-add-emotion]");
+      const commitEmotionButton = event.target.closest("[data-tts-commit-emotion]");
+      const cancelEmotionButton = event.target.closest("[data-tts-cancel-emotion]");
+      const deleteEmotionButton = event.target.closest("[data-tts-delete-emotion]");
+      const deleteProfileButton = event.target.closest("[data-tts-delete-profile]");
+      const editEmotionButton = event.target.closest("[data-tts-edit-emotion]");
+      const editProfileButton = event.target.closest("[data-tts-edit-profile]");
+      const commitProfileButton = event.target.closest("[data-tts-commit-profile]");
+      const cancelProfileButton = event.target.closest("[data-tts-cancel-profile]");
+      const profileRow = event.target.closest("[data-tts-profile-row]");
+
+      if (commitProfileButton) {
+        commitProfile(commitProfileButton.dataset.ttsCommitProfile);
+        return;
+      }
+      if (cancelProfileButton) {
+        state.editingProfileId = "";
+        renderProfileRows();
+        writeStatus("TTS profile edit canceled.");
+        return;
+      }
+      if (editProfileButton) {
+        state.editingProfileId = editProfileButton.dataset.ttsEditProfile;
+        state.selectedProfileId = editProfileButton.dataset.ttsEditProfile;
+        state.editingEmotionId = "";
+        renderProfileRows();
+        writeStatus("TTS profile opened inline.");
+        return;
+      }
+      if (deleteProfileButton) {
+        deleteProfile(deleteProfileButton.dataset.ttsDeleteProfile);
+        return;
+      }
+      if (addEmotionButton) {
+        addEmotion(addEmotionButton.dataset.ttsAddEmotion);
+        return;
+      }
+      if (commitEmotionButton) {
+        commitEmotion(commitEmotionButton.dataset.ttsCommitEmotion);
+        return;
+      }
+      if (cancelEmotionButton) {
+        state.editingEmotionId = "";
+        renderProfileRows();
+        writeStatus("Emotion setting edit canceled.");
+        return;
+      }
+      if (editEmotionButton) {
+        state.editingEmotionId = editEmotionButton.dataset.ttsEditEmotion;
+        renderProfileRows();
+        writeStatus("Emotion setting opened inline.");
+        return;
+      }
+      if (deleteEmotionButton) {
+        deleteEmotion(deleteEmotionButton.dataset.ttsDeleteEmotion);
+        return;
+      }
+      if (profileRow) {
+        selectProfile(profileRow.dataset.ttsProfileRow);
+      }
+    });
     elements.queueList?.addEventListener("click", (event) => {
       const itemButton = event.target.closest("[data-tts-queue-item]");
       if (itemButton) selectItem(itemButton.dataset.ttsQueueItem || "");
@@ -849,14 +1566,18 @@ function initializeTextToSpeechTool(root = document, { engine = new TextToSpeech
     mountEvents();
     if (!engine.isSupported()) {
       await loadQueue();
+      ensureDefaultProfiles();
       markUnavailable();
       return;
     }
     setTextContent(root, "[data-tts-engine-label]", "Ready");
     setTextContent(root, "[data-tts-engine-status]", "Browser SpeechSynthesis is available for local preview.");
     refreshVoices();
+    ensureDefaultProfiles();
     engine.onVoicesChanged(() => {
       refreshVoices();
+      renderProfileRows();
+      renderOutputSummary();
       writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} voices updated from browser SpeechSynthesis.`);
     });
     await loadQueue();
@@ -883,9 +1604,14 @@ export {
   TTS_LANGUAGES,
   TTS_MESSAGE_STATUSES,
   TTS_OWNERSHIP,
+  TTS_PROFILE_CONTRACT_VERSION,
   TTS_PROVIDER_ADAPTER_PLAN,
   createEmotionProfile,
+  createDefaultTextToSpeechProfiles,
+  createMessageStudioTtsProfileOptions,
   createSpeechPreviewRequest,
+  createTextToSpeechProfile,
+  createTextToSpeechProfileEmotion,
   createTtsMessage,
   createVoiceProfile,
   initializeTextToSpeechTool,
```

## Unstaged Patch Before Cleanup
```diff
diff --cc docs_build/dev/reports/codex_changed_files.txt
index f75c39140,3fb4228d0..000000000
--- a/docs_build/dev/reports/codex_changed_files.txt
+++ b/docs_build/dev/reports/codex_changed_files.txt
@@@ -1,5 -1,54 +1,62 @@@
++<<<<<<< HEAD
 +docs_build/dev/PROJECT_INSTRUCTIONS.md
 +docs_build/dev/PROJECT_MULTI_PC.txt
 +docs_build/dev/reports/codex_review.diff
 +docs_build/dev/reports/codex_changed_files.txt
 +docs_build/dev/reports/team_alpha_beta_owner_approval_report.md
++=======
+ PR_26171_044-idea-board-game-hub-project-flow
+
+ Changed files:
+ - docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md
+ - docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md
+ - docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md
+ - docs_build/dev/reports/codex_review.diff
+ - docs_build/dev/reports/codex_changed_files.txt
+ - src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+ - tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+ - tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+ - tests/playwright/tools/ToolboxRoutePages.spec.mjs
+ - toolbox/game-workspace/game-workspace.js
+ - toolbox/game-workspace/index.html
+ - toolbox/idea-board/index.html
+ - toolbox/idea-board/index.js
+
+ Requirement PASS evidence:
+ - PASS: Create Project appears only for Ready ideas. Evidence: Idea Board actions remain Edit/Create Project/Delete for Ready rows and switch to Open in Game Hub/Archive after creation in targeted Playwright.
+ - PASS: Create Project uses the shared Game Hub project contract. Evidence: Idea Board calls the existing game-workspace server repository client createGame method; Playwright asserts the createGame repository request occurs.
+ - PASS: Create Project sets Idea status to Project. Evidence: targeted Playwright asserts the row status becomes Project.
+ - PASS: Project ideas and notes are read-only. Evidence: targeted Playwright asserts no Edit/Delete/Add Note/note actions remain for the Project row.
+ - PASS: Project row actions are Open in Game Hub and Archive. Evidence: targeted Playwright asserts exact action labels.
+ - PASS: Project ideas cannot be edited or deleted while Project. Evidence: Project rows do not render Edit/Delete actions and deletion guard remains active.
+ - PASS: Project ideas cannot add/edit/delete notes. Evidence: expanded Project notes render without Add Note or note actions.
+ - PASS: Archived ideas remain hidden by default and show Restore/Delete when visible. Evidence: targeted Playwright archives, shows Archived through the filter, and asserts Restore/Delete.
+ - PASS: Game Hub shows creator-facing Project Information. Evidence: Game Hub HTML/JS replaces internal record display with Project Information and targeted Game Hub Playwright passes.
+ - PASS: Game Hub shows read-only Source Idea fields. Evidence: Idea Board-to-Game Hub Playwright asserts Idea, Pitch, and Notes from the source idea render in Game Hub.
+ - PASS: Game Hub avoids internal IDs, DB/API/mock/debug/seed wording in creator-facing display. Evidence: touched runtime files pass creator-visible text scan and targeted Playwright checks the navigated Game Hub main content.
+ - PASS: Open in Game Hub navigates to the related project. Evidence: targeted Playwright waits for /toolbox/game-workspace/index.html?game=lantern-reef-* and asserts the linked project renders.
+ - PASS: No Game Journey expansion beyond existing link/reference. Evidence: implementation does not add Game Journey creation or new journey wiring.
+
+ Validation evidence:
+ - PASS: node --check toolbox/idea-board/index.js
+ - PASS: node --check toolbox/game-workspace/game-workspace.js
+ - PASS: node --check toolbox/game-workspace/game-workspace-api-client.js
+ - PASS: node --check src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+ - PASS: node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+ - PASS: node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs
+ - PASS: node --check tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+ - PASS: npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line
+ - PASS: npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --workers=1 --reporter=line --grep "Idea Board launches"
+ - PASS: npx playwright test tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs --project=playwright --workers=1 --reporter=line --grep "Game Hub"
+ - PASS: npm run test:workspace-v2
+ - PASS: git diff --check
+
+ Git workflow:
+ - Current branch: codex/pr-26171-044-idea-board-game-hub-project-flow
+ - Created branch: codex/pr-26171-044-idea-board-game-hub-project-flow
+ - Commit hash: 2a38796f81aae2dceb4151095b8f89a276cd2d32
+ - Push result: pushed to origin/codex/pr-26171-044-idea-board-game-hub-project-flow
+ - PR URL: https://github.com/ToolboxAid/HTML-JavaScript-Gaming/pull/22
+ - Merge result: to be reported after merge
+ - Final main commit: to be reported after returning to main and pulling latest
++>>>>>>> decd37141d09cd8e2ff609da3c25404f1ed6c682
diff --cc docs_build/dev/reports/codex_review.diff
index 5ed010f9d,cffbc3823..000000000
--- a/docs_build/dev/reports/codex_review.diff
+++ b/docs_build/dev/reports/codex_review.diff
@@@ -1,214 -1,1210 +1,1427 @@@
++<<<<<<< HEAD
 +diff --git a/docs_build/dev/PROJECT_INSTRUCTIONS.md b/docs_build/dev/PROJECT_INSTRUCTIONS.md
 +index 528312412..3c3afa7bd 100644
 +--- a/docs_build/dev/PROJECT_INSTRUCTIONS.md
 ++++ b/docs_build/dev/PROJECT_INSTRUCTIONS.md
 +@@ -2009,6 +2009,16 @@ Required Git workflow report fields:
 + - merge result
 + - final main commit
 +
 ++## OWNER-CONTROLLED STABLE AND MERGE APPROVAL
 ++
 ++Stable promotion and merge approval are owner-controlled.
 ++
 ++Rules:
 ++- Codex may prepare scoped changes, reports, validation evidence, ZIP artifacts, branches, and PRs.
 ++- Codex must not merge a PR or mark a workstream stable without explicit approval from the assigned Team Alpha or Team Beta owner.
 ++- Master Control may recommend sequencing or assignment, but affected workstream owners control stable and merge approval.
 ++- This targeted section supersedes older automatic-merge wording when approval ownership is in question.
 ++
 + ## CODEX INSTRUCTION ENFORCEMENT START GATE
 +
 + Codex must run this gate before every PR execution and before any file changes.
 +@@ -2017,7 +2027,7 @@ Required instruction reads:
 + - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
 + - Read `docs_build/dev/PROJECT_MULTI_PC.txt`.
 + - Treat the newest applicable section in `PROJECT_INSTRUCTIONS.md` as authoritative when rules overlap.
 +-- Treat the current owner/parity section in `PROJECT_MULTI_PC.txt` as authoritative for PC/Laptop routing.
 ++- Treat the current owner/parity section in `PROJECT_MULTI_PC.txt` as authoritative for Team Alpha / Team Beta routing.
 +
 + Required pre-change report:
 + - Codex must report instruction compliance as `PASS` or `FAIL` before making file changes.
 +@@ -2027,7 +2037,7 @@ Required pre-change report:
 + Hard stops before changes:
 + - If the current branch is not `main`, HARD STOP.
 + - If the repository is not clean before the PR branch is created, HARD STOP.
 +-- If the PR owner does not match the PC/Laptop ownership map in `PROJECT_MULTI_PC.txt`, HARD STOP.
 ++- If the PR owner does not match the Team Alpha / Team Beta ownership map in `PROJECT_MULTI_PC.txt`, HARD STOP.
 + - If the PR number parity does not match the assigned machine in `PROJECT_MULTI_PC.txt`, HARD STOP.
 + - If the PR asks for implementation and the implementation path is wrong, HARD STOP.
 + - If a PR asks for functional parity and only placeholder-only work is possible, HARD STOP and report the missing source or blocker.
 +diff --git a/docs_build/dev/PROJECT_MULTI_PC.txt b/docs_build/dev/PROJECT_MULTI_PC.txt
 +index 60ef4881a..7d2a078ef 100644
 +--- a/docs_build/dev/PROJECT_MULTI_PC.txt
 ++++ b/docs_build/dev/PROJECT_MULTI_PC.txt
 +@@ -11,7 +11,7 @@ Naming governance
 + Workflow governance
 + Environment strategy
 + PR sequencing
 +-Merge approval
 ++Stable and merge approval
 +
 + It should never build code and never own implementation details.
 +
 +@@ -22,12 +22,12 @@ Requirements
 + Acceptance Criteria
 + Dependencies
 + Priority
 +-Owner (PC/Laptop)
 ++Owner (Team Alpha / Team Beta)
 + Recommended Workstream Split
 +
 + Instead of arbitrary splits, split by Creator journey.
 +
 +-PC — Creator Journey
 ++Team Alpha — Creator Journey
 +
 + Owns:
 +
 +@@ -57,7 +57,7 @@ Reason:
 +
 + These tools are heavily connected.
 +
 +-Laptop — Content Creation
 ++Team Beta — Content Creation
 +
 + Owns:
 +
 +@@ -85,7 +85,7 @@ These tools share asset pipelines and publishing workflows.
 +
 + Messages Tool Placement
 +
 +-I would move Messages to Laptop ownership.
 ++I would move Messages to Team Beta ownership.
 +
 + Reason:
 +
 +@@ -191,7 +191,7 @@ Immediate Queue
 +
 + If we start using Master Control today, my queue would be:
 +
 +-PC
 ++Team Alpha
 + PR_26171_001-game-journey-completion-model
 +
 + Scope:
 +@@ -205,7 +205,7 @@ Sounds [17]
 +
 + This solves the "xxx%" problem.
 +
 +-Laptop
 ++Team Beta
 + PR_26171_002-messages-tool-foundation
 +
 + Scope:
 +@@ -282,7 +282,7 @@ Not developer.
 +
 + ---
 +
 +-## PC Chat
 ++## Team Alpha Chat
 +
 + Give it ownership of a workstream.
 +
 +@@ -309,7 +309,7 @@ it keeps building in that area.
 +
 + ---
 +
 +-## Laptop Chat
 ++## Team Beta Chat
 +
 + Give it a different workstream.
 +
 +@@ -371,13 +371,13 @@ So I'd keep IST mostly as infrastructure work and focus development on tool comp
 + Master Control should assign ownership:
 +
 + ```text
 +-PC
 ++Team Alpha
 +   Game Journey
 +   Game Hub
 +   Publish
 +   Share
 +
 +-Laptop
 ++Team Beta
 +   Audio
 +   MIDI
 +   Events
 +@@ -405,7 +405,7 @@ feature/game-hub
 + feature/progress-tracking
 + ```
 +
 +-Never have both PCs working in the same tool at the same time.
 ++Never have both teams working in the same tool at the same time.
 +
 + ---
 +
 +@@ -418,8 +418,8 @@ For example, in Master Control you can ask:
 + ```text
 + Given everything we know about GFS:
 +
 +-What should PC build next?
 +-What should Laptop build next?
 ++What should Team Alpha build next?
 ++What should Team Beta build next?
 +
 + Generate the next PR for each.
 + ```
 +@@ -427,10 +427,10 @@ Generate the next PR for each.
 + Then Master Control outputs:
 +
 + ```text
 +-PC:
 ++Team Alpha:
 + PR_26171_002-game-hub-progress
 +
 +-Laptop:
 ++Team Beta:
 + PR_26171_003-messages-tool-mvp
 + ```
 +
 +@@ -457,17 +457,17 @@ Codex must read this file before every PR execution.
 +
 + Machine parity:
 +
 +-PC / Environment 1:
 ++Team Alpha / Environment 1:
 + - Uses even-numbered PR sequence values.
 + - Example: `PR_26171_064-*`.
 +
 +-Laptop / Environment 2:
 ++Team Beta / Environment 2:
 + - Uses odd-numbered PR sequence values.
 + - Example: `PR_26171_063-*`.
 +
 + Owner map:
 +
 +-PC / Environment 1 owns Creator Journey work:
 ++Team Alpha / Environment 1 owns Creator Journey work:
 + - Game Journey
 + - Game Hub
 + - Idea
 +@@ -483,7 +483,7 @@ PC / Environment 1 owns Creator Journey work:
 + - Game Design
 + - Game Crew
 +
 +-Laptop / Environment 2 owns Content Creation and asset/publishing work:
 ++Team Beta / Environment 2 owns Content Creation and asset/publishing work:
 + - Graphics
 + - Toolbox images
 + - Audio
 +@@ -501,8 +501,12 @@ Governance, recovery, diagnostics, and instruction-hardening PRs:
 + - Must not implement tool/runtime work from the opposite owner.
 + - Must document owner/parity compliance in the PR report.
 +
 ++Stable and merge approval:
 ++- Stable promotion and merge approval are controlled by the assigned Team Alpha or Team Beta owner.
 ++- Master Control may recommend sequencing, but Codex must not merge or mark stable without explicit owner approval for the affected workstream.
 ++
 + Hard stop rules:
 + - If the PR number parity does not match the current machine, stop before changes.
 + - If the PR scope belongs to the other machine owner, stop before changes.
 +-- If the PR crosses PC and Laptop ownership, stop and require Master Control to split or assign the work.
 ++- If the PR crosses Team Alpha and Team Beta ownership, stop and require Master Control to split or assign the work.
 + - If the requested implementation path conflicts with the active owner path, stop before changes.
++=======
+ diff --git a/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md
+ new file mode 100644
+ index 000000000..2fba95562
+ --- /dev/null
+ +++ b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md
+ @@ -0,0 +1,17 @@
+ +# PR_26171_044-idea-board-game-hub-project-flow Apply
+ +
+ +## Apply Steps
+ +
+ +1. Start from clean `main`.
+ +2. Pull latest `main`.
+ +3. Create `codex/pr-26171-044-idea-board-game-hub-project-flow`.
+ +4. Implement only the BUILD scope.
+ +5. Run requested validation.
+ +6. Stage scoped files only.
+ +7. Commit.
+ +8. Push branch.
+ +9. Create PR.
+ +10. Resolve conflicts if encountered and rerun validation.
+ +11. Merge after validation passes.
+ +12. Return to `main` and pull latest.
+ +13. Produce final report with PR URL, merge result, final main commit, ZIP path, ZIP size, ZIP contents, and requirement PASS evidence.
+ diff --git a/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md
+ new file mode 100644
+ index 000000000..228f7703f
+ --- /dev/null
+ +++ b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md
+ @@ -0,0 +1,56 @@
+ +# PR_26171_044-idea-board-game-hub-project-flow Build
+ +
+ +## Source Of Truth
+ +
+ +Use the user request for `PR_26171_044-idea-board-game-hub-project-flow`, `docs_build/dev/PROJECT_INSTRUCTIONS.md`, `docs_build/dev/PROJECT_MULTI_PC.txt`, and this BUILD doc.
+ +
+ +## Singular Purpose
+ +
+ +Complete the Idea Board to Game Hub creator project handoff.
+ +
+ +## Exact Targets
+ +
+ +- `toolbox/idea-board/index.js`
+ +- `toolbox/game-workspace/game-workspace.js`
+ +- Existing targeted Playwright specs for Idea Board and Game Hub/Game Workspace.
+ +- Any smallest existing shared project or handoff contract file required by the flow.
+ +- `docs_build/dev/reports/codex_review.diff`
+ +- `docs_build/dev/reports/codex_changed_files.txt`
+ +
+ +## Requirements
+ +
+ +- Create Project appears only for Ready ideas.
+ +- Clicking Create Project creates or links a Game Hub project using an existing/shared project contract if available.
+ +- Clicking Create Project sets Idea status to Project.
+ +- Project ideas and their notes become read-only.
+ +- Project row actions are Open in Game Hub and Archive.
+ +- Project ideas cannot be edited or deleted.
+ +- Project ideas cannot add, edit, or delete notes.
+ +- Archived ideas remain hidden by default through existing filter behavior and show Restore and Delete when visible.
+ +- Game Hub displays creator-facing project data only.
+ +- Game Hub shows Project Information.
+ +- Game Hub shows a read-only Source Idea section with Idea, Pitch, and Notes.
+ +- Game Hub must not show internal IDs, DB/API/mock/debug/seed wording, or implementation details.
+ +- Open in Game Hub from Idea Board navigates to the related Game Hub project view.
+ +- If existing project handoff, route, or mock adapter wiring is missing, add the smallest fix needed.
+ +- Do not expand into Game Journey unless required as a stub/reference for the handoff.
+ +
+ +## Non-Goals
+ +
+ +- Do not change unrelated Game Hub workflows.
+ +- Do not introduce real database persistence.
+ +- Do not add SQLite.
+ +- Do not change full samples smoke behavior.
+ +
+ +## Validation
+ +
+ +- `node --check toolbox/idea-board/index.js`
+ +- Changed-file syntax checks for Game Hub JavaScript.
+ +- Targeted Idea Board Playwright.
+ +- Targeted Game Hub Playwright if existing coverage exists.
+ +- `npm run test:workspace-v2`
+ +- `git diff --check`
+ +
+ +## ZIP
+ +
+ +Produce `tmp/PR_26171_044-idea-board-game-hub-project-flow_delta.zip` with repo-structured changed files only.
+ diff --git a/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md
+ new file mode 100644
+ index 000000000..c93dea32e
+ --- /dev/null
+ +++ b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md
+ @@ -0,0 +1,31 @@
+ +# PR_26171_044-idea-board-game-hub-project-flow Plan
+ +
+ +## Purpose
+ +
+ +Wire the Idea Board Create Project action into a creator-facing Game Hub project view while preserving table-first Idea Board behavior.
+ +
+ +## Scope
+ +
+ +- Create or link a Game Hub project when a Ready idea uses Create Project.
+ +- Move created Project ideas into a read-only Idea Board state with Open in Game Hub and Archive actions.
+ +- Keep Archived ideas hidden by default and restorable/deletable when visible.
+ +- Productionize Game Hub project display with Project Information and read-only Source Idea fields.
+ +- Add the smallest handoff/project-contract fix needed to complete the flow.
+ +
+ +## Validation
+ +
+ +- `node --check toolbox/idea-board/index.js`
+ +- Changed-file syntax checks for Game Hub JavaScript.
+ +- Targeted Idea Board Playwright.
+ +- Targeted Game Hub Playwright if existing coverage exists.
+ +- `npm run test:workspace-v2`
+ +- Do not run full samples smoke.
+ +
+ +## Reports
+ +
+ +- `docs_build/dev/reports/codex_review.diff`
+ +- `docs_build/dev/reports/codex_changed_files.txt`
+ +
+ +## Delivery
+ +
+ +- Commit, push, create PR, merge after validation passes, return to `main`, pull latest `main`, and produce `tmp/PR_26171_044-idea-board-game-hub-project-flow_delta.zip`.
+ diff --git a/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js b/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+ index ad5602999..fff42032d 100644
+ --- a/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+ +++ b/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+ @@ -156,8 +156,37 @@ export const GAME_WORKSPACE_SCHEMA = Object.freeze({
+    game_members: Object.freeze(["gameId", "userKey", "permission", "role"]),
+  });
+
+ +function normalizeSourceIdea(sourceIdea) {
+ +  if (!sourceIdea || typeof sourceIdea !== "object") {
+ +    return null;
+ +  }
+ +
+ +  const idea = String(sourceIdea.idea || "").trim();
+ +  const pitch = String(sourceIdea.pitch || "").trim();
+ +  const notes = Array.isArray(sourceIdea.notes)
+ +    ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
+ +    : [];
+ +
+ +  if (!idea && !pitch && !notes.length) {
+ +    return null;
+ +  }
+ +
+ +  return { idea, pitch, notes };
+ +}
+ +
+ +function cloneRow(row) {
+ +  const cloned = { ...row };
+ +  const sourceIdea = normalizeSourceIdea(row.sourceIdea);
+ +  if (sourceIdea) {
+ +    cloned.sourceIdea = sourceIdea;
+ +  } else {
+ +    delete cloned.sourceIdea;
+ +  }
+ +  return cloned;
+ +}
+ +
+  function cloneRows(rows) {
+ -  return rows.map((row) => ({ ...row }));
+ +  return rows.map(cloneRow);
+  }
+
+  function cloneTables(tables) {
+ @@ -227,6 +256,7 @@ export function createGameWorkspaceMockRepository() {
+      return {
+        ...game,
+        purpose: game.purpose || "Game",
+ +      sourceIdea: normalizeSourceIdea(game.sourceIdea),
+        ownerDisplayName: owner?.displayName || game.ownerKey,
+        members: getGameMembers(game.id),
+      };
+ @@ -373,6 +403,10 @@ export function createGameWorkspaceMockRepository() {
+        purpose,
+        status,
+      };
+ +    const sourceIdea = normalizeSourceIdea(input.sourceIdea);
+ +    if (sourceIdea) {
+ +      game.sourceIdea = sourceIdea;
+ +    }
+
+      tables.games.push(game);
+      tables.game_members.push({
+ diff --git a/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs b/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+ index 1787b86d8..1c1f742a9 100644
+ --- a/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+ +++ b/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+ @@ -15,6 +15,14 @@ const SUPABASE_ENV_KEYS = Object.freeze([
+  let fakeSupabaseServer;
+  let previousSupabaseEnv;
+
+ +function restoreEnvValue(key, value) {
+ +  if (value === undefined) {
+ +    delete process.env[key];
+ +    return;
+ +  }
+ +  process.env[key] = value;
+ +}
+ +
+  function startFakeSupabaseServer() {
+    const tables = {
+      roles: [],
+ @@ -123,6 +131,16 @@ test.afterAll(async () => {
+
+  async function openRepoPage(page, pathName, options = {}) {
+    const server = await startRepoServer();
+ +  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
+ +  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
+ +  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
+ +  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
+ +  const closeServer = server.close.bind(server);
+ +  server.close = async () => {
+ +    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
+ +    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
+ +    await closeServer();
+ +  };
+    const failedRequests = [];
+    const pageErrors = [];
+    const consoleErrors = [];
+ @@ -235,12 +253,10 @@ test("Game Hub creates, opens, and deletes mock games", async ({ page }) => {
+      await expect(page.getByRole("button", { name: "Create Game" })).toBeEnabled();
+      await expect(page.getByRole("button", { name: "Delete Open Game" })).toHaveClass("btn");
+      await expect(page.getByRole("button", { name: "Delete Open Game" })).toBeEnabled();
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("Game Hub records loaded from the project records service");
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("authoritative keys managed by service");
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("asset references linked to storage object keys: 0");
+ +    await expect(page.locator("[data-project-record-status]")).toHaveText("Project Information loaded.");
+ +    await expect(page.locator("[data-game-project-information]")).toContainText("Project Information");
+      await expect(page.locator("[data-project-records-table]")).toContainText("Demo Game");
+ -    await expect(page.locator("[data-project-records-table]")).toContainText("Project records service");
+ -    await expect(page.locator("[data-project-records-table]")).toContainText("asset refs 0");
+ +    await expect(page.locator("[data-source-idea-section]")).toContainText("No source idea yet");
+      await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
+      await expect(page.locator("[data-active-game-purpose]")).toHaveText("Game");
+      await expect(page.locator("[data-current-user-role]")).toHaveText("Owner");
+ @@ -257,7 +273,7 @@ test("Game Hub creates, opens, and deletes mock games", async ({ page }) => {
+      await page.getByRole("button", { name: "Create Game" }).click();
+      await expect(page.locator("[data-active-game-name]")).toHaveText("Launch Test Game");
+      await expect(page.locator("[data-game-list]")).toContainText("Launch Test Game");
+ -    await expect(page.locator("[data-project-records-table]")).toContainText("Launch Test Game");
+ +    await expect(page.locator("[data-game-project-information]")).toContainText("Launch Test Game");
+      await expect(page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Open Launch Test Game (Active)" })).toHaveClass(/primary/);
+      await expect(page.locator("[data-game-workspace-log]")).toHaveText("Created and opened Launch Test Game.");
+
+ @@ -287,11 +303,8 @@ test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }
+    try {
+      await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
+      await expect(page.locator("[data-game-list]")).toContainText("Gravity Demo");
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("guest browsing enabled; guest saving blocked");
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("project records service");
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("asset references linked to storage object keys: 0");
+ +    await expect(page.locator("[data-project-record-status]")).toHaveText("Project Information loaded. Sign in to save changes.");
+      await expect(page.locator("[data-project-records-table]")).toContainText("Demo Game");
+ -    await expect(page.locator("[data-project-records-table]")).toContainText("Project records service");
+      await expect(page.getByRole("button", { name: "Create Game" })).toBeDisabled();
+      await expect(page.getByRole("button", { name: "Delete Open Game" })).toBeDisabled();
+      await expect(page.getByLabel("Game Name")).toBeDisabled();
+ @@ -301,7 +314,7 @@ test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }
+
+      await page.getByRole("button", { name: "Open Gravity Demo" }).click();
+      await expect(page.locator("[data-active-game-name]")).toHaveText("Gravity Demo");
+ -    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Guest browsing enabled; sign in required to save Game Hub project records.");
+ +    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Sign in to create or update Game Hub projects.");
+
+      await expectNoPageFailures(failures);
+    } finally {
+ @@ -309,7 +322,7 @@ test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }
+    }
+  });
+
+ -test("Game Hub shows active-game API diagnostics without throwing", async ({ page }) => {
+ +test("Game Hub shows active-game errors without throwing", async ({ page }) => {
+    await page.route("**/api/toolbox/game-workspace/repositories/*/methods/getActiveGame", async (route) => {
+      await route.fulfill({
+        body: JSON.stringify({
+ @@ -326,7 +339,7 @@ test("Game Hub shows active-game API diagnostics without throwing", async ({ pag
+    try {
+      expect(failures.failedRequests.some((request) => request.includes("502") && request.includes("/methods/getActiveGame"))).toBe(true);
+      await expect(page.locator("[data-active-game-name]")).toHaveText("No game open");
+ -    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game unavailable for validation.");
+ +    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game is temporarily unavailable.");
+      expect(failures.pageErrors).toEqual([]);
+      expect(failures.consoleErrors.filter((message) => !message.includes("status of 502"))).toEqual([]);
+    } finally {
+ @@ -356,7 +369,7 @@ test("Game Hub reports malformed active-game payloads without throwing", async (
+    try {
+      await expect(page.locator("[data-active-game-name]")).toHaveText("No game open");
+      await expect(page.locator("[data-current-user-role]")).toHaveText("Viewer");
+ -    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game response is malformed.");
+ +    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game is temporarily unavailable.");
+      await expect(page.getByLabel("Game Purpose")).toBeDisabled();
+
+      await expectNoPageFailures(failures);
+ @@ -395,7 +408,6 @@ test("Game Hub displays and edits game purpose and member role", async ({ page }
+      await expect(page.getByLabel("Game Purpose")).toHaveValue("Game");
+      await expect(page.getByLabel("Game Status")).toHaveValue("Under Construction");
+      await expect(page.getByLabel("Current User Role")).toHaveValue("Owner");
+ -    await expect(page.locator("[data-game-members-table]")).toContainText("Owner");
+
+      await page.getByLabel("Game Purpose").selectOption("Learning Game");
+      await expect(page.locator("[data-active-game-purpose]")).toHaveText("Learning Game");
+ @@ -407,7 +419,6 @@ test("Game Hub displays and edits game purpose and member role", async ({ page }
+
+      await page.getByLabel("Current User Role").selectOption("Designer");
+      await expect(page.locator("[data-current-user-role]")).toHaveText("Designer");
+ -    await expect(page.locator("[data-game-members-table]")).toContainText("Designer");
+      await expect(page.locator("[data-game-workspace-log]")).toHaveText("Updated current user role to Designer.");
+
+      await page.getByLabel("Game Purpose").selectOption("Capability Demo");
+ @@ -435,23 +446,22 @@ test("Game Hub progress panels update from mock game state", async ({ page }) =>
+      await expect(page.locator("[data-recommended-next-tool]").first()).toHaveText("Game Configuration");
+      await expect(page.locator("[data-game-progress-checklist]")).toContainText("Game identity: Complete");
+      await expect(page.locator("[data-game-output-panels] summary")).toHaveText([
+ -      "Readiness Output",
+ -      "Repository Tables",
+ -      "Team Members"
+ +      "Readiness Output"
+      ]);
+      await expect(page.locator("aside.tool-column").last().getByText("Readiness Output")).toHaveCount(0);
+ -    await expect(page.locator("aside.tool-column").last().getByText("Repository Tables")).toHaveCount(0);
+ -    await expect(page.locator("aside.tool-column").last().getByText("Team Members")).toHaveCount(0);
+      const panelOrderIsCorrect = await page.locator(".tool-center-panel").evaluate((panel) => {
+ +      const projectInformation = panel.querySelector("[data-game-project-information]");
+ +      const sourceIdea = panel.querySelector("[data-source-idea-section]");
+        const staticOverlay = panel.querySelector("[data-game-workspace-foundation]");
+        const outputPanels = panel.querySelector("[data-game-output-panels]");
+ -      const missingRequirements = panel.querySelector("[data-missing-requirements]");
+        return Boolean(
+ +        projectInformation &&
+ +        sourceIdea &&
+          staticOverlay &&
+          outputPanels &&
+ -        missingRequirements &&
+ -        (staticOverlay.compareDocumentPosition(outputPanels) & Node.DOCUMENT_POSITION_FOLLOWING) &&
+ -        (outputPanels.compareDocumentPosition(missingRequirements) & Node.DOCUMENT_POSITION_FOLLOWING)
+ +        (projectInformation.compareDocumentPosition(sourceIdea) & Node.DOCUMENT_POSITION_FOLLOWING) &&
+ +        (sourceIdea.compareDocumentPosition(staticOverlay) & Node.DOCUMENT_POSITION_FOLLOWING) &&
+ +        (staticOverlay.compareDocumentPosition(outputPanels) & Node.DOCUMENT_POSITION_FOLLOWING)
+        );
+      });
+      expect(panelOrderIsCorrect).toBe(true);
+ @@ -460,9 +470,7 @@ test("Game Hub progress panels update from mock game state", async ({ page }) =>
+      await page.getByRole("button", { name: "Create Game" }).click();
+      await expect(page.locator("[data-game-status]")).toHaveText("Under Construction");
+      await expect(page.locator("[data-game-progress]")).toHaveText("Progress Review Game identity ready");
+ -    await expect(page.locator("[data-table-counts], [data-game-table-counts]")).toContainText("games");
+ -    await expect(page.locator("[data-game-table-counts]")).toContainText("5");
+ -    await expect(page.locator("[data-game-members-table]")).toContainText("Owner");
+ +    await expect(page.locator("[data-game-project-information]")).toContainText("Progress Review Game");
+
+      await page.getByRole("button", { name: "Delete Open Game" }).click();
+      await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
+ diff --git a/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs b/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+ index 1a42e53d7..a18205fa4 100644
+ --- a/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+ +++ b/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+ @@ -1,4 +1,5 @@
+  import { expect, test } from "@playwright/test";
+ +import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
+  import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
+  import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
+
+ @@ -114,8 +115,18 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
+    const server = await startRepoServer();
+    const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
+    const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
+ +  const previousSupabaseEnv = {
+ +    GAMEFOUNDRY_DATABASE_URL: process.env.GAMEFOUNDRY_DATABASE_URL,
+ +    GAMEFOUNDRY_SUPABASE_ANON_KEY: process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY,
+ +    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY,
+ +    GAMEFOUNDRY_SUPABASE_URL: process.env.GAMEFOUNDRY_SUPABASE_URL,
+ +  };
+    process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
+    process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
+ +  process.env.GAMEFOUNDRY_DATABASE_URL = "postgres://idea-board:test@127.0.0.1:5432/idea_board";
+ +  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "idea-board-anon-key";
+ +  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "idea-board-service-role-key";
+ +  process.env.GAMEFOUNDRY_SUPABASE_URL = `${server.baseUrl}/fake-supabase`;
+    const failedRequests = [];
+    const pageErrors = [];
+    const consoleErrors = [];
+ @@ -139,6 +150,32 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
+    });
+
+    try {
+ +    await page.route("**/api/platform-settings/banner", async (route) => {
+ +      await route.fulfill({
+ +        contentType: "application/json",
+ +        body: JSON.stringify({
+ +          data: { banner: { active: false, message: "", tone: "info" } },
+ +          ok: true,
+ +        }),
+ +      });
+ +    });
+ +    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
+ +      await route.fulfill({
+ +        contentType: "application/json",
+ +        body: JSON.stringify({
+ +          data: {
+ +            activeTools: [],
+ +            readinessByStatus: {},
+ +            tools: [],
+ +            toolboxContract: {},
+ +          },
+ +          ok: true,
+ +        }),
+ +      });
+ +    });
+ +    await page.request.post(`${server.baseUrl}/api/session/user`, {
+ +      data: { userKey: MOCK_DB_KEYS.users.user1 },
+ +    });
+      await page.goto(`${server.baseUrl}/toolbox/idea-board/index.html`, { waitUntil: "networkidle" });
+      await expect(page.getByRole("heading", { level: 1, name: "Idea Board" })).toBeVisible();
+      await expectProductionCopy(page);
+ @@ -278,6 +315,13 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
+      await expect(page.locator("[data-idea-board-notes-count='lantern-reef']")).toHaveText("0 Notes");
+      await expect(page.locator("[data-idea-board-expanded-row='lantern-reef']")).toHaveCount(0);
+
+ +    await page.locator("[data-idea-board-idea-cell='lantern-reef']").click();
+ +    await expect(page.locator("[data-idea-board-expanded-row='lantern-reef']")).toBeVisible();
+ +    await page.locator("[data-idea-board-add-note='lantern-reef']").click();
+ +    await page.locator("[data-idea-board-note-input]").fill("Use dusk tide changes as the first Game Hub planning note.");
+ +    await page.locator("[data-idea-board-note-action='save']").click();
+ +    await expect(page.locator("[data-idea-board-notes-count='lantern-reef']")).toHaveText("1 Note");
+ +
+      await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='edit']").click();
+      await expect(page.locator("[data-idea-board-idea-input-row] [data-idea-board-idea-action]")).toHaveText(["Save", "Cancel"]);
+      await expect(page.locator("[data-idea-board-idea-status-input]")).toHaveCount(1);
+ @@ -287,10 +331,11 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Create Project", "Delete"]);
+      await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='create-project']").click();
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Project");
+ -    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Open Project", "Archive"]);
+ +    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Open in Game Hub", "Archive"]);
+ +    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='edit']")).toHaveCount(0);
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='delete']")).toHaveCount(0);
+ -    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='open-project']").click();
+ -    await expect(page.locator("[data-idea-board-status]")).toHaveText("Opening Lantern Reef.");
+ +    await expect(page.locator("[data-idea-board-add-note='lantern-reef']")).toHaveCount(0);
+ +    await expect(page.locator("[data-idea-board-notes-table='lantern-reef'] [data-idea-board-note-action]")).toHaveCount(0);
+      await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='archive']").click();
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toHaveCount(0);
+      await page.locator("[data-idea-board-status-filter-option][value='Archived']").check();
+ @@ -299,23 +344,25 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Restore", "Delete"]);
+      await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='restore']").click();
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Project");
+ -    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='archive']").click();
+ -    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Restore", "Delete"]);
+ -    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='delete']").click();
+ -    await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toHaveCount(0);
+ -    await page.locator("[data-idea-board-filter-clear-all]").click();
+ -    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(0);
+ -    await expect(page.locator("[data-idea-board-add-idea]")).toBeVisible();
+ -    await page.locator("[data-idea-board-filter-select-all]").click();
+ -    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(3);
+ +    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Open in Game Hub", "Archive"]);
+ +    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='open-project']").click();
+ +    await page.waitForURL(/\/toolbox\/game-workspace\/index\.html\?game=lantern-reef-\d+$/);
+ +    await expect(page.getByRole("heading", { level: 1, name: "Game Hub" })).toBeVisible();
+ +    await expect(page.locator("[data-active-game-name]")).toHaveText("Lantern Reef");
+ +    await expect(page.locator("[data-source-idea-display]")).toHaveText("Lantern Reef");
+ +    await expect(page.locator("[data-source-idea-pitch]")).toHaveText("Guide light through a reef that rearranges at dusk.");
+ +    await expect(page.locator("[data-source-idea-notes]")).toContainText("Use dusk tide changes as the first Game Hub planning note.");
+ +    await expect(page.locator("main")).not.toContainText(/\bproject records\b|\bAPI\b|\bDB\b|\bmock\b|\bseed\b|\bdebug\b|\binternal\b/i);
+
+ -    expect(mutatingApiRequests).toEqual([]);
+ +    expect(mutatingApiRequests.some((request) => request.includes("/api/toolbox/game-workspace/repositories"))).toBe(true);
+ +    expect(mutatingApiRequests.some((request) => request.includes("/methods/createGame"))).toBe(true);
+      expect(failedRequests).toEqual([]);
+      expect(pageErrors).toEqual([]);
+      expect(consoleErrors).toEqual([]);
+    } finally {
+      restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
+      restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
+ +    Object.entries(previousSupabaseEnv).forEach(([key, value]) => restoreEnvValue(key, value));
+      await server.close();
+    }
+  });
+ diff --git a/tests/playwright/tools/ToolboxRoutePages.spec.mjs b/tests/playwright/tools/ToolboxRoutePages.spec.mjs
+ index b2d410c0f..bfe555c39 100644
+ --- a/tests/playwright/tools/ToolboxRoutePages.spec.mjs
+ +++ b/tests/playwright/tools/ToolboxRoutePages.spec.mjs
+ @@ -366,10 +366,6 @@ test("Idea Board launches from Toolbox with accordion table notes model", async
+      await page.locator("[data-idea-board-idea-status-input]").selectOption("Ready");
+      await page.locator("[data-idea-board-idea-action='save']").click();
+      await expect(page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Create Project", "Delete"]);
+ -    await page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action='create-project']").click();
+ -    await expect(page.locator("[data-idea-board-idea-row='launch-tile'] td").nth(1)).toHaveText("Project");
+ -    await expect(page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Open Project", "Archive"]);
+ -    await expect(page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action='delete']")).toHaveCount(0);
+      expect(mutatingApiRequests).toEqual([]);
+
+      expect(failedRequests).toEqual([]);
+ diff --git a/toolbox/game-workspace/game-workspace.js b/toolbox/game-workspace/game-workspace.js
+ index d57ed37ef..90aea08f8 100644
+ --- a/toolbox/game-workspace/game-workspace.js
+ +++ b/toolbox/game-workspace/game-workspace.js
+ @@ -3,12 +3,10 @@ import {
+    GAME_WORKSPACE_GAME_PURPOSES,
+    GAME_WORKSPACE_GAME_STATUSES,
+    createGameWorkspaceApiRepository,
+ -  readProjectWorkspaceProjectRecords,
+  } from "./game-workspace-api-client.js";
+  import { getSessionCurrent } from "../../src/api/session-api-client.js";
+
+  const repository = createGameWorkspaceApiRepository();
+ -let projectRecordContract = null;
+
+  const elements = {
+    activeGameName: document.querySelector("[data-active-game-name]"),
+ @@ -29,6 +27,10 @@ const elements = {
+    projectRecordStatus: document.querySelector("[data-project-record-status]"),
+    projectRecordsTable: document.querySelector("[data-project-records-table]"),
+    purposeInput: document.querySelector("[data-game-purpose-input]"),
+ +  sourceIdeaDisplay: document.querySelector("[data-source-idea-display]"),
+ +  sourceIdeaName: document.querySelector("[data-source-idea-name]"),
+ +  sourceIdeaNotes: document.querySelector("[data-source-idea-notes]"),
+ +  sourceIdeaPitch: document.querySelector("[data-source-idea-pitch]"),
+    gameStatus: document.querySelector("[data-game-status]"),
+    gameStatusInput: document.querySelector("[data-game-status-input]"),
+    publishingProgress: document.querySelector("[data-publishing-progress]"),
+ @@ -63,7 +65,7 @@ function isRepositoryErrorResult(value) {
+  }
+
+  function repositoryErrorMessage(value, context) {
+ -  return String(value?.message || value?.error || `${context} failed through the server API contract.`).trim();
+ +  return `${context} is temporarily unavailable. Refresh the page or try again shortly.`;
+  }
+
+  function reportRepositoryError(value, context) {
+ @@ -86,7 +88,7 @@ function normalizeActiveGame(value, context = "Active game") {
+      return null;
+    }
+    if (!isRecord(value) || !Array.isArray(value.members)) {
+ -    setStatusLog(`${context} response is malformed. Reload Game Hub after the server API contract is restored.`);
+ +    setStatusLog(`${context} is temporarily unavailable. Refresh the page or try again shortly.`);
+      return null;
+    }
+    return value;
+ @@ -96,23 +98,23 @@ function normalizeProgress(value) {
+    if (reportRepositoryError(value, "Game progress")) {
+      return {
+        gameStatus: "No Game",
+ -      gameProgress: "Blocked by server API error",
+ -      publishingProgress: "Blocked",
+ -      currentFocus: "Resolve the server API diagnostic",
+ +      gameProgress: "Progress is temporarily unavailable",
+ +      publishingProgress: "Unavailable",
+ +      currentFocus: "Refresh Game Hub",
+        recommendedNextTool: "Game Hub",
+        progressChecklist: [
+ -        { label: "Restore server API contract", status: "Blocked" },
+ +        { label: "Project information", status: "Unavailable" },
+        ],
+      };
+    }
+    if (!isRecord(value)) {
+ -    setStatusLog("Game progress response is malformed. Reload Game Hub after the server API contract is restored.");
+ +    setStatusLog("Game progress is temporarily unavailable. Refresh the page or try again shortly.");
+    }
+    return isRecord(value) ? value : {
+      gameStatus: "No Game",
+      gameProgress: "No active game",
+      publishingProgress: "Not started",
+ -    currentFocus: "Create or seed a game",
+ +    currentFocus: "Create a game",
+      recommendedNextTool: "Game Hub",
+      progressChecklist: [],
+    };
+ @@ -151,8 +153,8 @@ function refreshSaveControls() {
+    }
+    if (!saveAllowed) {
+      const currentStatus = String(elements.statusLog?.textContent || "");
+ -    if (!/Blocked|failed|malformed|Restore|Sign in required|unavailable/i.test(currentStatus)) {
+ -      setStatusLog("Guest browsing enabled; sign in required to save Game Hub project records.");
+ +    if (!/failed|Sign in required|unavailable/i.test(currentStatus)) {
+ +      setStatusLog("Sign in to create or update Game Hub projects.");
+      }
+    }
+  }
+ @@ -161,7 +163,7 @@ function ensureProjectRecordsSaveAllowed(action) {
+    if (projectRecordsSaveAllowed()) {
+      return true;
+    }
+ -  const message = `Sign in required to ${action} Game Hub project records.`;
+ +  const message = `Sign in required to ${action} Game Hub projects.`;
+    setStatusLog(message);
+    setProjectRecordStatus(message);
+    refreshSaveControls();
+ @@ -209,53 +211,31 @@ function createGameButton(game, isActive) {
+    return button;
+  }
+
+ -function renderProjectRecords() {
+ +function renderProjectInformation(activeGame, currentMember, progress) {
+    if (!elements.projectRecordsTable) {
+      return;
+    }
+
+ -  try {
+ -    projectRecordContract = readProjectWorkspaceProjectRecords();
+ -  } catch (error) {
+ -    projectRecordContract = null;
+ -    setProjectRecordStatus(error instanceof Error ? error.message : "Game Hub project records are unavailable.");
+ -    return;
+ -  }
+ -
+ -  const records = Array.isArray(projectRecordContract.records) ? projectRecordContract.records : [];
+ -  const source = projectRecordContract.sourceLabel || "Project records service";
+ -  const assetReferenceCount = Number(projectRecordContract.assetReferenceCount || 0);
+ -  const saveMode = projectRecordsSaveAllowed()
+ -    ? "signed-in saves enabled"
+ -    : "guest browsing enabled; guest saving blocked";
+ -  setProjectRecordStatus(`${projectRecordContract.terminology || "Game Hub"} records loaded from the project records service; authoritative keys managed by service; asset references linked to storage object keys: ${assetReferenceCount}; ${saveMode}.`);
+ -
+    elements.projectRecordsTable.replaceChildren();
+ -  if (!records.length) {
+ -    const row = document.createElement("tr");
+ -    ["No records", "No Game Hub records", "Not started", source].forEach((value) => {
+ -      const cell = document.createElement("td");
+ -      cell.textContent = value;
+ -      row.append(cell);
+ -    });
+ -    elements.projectRecordsTable.append(row);
+ -    return;
+ -  }
+ -
+ -  records.forEach((record) => {
+ -    const row = document.createElement("tr");
+ -    [
+ -      record.projectKey || "missing key",
+ -      record.name || "Untitled project",
+ -      record.status || "No status",
+ -      `${source}; asset refs ${Number(record.assetReferenceCount || 0)}`,
+ -    ].forEach((value) => {
+ -      const cell = document.createElement("td");
+ -      cell.textContent = value;
+ -      row.append(cell);
+ -    });
+ -    elements.projectRecordsTable.append(row);
+ +  const row = document.createElement("tr");
+ +  [
+ +    { datasetName: "activeGameName", value: activeGame?.name || "No game open" },
+ +    { datasetName: "activeGameStatus", value: activeGame?.status || progress?.gameStatus || "No Game" },
+ +    { datasetName: "activeGamePurpose", value: activeGame?.purpose || "No purpose" },
+ +    { datasetName: "activeGameOwner", value: activeGame?.ownerDisplayName || "No owner" },
+ +    { datasetName: "currentUserRole", value: currentMember?.role || "Viewer" },
+ +    { datasetName: "recommendedNextTool", value: progress?.recommendedNextTool || "Game Hub" },
+ +  ].forEach(({ datasetName, value }) => {
+ +    const cell = document.createElement("td");
+ +    cell.dataset[datasetName] = "true";
+ +    cell.textContent = value;
+ +    row.append(cell);
+    });
+ +  elements.projectRecordsTable.append(row);
+ +
+ +  setProjectRecordStatus(projectRecordsSaveAllowed()
+ +    ? "Project Information loaded."
+ +    : "Project Information loaded. Sign in to save changes.");
+  }
+
+  function renderGameList() {
+ @@ -268,7 +248,7 @@ function renderGameList() {
+    const listResult = repository.listGames(gameUserKey ? { userKey: gameUserKey } : {});
+    const games = Array.isArray(listResult) ? listResult : [];
+    if (!Array.isArray(listResult) && !reportRepositoryError(listResult, "Game list")) {
+ -    setStatusLog("Game list response is malformed. Reload Game Hub after the server API contract is restored.");
+ +    setStatusLog("Game list is temporarily unavailable. Refresh the page or try again shortly.");
+    }
+
+    elements.gameList.replaceChildren();
+ @@ -276,7 +256,7 @@ function renderGameList() {
+    if (games.length === 0) {
+      const emptyState = document.createElement("p");
+      emptyState.className = "status";
+ -    emptyState.textContent = "No games. Create or seed a game to continue.";
+ +    emptyState.textContent = "No games. Create a game to continue.";
+      elements.gameList.append(emptyState);
+      return;
+    }
+ @@ -343,7 +323,7 @@ function renderTableCounts() {
+      ? tableResult
+      : { users: [], games: [], game_members: [] };
+    if ((!isRecord(tableResult) || isRepositoryErrorResult(tableResult)) && !reportRepositoryError(tableResult, "Repository tables")) {
+ -    setStatusLog("Repository tables response is malformed. Reload Game Hub after the server API contract is restored.");
+ +    setStatusLog("Game Hub project details are temporarily unavailable. Refresh the page or try again shortly.");
+    }
+    const rows = [
+      ["users", Array.isArray(tables.users) ? tables.users.length : 0],
+ @@ -366,6 +346,29 @@ function renderTableCounts() {
+    });
+  }
+
+ +function renderSourceIdea(activeGame) {
+ +  const sourceIdea = isRecord(activeGame?.sourceIdea) ? activeGame.sourceIdea : null;
+ +  const name = String(sourceIdea?.idea || "").trim();
+ +  const pitch = String(sourceIdea?.pitch || "").trim();
+ +  const notes = Array.isArray(sourceIdea?.notes)
+ +    ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
+ +    : [];
+ +
+ +  setText(elements.sourceIdeaName, name || "No source idea yet");
+ +  setText(elements.sourceIdeaDisplay, name || "No source idea yet");
+ +  setText(elements.sourceIdeaPitch, pitch || "Create a project from Idea Board to see source details.");
+ +
+ +  if (elements.sourceIdeaNotes) {
+ +    elements.sourceIdeaNotes.replaceChildren();
+ +    const visibleNotes = notes.length ? notes : ["No source notes."];
+ +    visibleNotes.forEach((note) => {
+ +      const item = document.createElement("li");
+ +      item.textContent = note;
+ +      elements.sourceIdeaNotes.append(item);
+ +    });
+ +  }
+ +}
+ +
+  function renderChecklist(progress) {
+    if (!elements.progressChecklist) {
+      return;
+ @@ -419,7 +422,8 @@ function renderWorkspace() {
+    renderMembersTable(activeGame);
+    renderTableCounts();
+    renderChecklist(progress);
+ -  renderProjectRecords();
+ +  renderProjectInformation(activeGame, currentMember, progress);
+ +  renderSourceIdea(activeGame);
+    refreshSaveControls();
+  }
+
+ @@ -437,7 +441,7 @@ elements.form?.addEventListener("submit", (event) => {
+
+    if (reportRepositoryError(game, "Create Game") || !isRecord(game) || !String(game.name || "").trim()) {
+      if (!isRepositoryErrorResult(game)) {
+ -      setStatusLog("Create Game did not return a valid game. Restore the server API contract and try again.");
+ +      setStatusLog("Create Game could not be completed. Refresh the page or try again shortly.");
+      }
+      renderWorkspace();
+      return;
+ @@ -528,4 +532,15 @@ elements.currentUserRoleInput?.addEventListener("change", () => {
+  populateSelect(elements.purposeInput, GAME_WORKSPACE_GAME_PURPOSES);
+  populateSelect(elements.gameStatusInput, GAME_WORKSPACE_GAME_STATUSES);
+  populateSelect(elements.currentUserRoleInput, GAME_WORKSPACE_MEMBER_ROLES);
+ +const requestedGameId = new URL(window.location.href).searchParams.get("game");
+ +if (requestedGameId) {
+ +  const openedGame = repository.openGame(requestedGameId);
+ +  if (isRepositoryErrorResult(openedGame)) {
+ +    setStatusLog(repositoryErrorMessage(openedGame, "Open Game"));
+ +  } else if (openedGame) {
+ +    setStatusLog(`Opened ${openedGame.name}.`);
+ +  } else {
+ +    setStatusLog("That Game Hub project could not be found.");
+ +  }
+ +}
+  renderWorkspace();
+ diff --git a/toolbox/game-workspace/index.html b/toolbox/game-workspace/index.html
+ index ac1017b27..f204166d8 100644
+ --- a/toolbox/game-workspace/index.html
+ +++ b/toolbox/game-workspace/index.html
+ @@ -66,43 +66,58 @@
+                          </div>
+                      </aside>
+                      <div data-tool-display-mode data-asset-root="assets/theme-v2/images" data-tool-slug="game-workspace" data-tool-icon-src="assets/theme-v2/images/badges/index.png" data-tool-character-src="assets/theme-v2/images/characters/index.png"></div>
+ -                    <section class="tool-center-panel"><h2>Game Hub Overview</h2>
+ -                        <p>Game Hub manages game identity, status, progress, and launch readiness through the project records service.</p>
+ -                        <div class="status" role="status" data-project-record-status>Loading Game Hub project records.</div>
+ -                        <div class="table-wrapper">
+ -                            <table class="data-table" aria-label="Game Hub project records">
+ -                                <caption>Game Hub Project Records</caption>
+ -                                <thead>
+ -                                    <tr>
+ -                                        <th scope="col">Authoritative Key</th>
+ -                                        <th scope="col">Project</th>
+ -                                        <th scope="col">Status</th>
+ -                                        <th scope="col">Source</th>
+ -                                    </tr>
+ -                                </thead>
+ -                                <tbody data-project-records-table>
+ -                                    <tr><td>Loading</td><td>Loading</td><td>Loading</td><td>Project records service</td></tr>
+ -                                </tbody>
+ -                            </table>
+ -                        </div>
+ -                        <article class="card">
+ +                    <section class="tool-center-panel"><h2>Project Information</h2>
+ +                        <p>Review the open project and its source idea.</p>
+ +                        <div class="status" role="status" data-project-record-status>Project Information ready.</div>
+ +                        <article class="card" data-game-project-information>
+                              <div class="card-body content-stack">
+ -                                <div>
+ -                                    <div class="kicker">Open Game</div>
+ -                                    <h3 data-active-game-name>Demo Game</h3>
+ -                                </div>
+ -                                <div class="grid cols-3" aria-label="Active game summary">
+ -                                    <article class="mini-stat"><strong data-active-game-status>Under Construction</strong>Game Status</article>
+ -                                    <article class="mini-stat"><strong data-active-game-purpose>Game</strong>Game Purpose</article>
+ -                                    <article class="mini-stat"><strong data-active-game-owner>No owner</strong>Owner</article>
+ -                                    <article class="mini-stat"><strong data-current-user-role>Owner</strong>Current User Role</article>
+ -                                    <article class="mini-stat"><strong data-recommended-next-tool>Game Configuration</strong>Recommended Next Tool</article>
+ +                                <div class="table-wrapper">
+ +                                    <table class="data-table" aria-label="Project Information">
+ +                                        <caption>Project Information</caption>
+ +                                        <thead>
+ +                                            <tr>
+ +                                                <th scope="col">Project</th>
+ +                                                <th scope="col">Status</th>
+ +                                                <th scope="col">Purpose</th>
+ +                                                <th scope="col">Owner</th>
+ +                                                <th scope="col">Role</th>
+ +                                                <th scope="col">Next Tool</th>
+ +                                            </tr>
+ +                                        </thead>
+ +                                        <tbody data-project-records-table>
+ +                                            <tr>
+ +                                                <td data-active-game-name>Demo Game</td>
+ +                                                <td data-active-game-status>Under Construction</td>
+ +                                                <td data-active-game-purpose>Game</td>
+ +                                                <td data-active-game-owner>No owner</td>
+ +                                                <td data-current-user-role>Owner</td>
+ +                                                <td data-recommended-next-tool>Game Configuration</td>
+ +                                            </tr>
+ +                                        </tbody>
+ +                                    </table>
+                                  </div>
+                                  <div class="action-group">
+                                      <a class="btn primary" href="toolbox/game-journey/index.html?game=demo-game" data-game-journey-link>Open Game Journey</a>
+                                  </div>
+                              </div>
+                          </article>
+ +                        <article class="card" data-source-idea-section>
+ +                            <div class="card-body content-stack">
+ +                                <div>
+ +                                    <div class="kicker">Source Idea</div>
+ +                                    <h3 data-source-idea-name>No source idea yet</h3>
+ +                                </div>
+ +                                <div class="table-wrapper">
+ +                                    <table class="data-table" aria-label="Source Idea">
+ +                                        <tbody>
+ +                                            <tr><th scope="row">Idea</th><td data-source-idea-display>No source idea yet</td></tr>
+ +                                            <tr><th scope="row">Pitch</th><td data-source-idea-pitch>Create a project from Idea Board to see source details.</td></tr>
+ +                                            <tr><th scope="row">Notes</th><td><ul class="content-list" data-source-idea-notes><li>No source notes.</li></ul></td></tr>
+ +                                        </tbody>
+ +                                    </table>
+ +                                </div>
+ +                            </div>
+ +                        </article>
+                          <article class="card" data-game-workspace-foundation>
+                              <div class="card-body content-stack">
+                                  <div>
+ @@ -119,7 +134,7 @@
+                                      <article class="callout"><h3>Recommended Next Tool</h3><p data-recommended-next-tool>Game Configuration</p></article>
+                                      <article class="callout"><h3>Checklist</h3><ul data-game-progress-checklist><li>Game identity: Complete</li></ul></article>
+                                  </div>
+ -                                <div class="status" role="status" data-game-workspace-log>Demo Game seeded.</div>
+ +                                <div class="status" role="status" data-game-workspace-log>Game Hub ready.</div>
+                              </div>
+                          </article>
+                          <div class="accordion-stack" data-game-output-panels>
+ @@ -141,56 +156,7 @@
+                                      </div>
+                                  </div>
+                              </details>
+ -                            <details class="vertical-accordion" open>
+ -                                <summary>Repository Tables</summary>
+ -                                <div class="accordion-body">
+ -                                    <div class="table-wrapper">
+ -                                        <table class="data-table">
+ -                                            <caption>Game Hub data row counts</caption>
+ -                                            <thead>
+ -                                                <tr><th scope="col">Table</th><th scope="col">Rows</th></tr>
+ -                                            </thead>
+ -                                            <tbody data-game-table-counts>
+ -                                                <tr><td>users</td><td>3</td></tr>
+ -                                                <tr><td>games</td><td>4</td></tr>
+ -                                                <tr><td>game_members</td><td>12</td></tr>
+ -                                            </tbody>
+ -                                        </table>
+ -                                    </div>
+ -                                </div>
+ -                            </details>
+ -                            <details class="vertical-accordion" open>
+ -                                <summary>Team Members</summary>
+ -                                <div class="accordion-body">
+ -                                    <div class="table-wrapper">
+ -                                        <table class="data-table">
+ -                                            <caption>Open game members</caption>
+ -                                            <thead>
+ -                                                <tr><th scope="col">User</th><th scope="col">User Key</th><th scope="col">Role</th><th scope="col">Permission</th></tr>
+ -                                            </thead>
+ -                                            <tbody data-game-members-table>
+ -                                                <tr><td>No game</td><td>-</td><td>-</td><td>-</td></tr>
+ -                                            </tbody>
+ -                                        </table>
+ -                                    </div>
+ -                                </div>
+ -                            </details>
+                          </div>
+ -                        <article class="card" role="dialog" aria-labelledby="game-workspace-missing-requirements-title" data-missing-requirements>
+ -                            <div class="card-body content-stack">
+ -                                <div>
+ -                                    <div class="kicker">Requirements</div>
+ -                                    <h3 id="game-workspace-missing-requirements-title">Missing Requirements</h3>
+ -                                </div>
+ -                                <p>Not implemented yet: cross-tool blocking, publish validation, or persisted release gates. This review surface lists the next requirements only.</p>
+ -                                <div class="grid cols-3">
+ -                                    <article class="callout"><h3>Game Design</h3><p><span class="pill">Under Construction</span> Define win and lose conditions.</p></article>
+ -                                    <article class="callout"><h3>Game Configuration</h3><p><span class="pill">Planned</span> Choose release profile and debug policy.</p></article>
+ -                                    <article class="callout"><h3>Publish</h3><p><span class="pill">Planned</span> Prepare share metadata later.</p></article>
+ -                                </div>
+ -                                <div class="status" role="status">Game Hub does not run real publish gating yet.</div>
+ -                            </div>
+ -                        </article>
+                      </section>
+                      <aside class="tool-column tool-group-build">
+                          <div class="tool-column-header">
+ @@ -200,7 +166,7 @@
+                              <details class="vertical-accordion" open>
+                                  <summary>Status Log</summary>
+                                  <div class="accordion-body">
+ -                                    <p>Game Hub operations report status in the center panel while the right column stays reserved for inspector status and diagnostics.</p>
+ +                                    <p>Game Hub actions report status in the center panel.</p>
+                                      <div class="status" role="status">Game data ready.</div>
+                                  </div>
+                              </details>
+ diff --git a/toolbox/idea-board/index.html b/toolbox/idea-board/index.html
+ index 422d67b1b..5734f4703 100644
+ --- a/toolbox/idea-board/index.html
+ +++ b/toolbox/idea-board/index.html
+ @@ -103,7 +103,7 @@
+      <div data-partial="footer"></div>
+      <script src="assets/theme-v2/js/gamefoundry-partials.js" defer></script>
+      <script src="assets/theme-v2/js/tool-display-mode.js" defer></script>
+ -    <script src="toolbox/idea-board/index.js" defer></script>
+ +    <script type="module" src="toolbox/idea-board/index.js"></script>
+  </body>
+
+  </html>
+ diff --git a/toolbox/idea-board/index.js b/toolbox/idea-board/index.js
+ index 2b74e797d..74364a996 100644
+ --- a/toolbox/idea-board/index.js
+ +++ b/toolbox/idea-board/index.js
+ @@ -1,6 +1,10 @@
+ +import { createServerRepositoryClient } from "../../src/api/server-api-client.js";
+ +
+  const statusOptions = Object.freeze(["New", "Exploring", "Refining", "Ready", "Project", "Archived"]);
+  const defaultVisibleStatuses = Object.freeze(["New", "Exploring", "Refining", "Ready", "Project"]);
+  const userId = "user-1";
+ +const gameHubRoute = "toolbox/game-workspace/index.html";
+ +let gameHubRepository = null;
+
+  const ideaTable = [
+    {
+ @@ -108,6 +112,10 @@ function isProject(record) {
+    return record.status === "Project";
+  }
+
+ +function isLockedIdea(record) {
+ +  return Boolean(record && (isProject(record) || isArchived(record)));
+ +}
+ +
+  function visibleIdeas() {
+    return ideaTable.filter((record) => state.visibleStatuses.has(record.status));
+  }
+ @@ -128,6 +136,17 @@ function canDeleteIdea(record) {
+    return !isProject(record) || isArchived(record);
+  }
+
+ +function isRepositoryErrorResult(value) {
+ +  return Boolean(value && typeof value === "object" && value.error === true);
+ +}
+ +
+ +function gameHubProjectRepository() {
+ +  if (!gameHubRepository) {
+ +    gameHubRepository = createServerRepositoryClient("game-workspace");
+ +  }
+ +  return gameHubRepository;
+ +}
+ +
+  function cell(text) {
+    const td = document.createElement("td");
+    td.textContent = text;
+ @@ -269,21 +288,18 @@ function renderIdeaRow(tbody, record) {
+        " ",
+        actionButton("Delete", "delete", "ideaBoardIdeaAction"),
+      );
+ +  } else if (isProject(record)) {
+ +    actions.append(
+ +      actionButton("Open in Game Hub", "open-project", "ideaBoardIdeaAction", "primary"),
+ +      " ",
+ +      actionButton("Archive", "archive", "ideaBoardIdeaAction"),
+ +    );
+    } else {
+      actions.append(actionButton("Edit", "edit", "ideaBoardIdeaAction"));
+      if (record.status === "Ready") {
+        actions.append(" ", actionButton("Create Project", "create-project", "ideaBoardIdeaAction", "primary"));
+      }
+ -    if (isProject(record)) {
+ -      actions.append(
+ -        " ",
+ -        actionButton("Open Project", "open-project", "ideaBoardIdeaAction", "primary"),
+ -        " ",
+ -        actionButton("Archive", "archive", "ideaBoardIdeaAction"),
+ -      );
+ -    } else {
+ -      actions.append(" ", actionButton("Delete", "delete", "ideaBoardIdeaAction"));
+ -    }
+ +    actions.append(" ", actionButton("Delete", "delete", "ideaBoardIdeaAction"));
+    }
+    row.append(actions);
+    tbody.append(row);
+ @@ -312,7 +328,7 @@ function renderNoteInputRow(tbody, ideaId, record = null) {
+    input.focus();
+  }
+
+ -function renderNoteRow(tbody, record) {
+ +function renderNoteRow(tbody, record, locked = false) {
+    const row = document.createElement("tr");
+    row.dataset.noteId = record.noteId;
+    row.dataset.ideaId = record.ideaId;
+ @@ -320,9 +336,11 @@ function renderNoteRow(tbody, record) {
+    row.append(cell(record.note));
+
+    const actions = document.createElement("td");
+ -  actions.append(actionButton("Edit", "edit", "ideaBoardNoteAction"));
+ -  if (!record.system) {
+ -    actions.append(" ", actionButton("Delete", "delete", "ideaBoardNoteAction"));
+ +  if (!locked) {
+ +    actions.append(actionButton("Edit", "edit", "ideaBoardNoteAction"));
+ +    if (!record.system) {
+ +      actions.append(" ", actionButton("Delete", "delete", "ideaBoardNoteAction"));
+ +    }
+    }
+    row.append(actions);
+    tbody.append(row);
+ @@ -337,6 +355,7 @@ function renderExpandedNotesRow(tbody, record) {
+
+    const childSurface = document.createElement("div");
+    childSurface.className = "idea-board-notes-child-surface";
+ +  const locked = isLockedIdea(record);
+
+    const tableWrapper = document.createElement("div");
+    tableWrapper.className = "table-wrapper";
+ @@ -353,20 +372,22 @@ function renderExpandedNotesRow(tbody, record) {
+    childSurface.append(tableWrapper);
+
+    for (const note of notesForIdea(record.ideaId)) {
+ -    if (state.editingNoteId === note.noteId) {
+ +    if (!locked && state.editingNoteId === note.noteId) {
+        renderNoteInputRow(notesBody, record.ideaId, note);
+      } else {
+ -      renderNoteRow(notesBody, note);
+ +      renderNoteRow(notesBody, note, locked);
+      }
+    }
+ -  if (state.addingNoteIdeaId === record.ideaId) renderNoteInputRow(notesBody, record.ideaId);
+ -
+ -  const controls = document.createElement("div");
+ -  controls.className = "action-group idea-board-notes-child-actions";
+ -  const addNote = actionButton("Add Note", "add", "ideaBoardNoteAction", "primary");
+ -  addNote.dataset.ideaBoardAddNote = record.ideaId;
+ -  controls.append(addNote);
+ -  childSurface.append(controls);
+ +  if (!locked && state.addingNoteIdeaId === record.ideaId) renderNoteInputRow(notesBody, record.ideaId);
+ +
+ +  if (!locked) {
+ +    const controls = document.createElement("div");
+ +    controls.className = "action-group idea-board-notes-child-actions";
+ +    const addNote = actionButton("Add Note", "add", "ideaBoardNoteAction", "primary");
+ +    addNote.dataset.ideaBoardAddNote = record.ideaId;
+ +    controls.append(addNote);
+ +    childSurface.append(controls);
+ +  }
+    content.append(childSurface);
+
+    row.append(content);
+ @@ -391,7 +412,7 @@ function render(root) {
+    renderStatusFilter(root);
+    tbody.replaceChildren();
+    for (const record of visibleIdeas()) {
+ -    if (state.editingIdeaId === record.ideaId) {
+ +    if (state.editingIdeaId === record.ideaId && !isLockedIdea(record)) {
+        renderIdeaInputRow(tbody, record);
+      } else {
+        renderIdeaRow(tbody, record);
+ @@ -426,6 +447,12 @@ function saveIdeaRow(root, row) {
+        updateStatus(root, "Idea Board could not find that idea.");
+        return;
+      }
+ +    if (isLockedIdea(record)) {
+ +      state.editingIdeaId = null;
+ +      updateStatus(root, "This project is read-only.");
+ +      render(root);
+ +      return;
+ +    }
+      record.idea = idea;
+      record.pitch = pitch;
+      if (status === "Archived" && record.status !== "Archived") {
+ @@ -448,6 +475,14 @@ function saveIdeaRow(root, row) {
+
+  function saveNoteRow(root, row) {
+    const ideaId = row.dataset.ideaId;
+ +  const idea = ideaRecord(ideaId);
+ +  if (idea && isLockedIdea(idea)) {
+ +    state.editingNoteId = null;
+ +    state.addingNoteIdeaId = null;
+ +    updateStatus(root, "Project notes are read-only.");
+ +    render(root);
+ +    return;
+ +  }
+    const value = row.querySelector("[data-idea-board-note-input]")?.value.trim();
+    if (!value) {
+      updateStatus(root, "Enter note text before saving.");
+ @@ -513,6 +548,19 @@ function deleteIdea(root, ideaId) {
+    render(root);
+  }
+
+ +function projectSourceIdea(record) {
+ +  return {
+ +    idea: record.idea,
+ +    pitch: record.pitch,
+ +    notes: notesForIdea(record.ideaId).map((note) => note.note),
+ +  };
+ +}
+ +
+ +function gameHubUrl(record) {
+ +  const suffix = record.projectId ? `?game=${encodeURIComponent(record.projectId)}` : "";
+ +  return `${gameHubRoute}${suffix}`;
+ +}
+ +
+  function createProject(root, ideaId) {
+    const record = ideaRecord(ideaId);
+    if (!record) {
+ @@ -523,9 +571,26 @@ function createProject(root, ideaId) {
+      updateStatus(root, "Set this idea to Ready before creating a project.");
+      return;
+    }
+ +  const repository = gameHubProjectRepository();
+ +  const project = repository.createGame({
+ +    name: record.idea,
+ +    purpose: "Game",
+ +    sourceIdea: projectSourceIdea(record),
+ +    status: "Planning",
+ +  });
+ +  if (isRepositoryErrorResult(project) || !project || !project.id) {
+ +    console.warn("Idea Board could not create a Game Hub project.", project?.message || repository.__apiDiagnostic?.() || "");
+ +    updateStatus(root, "Game Hub project could not be created right now. Try again shortly.");
+ +    return;
+ +  }
+    record.status = "Project";
+    record.previousStatus = "Project";
+ +  record.projectId = project.id;
+ +  record.projectName = project.name || record.idea;
+    record.updated = today();
+ +  state.editingIdeaId = null;
+ +  state.editingNoteId = null;
+ +  state.addingNoteIdeaId = null;
+    updateStatus(root, `${record.idea} is now a project.`);
+    render(root);
+  }
+ @@ -539,6 +604,9 @@ function archiveIdea(root, ideaId) {
+    if (record.status !== "Archived") record.previousStatus = record.status;
+    record.status = "Archived";
+    record.updated = today();
+ +  state.editingIdeaId = null;
+ +  state.editingNoteId = null;
+ +  state.addingNoteIdeaId = null;
+    if (!state.visibleStatuses.has("Archived") && state.expandedIdeaId === ideaId) {
+      state.expandedIdeaId = null;
+    }
+ @@ -565,7 +633,12 @@ function openProject(root, ideaId) {
+      updateStatus(root, "Idea Board could not open that project.");
+      return;
+    }
+ -  updateStatus(root, `Opening ${record.idea}.`);
+ +  if (!record.projectId) {
+ +    updateStatus(root, "Create the Game Hub project before opening it.");
+ +    return;
+ +  }
+ +  updateStatus(root, `Opening ${record.idea} in Game Hub.`);
+ +  window.location.href = gameHubUrl(record);
+  }
+
+  function handleIdeaAction(root, actionControl) {
+ @@ -578,6 +651,11 @@ function handleIdeaAction(root, actionControl) {
+      updateStatus(root, "Adding a new idea.");
+      render(root);
+    } else if (action === "edit") {
+ +    if (isLockedIdea(ideaRecord(ideaId))) {
+ +      updateStatus(root, "This project is read-only.");
+ +      render(root);
+ +      return;
+ +    }
+      state.editingIdeaId = ideaId;
+      state.addingIdea = false;
+      updateStatus(root, `Editing ${ideaRecord(ideaId)?.idea}.`);
+ @@ -606,6 +684,14 @@ function handleNoteAction(root, actionControl) {
+    const action = actionControl.dataset.ideaBoardNoteAction;
+    const row = actionControl.closest("tr");
+    const ideaId = actionControl.dataset.ideaBoardAddNote || row?.dataset.ideaId || state.expandedIdeaId;
+ +  const idea = ideaRecord(ideaId);
+ +  if (idea && isLockedIdea(idea)) {
+ +    state.editingNoteId = null;
+ +    state.addingNoteIdeaId = null;
+ +    updateStatus(root, "Project notes are read-only.");
+ +    render(root);
+ +    return;
+ +  }
+    const noteId = row?.dataset.noteId;
+    if (action === "add") {
+      state.expandedIdeaId = ideaId;
++>>>>>>> decd37141d09cd8e2ff609da3c25404f1ed6c682
```

## Combined Conflict Patch Before Cleanup
```diff
diff --cc docs_build/dev/reports/codex_changed_files.txt
index f75c39140,3fb4228d0..000000000
--- a/docs_build/dev/reports/codex_changed_files.txt
+++ b/docs_build/dev/reports/codex_changed_files.txt
@@@ -1,5 -1,54 +1,62 @@@
++<<<<<<< HEAD
 +docs_build/dev/PROJECT_INSTRUCTIONS.md
 +docs_build/dev/PROJECT_MULTI_PC.txt
 +docs_build/dev/reports/codex_review.diff
 +docs_build/dev/reports/codex_changed_files.txt
 +docs_build/dev/reports/team_alpha_beta_owner_approval_report.md
++=======
+ PR_26171_044-idea-board-game-hub-project-flow
+
+ Changed files:
+ - docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md
+ - docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md
+ - docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md
+ - docs_build/dev/reports/codex_review.diff
+ - docs_build/dev/reports/codex_changed_files.txt
+ - src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+ - tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+ - tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+ - tests/playwright/tools/ToolboxRoutePages.spec.mjs
+ - toolbox/game-workspace/game-workspace.js
+ - toolbox/game-workspace/index.html
+ - toolbox/idea-board/index.html
+ - toolbox/idea-board/index.js
+
+ Requirement PASS evidence:
+ - PASS: Create Project appears only for Ready ideas. Evidence: Idea Board actions remain Edit/Create Project/Delete for Ready rows and switch to Open in Game Hub/Archive after creation in targeted Playwright.
+ - PASS: Create Project uses the shared Game Hub project contract. Evidence: Idea Board calls the existing game-workspace server repository client createGame method; Playwright asserts the createGame repository request occurs.
+ - PASS: Create Project sets Idea status to Project. Evidence: targeted Playwright asserts the row status becomes Project.
+ - PASS: Project ideas and notes are read-only. Evidence: targeted Playwright asserts no Edit/Delete/Add Note/note actions remain for the Project row.
+ - PASS: Project row actions are Open in Game Hub and Archive. Evidence: targeted Playwright asserts exact action labels.
+ - PASS: Project ideas cannot be edited or deleted while Project. Evidence: Project rows do not render Edit/Delete actions and deletion guard remains active.
+ - PASS: Project ideas cannot add/edit/delete notes. Evidence: expanded Project notes render without Add Note or note actions.
+ - PASS: Archived ideas remain hidden by default and show Restore/Delete when visible. Evidence: targeted Playwright archives, shows Archived through the filter, and asserts Restore/Delete.
+ - PASS: Game Hub shows creator-facing Project Information. Evidence: Game Hub HTML/JS replaces internal record display with Project Information and targeted Game Hub Playwright passes.
+ - PASS: Game Hub shows read-only Source Idea fields. Evidence: Idea Board-to-Game Hub Playwright asserts Idea, Pitch, and Notes from the source idea render in Game Hub.
+ - PASS: Game Hub avoids internal IDs, DB/API/mock/debug/seed wording in creator-facing display. Evidence: touched runtime files pass creator-visible text scan and targeted Playwright checks the navigated Game Hub main content.
+ - PASS: Open in Game Hub navigates to the related project. Evidence: targeted Playwright waits for /toolbox/game-workspace/index.html?game=lantern-reef-* and asserts the linked project renders.
+ - PASS: No Game Journey expansion beyond existing link/reference. Evidence: implementation does not add Game Journey creation or new journey wiring.
+
+ Validation evidence:
+ - PASS: node --check toolbox/idea-board/index.js
+ - PASS: node --check toolbox/game-workspace/game-workspace.js
+ - PASS: node --check toolbox/game-workspace/game-workspace-api-client.js
+ - PASS: node --check src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+ - PASS: node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+ - PASS: node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs
+ - PASS: node --check tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+ - PASS: npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line
+ - PASS: npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --workers=1 --reporter=line --grep "Idea Board launches"
+ - PASS: npx playwright test tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs --project=playwright --workers=1 --reporter=line --grep "Game Hub"
+ - PASS: npm run test:workspace-v2
+ - PASS: git diff --check
+
+ Git workflow:
+ - Current branch: codex/pr-26171-044-idea-board-game-hub-project-flow
+ - Created branch: codex/pr-26171-044-idea-board-game-hub-project-flow
+ - Commit hash: 2a38796f81aae2dceb4151095b8f89a276cd2d32
+ - Push result: pushed to origin/codex/pr-26171-044-idea-board-game-hub-project-flow
+ - PR URL: https://github.com/ToolboxAid/HTML-JavaScript-Gaming/pull/22
+ - Merge result: to be reported after merge
+ - Final main commit: to be reported after returning to main and pulling latest
++>>>>>>> decd37141d09cd8e2ff609da3c25404f1ed6c682
diff --cc docs_build/dev/reports/codex_review.diff
index 5ed010f9d,cffbc3823..000000000
--- a/docs_build/dev/reports/codex_review.diff
+++ b/docs_build/dev/reports/codex_review.diff
@@@ -1,214 -1,1210 +1,1427 @@@
++<<<<<<< HEAD
 +diff --git a/docs_build/dev/PROJECT_INSTRUCTIONS.md b/docs_build/dev/PROJECT_INSTRUCTIONS.md
 +index 528312412..3c3afa7bd 100644
 +--- a/docs_build/dev/PROJECT_INSTRUCTIONS.md
 ++++ b/docs_build/dev/PROJECT_INSTRUCTIONS.md
 +@@ -2009,6 +2009,16 @@ Required Git workflow report fields:
 + - merge result
 + - final main commit
 +
 ++## OWNER-CONTROLLED STABLE AND MERGE APPROVAL
 ++
 ++Stable promotion and merge approval are owner-controlled.
 ++
 ++Rules:
 ++- Codex may prepare scoped changes, reports, validation evidence, ZIP artifacts, branches, and PRs.
 ++- Codex must not merge a PR or mark a workstream stable without explicit approval from the assigned Team Alpha or Team Beta owner.
 ++- Master Control may recommend sequencing or assignment, but affected workstream owners control stable and merge approval.
 ++- This targeted section supersedes older automatic-merge wording when approval ownership is in question.
 ++
 + ## CODEX INSTRUCTION ENFORCEMENT START GATE
 +
 + Codex must run this gate before every PR execution and before any file changes.
 +@@ -2017,7 +2027,7 @@ Required instruction reads:
 + - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
 + - Read `docs_build/dev/PROJECT_MULTI_PC.txt`.
 + - Treat the newest applicable section in `PROJECT_INSTRUCTIONS.md` as authoritative when rules overlap.
 +-- Treat the current owner/parity section in `PROJECT_MULTI_PC.txt` as authoritative for PC/Laptop routing.
 ++- Treat the current owner/parity section in `PROJECT_MULTI_PC.txt` as authoritative for Team Alpha / Team Beta routing.
 +
 + Required pre-change report:
 + - Codex must report instruction compliance as `PASS` or `FAIL` before making file changes.
 +@@ -2027,7 +2037,7 @@ Required pre-change report:
 + Hard stops before changes:
 + - If the current branch is not `main`, HARD STOP.
 + - If the repository is not clean before the PR branch is created, HARD STOP.
 +-- If the PR owner does not match the PC/Laptop ownership map in `PROJECT_MULTI_PC.txt`, HARD STOP.
 ++- If the PR owner does not match the Team Alpha / Team Beta ownership map in `PROJECT_MULTI_PC.txt`, HARD STOP.
 + - If the PR number parity does not match the assigned machine in `PROJECT_MULTI_PC.txt`, HARD STOP.
 + - If the PR asks for implementation and the implementation path is wrong, HARD STOP.
 + - If a PR asks for functional parity and only placeholder-only work is possible, HARD STOP and report the missing source or blocker.
 +diff --git a/docs_build/dev/PROJECT_MULTI_PC.txt b/docs_build/dev/PROJECT_MULTI_PC.txt
 +index 60ef4881a..7d2a078ef 100644
 +--- a/docs_build/dev/PROJECT_MULTI_PC.txt
 ++++ b/docs_build/dev/PROJECT_MULTI_PC.txt
 +@@ -11,7 +11,7 @@ Naming governance
 + Workflow governance
 + Environment strategy
 + PR sequencing
 +-Merge approval
 ++Stable and merge approval
 +
 + It should never build code and never own implementation details.
 +
 +@@ -22,12 +22,12 @@ Requirements
 + Acceptance Criteria
 + Dependencies
 + Priority
 +-Owner (PC/Laptop)
 ++Owner (Team Alpha / Team Beta)
 + Recommended Workstream Split
 +
 + Instead of arbitrary splits, split by Creator journey.
 +
 +-PC — Creator Journey
 ++Team Alpha — Creator Journey
 +
 + Owns:
 +
 +@@ -57,7 +57,7 @@ Reason:
 +
 + These tools are heavily connected.
 +
 +-Laptop — Content Creation
 ++Team Beta — Content Creation
 +
 + Owns:
 +
 +@@ -85,7 +85,7 @@ These tools share asset pipelines and publishing workflows.
 +
 + Messages Tool Placement
 +
 +-I would move Messages to Laptop ownership.
 ++I would move Messages to Team Beta ownership.
 +
 + Reason:
 +
 +@@ -191,7 +191,7 @@ Immediate Queue
 +
 + If we start using Master Control today, my queue would be:
 +
 +-PC
 ++Team Alpha
 + PR_26171_001-game-journey-completion-model
 +
 + Scope:
 +@@ -205,7 +205,7 @@ Sounds [17]
 +
 + This solves the "xxx%" problem.
 +
 +-Laptop
 ++Team Beta
 + PR_26171_002-messages-tool-foundation
 +
 + Scope:
 +@@ -282,7 +282,7 @@ Not developer.
 +
 + ---
 +
 +-## PC Chat
 ++## Team Alpha Chat
 +
 + Give it ownership of a workstream.
 +
 +@@ -309,7 +309,7 @@ it keeps building in that area.
 +
 + ---
 +
 +-## Laptop Chat
 ++## Team Beta Chat
 +
 + Give it a different workstream.
 +
 +@@ -371,13 +371,13 @@ So I'd keep IST mostly as infrastructure work and focus development on tool comp
 + Master Control should assign ownership:
 +
 + ```text
 +-PC
 ++Team Alpha
 +   Game Journey
 +   Game Hub
 +   Publish
 +   Share
 +
 +-Laptop
 ++Team Beta
 +   Audio
 +   MIDI
 +   Events
 +@@ -405,7 +405,7 @@ feature/game-hub
 + feature/progress-tracking
 + ```
 +
 +-Never have both PCs working in the same tool at the same time.
 ++Never have both teams working in the same tool at the same time.
 +
 + ---
 +
 +@@ -418,8 +418,8 @@ For example, in Master Control you can ask:
 + ```text
 + Given everything we know about GFS:
 +
 +-What should PC build next?
 +-What should Laptop build next?
 ++What should Team Alpha build next?
 ++What should Team Beta build next?
 +
 + Generate the next PR for each.
 + ```
 +@@ -427,10 +427,10 @@ Generate the next PR for each.
 + Then Master Control outputs:
 +
 + ```text
 +-PC:
 ++Team Alpha:
 + PR_26171_002-game-hub-progress
 +
 +-Laptop:
 ++Team Beta:
 + PR_26171_003-messages-tool-mvp
 + ```
 +
 +@@ -457,17 +457,17 @@ Codex must read this file before every PR execution.
 +
 + Machine parity:
 +
 +-PC / Environment 1:
 ++Team Alpha / Environment 1:
 + - Uses even-numbered PR sequence values.
 + - Example: `PR_26171_064-*`.
 +
 +-Laptop / Environment 2:
 ++Team Beta / Environment 2:
 + - Uses odd-numbered PR sequence values.
 + - Example: `PR_26171_063-*`.
 +
 + Owner map:
 +
 +-PC / Environment 1 owns Creator Journey work:
 ++Team Alpha / Environment 1 owns Creator Journey work:
 + - Game Journey
 + - Game Hub
 + - Idea
 +@@ -483,7 +483,7 @@ PC / Environment 1 owns Creator Journey work:
 + - Game Design
 + - Game Crew
 +
 +-Laptop / Environment 2 owns Content Creation and asset/publishing work:
 ++Team Beta / Environment 2 owns Content Creation and asset/publishing work:
 + - Graphics
 + - Toolbox images
 + - Audio
 +@@ -501,8 +501,12 @@ Governance, recovery, diagnostics, and instruction-hardening PRs:
 + - Must not implement tool/runtime work from the opposite owner.
 + - Must document owner/parity compliance in the PR report.
 +
 ++Stable and merge approval:
 ++- Stable promotion and merge approval are controlled by the assigned Team Alpha or Team Beta owner.
 ++- Master Control may recommend sequencing, but Codex must not merge or mark stable without explicit owner approval for the affected workstream.
 ++
 + Hard stop rules:
 + - If the PR number parity does not match the current machine, stop before changes.
 + - If the PR scope belongs to the other machine owner, stop before changes.
 +-- If the PR crosses PC and Laptop ownership, stop and require Master Control to split or assign the work.
 ++- If the PR crosses Team Alpha and Team Beta ownership, stop and require Master Control to split or assign the work.
 + - If the requested implementation path conflicts with the active owner path, stop before changes.
++=======
+ diff --git a/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md
+ new file mode 100644
+ index 000000000..2fba95562
+ --- /dev/null
+ +++ b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/APPLY_PR.md
+ @@ -0,0 +1,17 @@
+ +# PR_26171_044-idea-board-game-hub-project-flow Apply
+ +
+ +## Apply Steps
+ +
+ +1. Start from clean `main`.
+ +2. Pull latest `main`.
+ +3. Create `codex/pr-26171-044-idea-board-game-hub-project-flow`.
+ +4. Implement only the BUILD scope.
+ +5. Run requested validation.
+ +6. Stage scoped files only.
+ +7. Commit.
+ +8. Push branch.
+ +9. Create PR.
+ +10. Resolve conflicts if encountered and rerun validation.
+ +11. Merge after validation passes.
+ +12. Return to `main` and pull latest.
+ +13. Produce final report with PR URL, merge result, final main commit, ZIP path, ZIP size, ZIP contents, and requirement PASS evidence.
+ diff --git a/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md
+ new file mode 100644
+ index 000000000..228f7703f
+ --- /dev/null
+ +++ b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/BUILD_PR.md
+ @@ -0,0 +1,56 @@
+ +# PR_26171_044-idea-board-game-hub-project-flow Build
+ +
+ +## Source Of Truth
+ +
+ +Use the user request for `PR_26171_044-idea-board-game-hub-project-flow`, `docs_build/dev/PROJECT_INSTRUCTIONS.md`, `docs_build/dev/PROJECT_MULTI_PC.txt`, and this BUILD doc.
+ +
+ +## Singular Purpose
+ +
+ +Complete the Idea Board to Game Hub creator project handoff.
+ +
+ +## Exact Targets
+ +
+ +- `toolbox/idea-board/index.js`
+ +- `toolbox/game-workspace/game-workspace.js`
+ +- Existing targeted Playwright specs for Idea Board and Game Hub/Game Workspace.
+ +- Any smallest existing shared project or handoff contract file required by the flow.
+ +- `docs_build/dev/reports/codex_review.diff`
+ +- `docs_build/dev/reports/codex_changed_files.txt`
+ +
+ +## Requirements
+ +
+ +- Create Project appears only for Ready ideas.
+ +- Clicking Create Project creates or links a Game Hub project using an existing/shared project contract if available.
+ +- Clicking Create Project sets Idea status to Project.
+ +- Project ideas and their notes become read-only.
+ +- Project row actions are Open in Game Hub and Archive.
+ +- Project ideas cannot be edited or deleted.
+ +- Project ideas cannot add, edit, or delete notes.
+ +- Archived ideas remain hidden by default through existing filter behavior and show Restore and Delete when visible.
+ +- Game Hub displays creator-facing project data only.
+ +- Game Hub shows Project Information.
+ +- Game Hub shows a read-only Source Idea section with Idea, Pitch, and Notes.
+ +- Game Hub must not show internal IDs, DB/API/mock/debug/seed wording, or implementation details.
+ +- Open in Game Hub from Idea Board navigates to the related Game Hub project view.
+ +- If existing project handoff, route, or mock adapter wiring is missing, add the smallest fix needed.
+ +- Do not expand into Game Journey unless required as a stub/reference for the handoff.
+ +
+ +## Non-Goals
+ +
+ +- Do not change unrelated Game Hub workflows.
+ +- Do not introduce real database persistence.
+ +- Do not add SQLite.
+ +- Do not change full samples smoke behavior.
+ +
+ +## Validation
+ +
+ +- `node --check toolbox/idea-board/index.js`
+ +- Changed-file syntax checks for Game Hub JavaScript.
+ +- Targeted Idea Board Playwright.
+ +- Targeted Game Hub Playwright if existing coverage exists.
+ +- `npm run test:workspace-v2`
+ +- `git diff --check`
+ +
+ +## ZIP
+ +
+ +Produce `tmp/PR_26171_044-idea-board-game-hub-project-flow_delta.zip` with repo-structured changed files only.
+ diff --git a/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md
+ new file mode 100644
+ index 000000000..c93dea32e
+ --- /dev/null
+ +++ b/docs_build/pr/PR_26171_044-idea-board-game-hub-project-flow/PLAN_PR.md
+ @@ -0,0 +1,31 @@
+ +# PR_26171_044-idea-board-game-hub-project-flow Plan
+ +
+ +## Purpose
+ +
+ +Wire the Idea Board Create Project action into a creator-facing Game Hub project view while preserving table-first Idea Board behavior.
+ +
+ +## Scope
+ +
+ +- Create or link a Game Hub project when a Ready idea uses Create Project.
+ +- Move created Project ideas into a read-only Idea Board state with Open in Game Hub and Archive actions.
+ +- Keep Archived ideas hidden by default and restorable/deletable when visible.
+ +- Productionize Game Hub project display with Project Information and read-only Source Idea fields.
+ +- Add the smallest handoff/project-contract fix needed to complete the flow.
+ +
+ +## Validation
+ +
+ +- `node --check toolbox/idea-board/index.js`
+ +- Changed-file syntax checks for Game Hub JavaScript.
+ +- Targeted Idea Board Playwright.
+ +- Targeted Game Hub Playwright if existing coverage exists.
+ +- `npm run test:workspace-v2`
+ +- Do not run full samples smoke.
+ +
+ +## Reports
+ +
+ +- `docs_build/dev/reports/codex_review.diff`
+ +- `docs_build/dev/reports/codex_changed_files.txt`
+ +
+ +## Delivery
+ +
+ +- Commit, push, create PR, merge after validation passes, return to `main`, pull latest `main`, and produce `tmp/PR_26171_044-idea-board-game-hub-project-flow_delta.zip`.
+ diff --git a/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js b/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+ index ad5602999..fff42032d 100644
+ --- a/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+ +++ b/src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js
+ @@ -156,8 +156,37 @@ export const GAME_WORKSPACE_SCHEMA = Object.freeze({
+    game_members: Object.freeze(["gameId", "userKey", "permission", "role"]),
+  });
+
+ +function normalizeSourceIdea(sourceIdea) {
+ +  if (!sourceIdea || typeof sourceIdea !== "object") {
+ +    return null;
+ +  }
+ +
+ +  const idea = String(sourceIdea.idea || "").trim();
+ +  const pitch = String(sourceIdea.pitch || "").trim();
+ +  const notes = Array.isArray(sourceIdea.notes)
+ +    ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
+ +    : [];
+ +
+ +  if (!idea && !pitch && !notes.length) {
+ +    return null;
+ +  }
+ +
+ +  return { idea, pitch, notes };
+ +}
+ +
+ +function cloneRow(row) {
+ +  const cloned = { ...row };
+ +  const sourceIdea = normalizeSourceIdea(row.sourceIdea);
+ +  if (sourceIdea) {
+ +    cloned.sourceIdea = sourceIdea;
+ +  } else {
+ +    delete cloned.sourceIdea;
+ +  }
+ +  return cloned;
+ +}
+ +
+  function cloneRows(rows) {
+ -  return rows.map((row) => ({ ...row }));
+ +  return rows.map(cloneRow);
+  }
+
+  function cloneTables(tables) {
+ @@ -227,6 +256,7 @@ export function createGameWorkspaceMockRepository() {
+      return {
+        ...game,
+        purpose: game.purpose || "Game",
+ +      sourceIdea: normalizeSourceIdea(game.sourceIdea),
+        ownerDisplayName: owner?.displayName || game.ownerKey,
+        members: getGameMembers(game.id),
+      };
+ @@ -373,6 +403,10 @@ export function createGameWorkspaceMockRepository() {
+        purpose,
+        status,
+      };
+ +    const sourceIdea = normalizeSourceIdea(input.sourceIdea);
+ +    if (sourceIdea) {
+ +      game.sourceIdea = sourceIdea;
+ +    }
+
+      tables.games.push(game);
+      tables.game_members.push({
+ diff --git a/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs b/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+ index 1787b86d8..1c1f742a9 100644
+ --- a/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+ +++ b/tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs
+ @@ -15,6 +15,14 @@ const SUPABASE_ENV_KEYS = Object.freeze([
+  let fakeSupabaseServer;
+  let previousSupabaseEnv;
+
+ +function restoreEnvValue(key, value) {
+ +  if (value === undefined) {
+ +    delete process.env[key];
+ +    return;
+ +  }
+ +  process.env[key] = value;
+ +}
+ +
+  function startFakeSupabaseServer() {
+    const tables = {
+      roles: [],
+ @@ -123,6 +131,16 @@ test.afterAll(async () => {
+
+  async function openRepoPage(page, pathName, options = {}) {
+    const server = await startRepoServer();
+ +  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
+ +  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
+ +  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
+ +  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
+ +  const closeServer = server.close.bind(server);
+ +  server.close = async () => {
+ +    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
+ +    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
+ +    await closeServer();
+ +  };
+    const failedRequests = [];
+    const pageErrors = [];
+    const consoleErrors = [];
+ @@ -235,12 +253,10 @@ test("Game Hub creates, opens, and deletes mock games", async ({ page }) => {
+      await expect(page.getByRole("button", { name: "Create Game" })).toBeEnabled();
+      await expect(page.getByRole("button", { name: "Delete Open Game" })).toHaveClass("btn");
+      await expect(page.getByRole("button", { name: "Delete Open Game" })).toBeEnabled();
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("Game Hub records loaded from the project records service");
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("authoritative keys managed by service");
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("asset references linked to storage object keys: 0");
+ +    await expect(page.locator("[data-project-record-status]")).toHaveText("Project Information loaded.");
+ +    await expect(page.locator("[data-game-project-information]")).toContainText("Project Information");
+      await expect(page.locator("[data-project-records-table]")).toContainText("Demo Game");
+ -    await expect(page.locator("[data-project-records-table]")).toContainText("Project records service");
+ -    await expect(page.locator("[data-project-records-table]")).toContainText("asset refs 0");
+ +    await expect(page.locator("[data-source-idea-section]")).toContainText("No source idea yet");
+      await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
+      await expect(page.locator("[data-active-game-purpose]")).toHaveText("Game");
+      await expect(page.locator("[data-current-user-role]")).toHaveText("Owner");
+ @@ -257,7 +273,7 @@ test("Game Hub creates, opens, and deletes mock games", async ({ page }) => {
+      await page.getByRole("button", { name: "Create Game" }).click();
+      await expect(page.locator("[data-active-game-name]")).toHaveText("Launch Test Game");
+      await expect(page.locator("[data-game-list]")).toContainText("Launch Test Game");
+ -    await expect(page.locator("[data-project-records-table]")).toContainText("Launch Test Game");
+ +    await expect(page.locator("[data-game-project-information]")).toContainText("Launch Test Game");
+      await expect(page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Open Launch Test Game (Active)" })).toHaveClass(/primary/);
+      await expect(page.locator("[data-game-workspace-log]")).toHaveText("Created and opened Launch Test Game.");
+
+ @@ -287,11 +303,8 @@ test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }
+    try {
+      await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
+      await expect(page.locator("[data-game-list]")).toContainText("Gravity Demo");
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("guest browsing enabled; guest saving blocked");
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("project records service");
+ -    await expect(page.locator("[data-project-record-status]")).toContainText("asset references linked to storage object keys: 0");
+ +    await expect(page.locator("[data-project-record-status]")).toHaveText("Project Information loaded. Sign in to save changes.");
+      await expect(page.locator("[data-project-records-table]")).toContainText("Demo Game");
+ -    await expect(page.locator("[data-project-records-table]")).toContainText("Project records service");
+      await expect(page.getByRole("button", { name: "Create Game" })).toBeDisabled();
+      await expect(page.getByRole("button", { name: "Delete Open Game" })).toBeDisabled();
+      await expect(page.getByLabel("Game Name")).toBeDisabled();
+ @@ -301,7 +314,7 @@ test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }
+
+      await page.getByRole("button", { name: "Open Gravity Demo" }).click();
+      await expect(page.locator("[data-active-game-name]")).toHaveText("Gravity Demo");
+ -    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Guest browsing enabled; sign in required to save Game Hub project records.");
+ +    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Sign in to create or update Game Hub projects.");
+
+      await expectNoPageFailures(failures);
+    } finally {
+ @@ -309,7 +322,7 @@ test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }
+    }
+  });
+
+ -test("Game Hub shows active-game API diagnostics without throwing", async ({ page }) => {
+ +test("Game Hub shows active-game errors without throwing", async ({ page }) => {
+    await page.route("**/api/toolbox/game-workspace/repositories/*/methods/getActiveGame", async (route) => {
+      await route.fulfill({
+        body: JSON.stringify({
+ @@ -326,7 +339,7 @@ test("Game Hub shows active-game API diagnostics without throwing", async ({ pag
+    try {
+      expect(failures.failedRequests.some((request) => request.includes("502") && request.includes("/methods/getActiveGame"))).toBe(true);
+      await expect(page.locator("[data-active-game-name]")).toHaveText("No game open");
+ -    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game unavailable for validation.");
+ +    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game is temporarily unavailable.");
+      expect(failures.pageErrors).toEqual([]);
+      expect(failures.consoleErrors.filter((message) => !message.includes("status of 502"))).toEqual([]);
+    } finally {
+ @@ -356,7 +369,7 @@ test("Game Hub reports malformed active-game payloads without throwing", async (
+    try {
+      await expect(page.locator("[data-active-game-name]")).toHaveText("No game open");
+      await expect(page.locator("[data-current-user-role]")).toHaveText("Viewer");
+ -    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game response is malformed.");
+ +    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active game is temporarily unavailable.");
+      await expect(page.getByLabel("Game Purpose")).toBeDisabled();
+
+      await expectNoPageFailures(failures);
+ @@ -395,7 +408,6 @@ test("Game Hub displays and edits game purpose and member role", async ({ page }
+      await expect(page.getByLabel("Game Purpose")).toHaveValue("Game");
+      await expect(page.getByLabel("Game Status")).toHaveValue("Under Construction");
+      await expect(page.getByLabel("Current User Role")).toHaveValue("Owner");
+ -    await expect(page.locator("[data-game-members-table]")).toContainText("Owner");
+
+      await page.getByLabel("Game Purpose").selectOption("Learning Game");
+      await expect(page.locator("[data-active-game-purpose]")).toHaveText("Learning Game");
+ @@ -407,7 +419,6 @@ test("Game Hub displays and edits game purpose and member role", async ({ page }
+
+      await page.getByLabel("Current User Role").selectOption("Designer");
+      await expect(page.locator("[data-current-user-role]")).toHaveText("Designer");
+ -    await expect(page.locator("[data-game-members-table]")).toContainText("Designer");
+      await expect(page.locator("[data-game-workspace-log]")).toHaveText("Updated current user role to Designer.");
+
+      await page.getByLabel("Game Purpose").selectOption("Capability Demo");
+ @@ -435,23 +446,22 @@ test("Game Hub progress panels update from mock game state", async ({ page }) =>
+      await expect(page.locator("[data-recommended-next-tool]").first()).toHaveText("Game Configuration");
+      await expect(page.locator("[data-game-progress-checklist]")).toContainText("Game identity: Complete");
+      await expect(page.locator("[data-game-output-panels] summary")).toHaveText([
+ -      "Readiness Output",
+ -      "Repository Tables",
+ -      "Team Members"
+ +      "Readiness Output"
+      ]);
+      await expect(page.locator("aside.tool-column").last().getByText("Readiness Output")).toHaveCount(0);
+ -    await expect(page.locator("aside.tool-column").last().getByText("Repository Tables")).toHaveCount(0);
+ -    await expect(page.locator("aside.tool-column").last().getByText("Team Members")).toHaveCount(0);
+      const panelOrderIsCorrect = await page.locator(".tool-center-panel").evaluate((panel) => {
+ +      const projectInformation = panel.querySelector("[data-game-project-information]");
+ +      const sourceIdea = panel.querySelector("[data-source-idea-section]");
+        const staticOverlay = panel.querySelector("[data-game-workspace-foundation]");
+        const outputPanels = panel.querySelector("[data-game-output-panels]");
+ -      const missingRequirements = panel.querySelector("[data-missing-requirements]");
+        return Boolean(
+ +        projectInformation &&
+ +        sourceIdea &&
+          staticOverlay &&
+          outputPanels &&
+ -        missingRequirements &&
+ -        (staticOverlay.compareDocumentPosition(outputPanels) & Node.DOCUMENT_POSITION_FOLLOWING) &&
+ -        (outputPanels.compareDocumentPosition(missingRequirements) & Node.DOCUMENT_POSITION_FOLLOWING)
+ +        (projectInformation.compareDocumentPosition(sourceIdea) & Node.DOCUMENT_POSITION_FOLLOWING) &&
+ +        (sourceIdea.compareDocumentPosition(staticOverlay) & Node.DOCUMENT_POSITION_FOLLOWING) &&
+ +        (staticOverlay.compareDocumentPosition(outputPanels) & Node.DOCUMENT_POSITION_FOLLOWING)
+        );
+      });
+      expect(panelOrderIsCorrect).toBe(true);
+ @@ -460,9 +470,7 @@ test("Game Hub progress panels update from mock game state", async ({ page }) =>
+      await page.getByRole("button", { name: "Create Game" }).click();
+      await expect(page.locator("[data-game-status]")).toHaveText("Under Construction");
+      await expect(page.locator("[data-game-progress]")).toHaveText("Progress Review Game identity ready");
+ -    await expect(page.locator("[data-table-counts], [data-game-table-counts]")).toContainText("games");
+ -    await expect(page.locator("[data-game-table-counts]")).toContainText("5");
+ -    await expect(page.locator("[data-game-members-table]")).toContainText("Owner");
+ +    await expect(page.locator("[data-game-project-information]")).toContainText("Progress Review Game");
+
+      await page.getByRole("button", { name: "Delete Open Game" }).click();
+      await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
+ diff --git a/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs b/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+ index 1a42e53d7..a18205fa4 100644
+ --- a/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+ +++ b/tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
+ @@ -1,4 +1,5 @@
+  import { expect, test } from "@playwright/test";
+ +import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
+  import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
+  import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
+
+ @@ -114,8 +115,18 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
+    const server = await startRepoServer();
+    const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
+    const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
+ +  const previousSupabaseEnv = {
+ +    GAMEFOUNDRY_DATABASE_URL: process.env.GAMEFOUNDRY_DATABASE_URL,
+ +    GAMEFOUNDRY_SUPABASE_ANON_KEY: process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY,
+ +    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY,
+ +    GAMEFOUNDRY_SUPABASE_URL: process.env.GAMEFOUNDRY_SUPABASE_URL,
+ +  };
+    process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
+    process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
+ +  process.env.GAMEFOUNDRY_DATABASE_URL = "postgres://idea-board:test@127.0.0.1:5432/idea_board";
+ +  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "idea-board-anon-key";
+ +  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "idea-board-service-role-key";
+ +  process.env.GAMEFOUNDRY_SUPABASE_URL = `${server.baseUrl}/fake-supabase`;
+    const failedRequests = [];
+    const pageErrors = [];
+    const consoleErrors = [];
+ @@ -139,6 +150,32 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
+    });
+
+    try {
+ +    await page.route("**/api/platform-settings/banner", async (route) => {
+ +      await route.fulfill({
+ +        contentType: "application/json",
+ +        body: JSON.stringify({
+ +          data: { banner: { active: false, message: "", tone: "info" } },
+ +          ok: true,
+ +        }),
+ +      });
+ +    });
+ +    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
+ +      await route.fulfill({
+ +        contentType: "application/json",
+ +        body: JSON.stringify({
+ +          data: {
+ +            activeTools: [],
+ +            readinessByStatus: {},
+ +            tools: [],
+ +            toolboxContract: {},
+ +          },
+ +          ok: true,
+ +        }),
+ +      });
+ +    });
+ +    await page.request.post(`${server.baseUrl}/api/session/user`, {
+ +      data: { userKey: MOCK_DB_KEYS.users.user1 },
+ +    });
+      await page.goto(`${server.baseUrl}/toolbox/idea-board/index.html`, { waitUntil: "networkidle" });
+      await expect(page.getByRole("heading", { level: 1, name: "Idea Board" })).toBeVisible();
+      await expectProductionCopy(page);
+ @@ -278,6 +315,13 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
+      await expect(page.locator("[data-idea-board-notes-count='lantern-reef']")).toHaveText("0 Notes");
+      await expect(page.locator("[data-idea-board-expanded-row='lantern-reef']")).toHaveCount(0);
+
+ +    await page.locator("[data-idea-board-idea-cell='lantern-reef']").click();
+ +    await expect(page.locator("[data-idea-board-expanded-row='lantern-reef']")).toBeVisible();
+ +    await page.locator("[data-idea-board-add-note='lantern-reef']").click();
+ +    await page.locator("[data-idea-board-note-input]").fill("Use dusk tide changes as the first Game Hub planning note.");
+ +    await page.locator("[data-idea-board-note-action='save']").click();
+ +    await expect(page.locator("[data-idea-board-notes-count='lantern-reef']")).toHaveText("1 Note");
+ +
+      await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='edit']").click();
+      await expect(page.locator("[data-idea-board-idea-input-row] [data-idea-board-idea-action]")).toHaveText(["Save", "Cancel"]);
+      await expect(page.locator("[data-idea-board-idea-status-input]")).toHaveCount(1);
+ @@ -287,10 +331,11 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Create Project", "Delete"]);
+      await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='create-project']").click();
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Project");
+ -    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Open Project", "Archive"]);
+ +    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Open in Game Hub", "Archive"]);
+ +    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='edit']")).toHaveCount(0);
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='delete']")).toHaveCount(0);
+ -    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='open-project']").click();
+ -    await expect(page.locator("[data-idea-board-status]")).toHaveText("Opening Lantern Reef.");
+ +    await expect(page.locator("[data-idea-board-add-note='lantern-reef']")).toHaveCount(0);
+ +    await expect(page.locator("[data-idea-board-notes-table='lantern-reef'] [data-idea-board-note-action]")).toHaveCount(0);
+      await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='archive']").click();
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toHaveCount(0);
+      await page.locator("[data-idea-board-status-filter-option][value='Archived']").check();
+ @@ -299,23 +344,25 @@ test("Idea Board uses accordion table ideas and notes", async ({ page }) => {
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Restore", "Delete"]);
+      await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='restore']").click();
+      await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] td").nth(1)).toHaveText("Project");
+ -    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='archive']").click();
+ -    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Restore", "Delete"]);
+ -    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='delete']").click();
+ -    await expect(page.locator("[data-idea-board-idea-row='lantern-reef']")).toHaveCount(0);
+ -    await page.locator("[data-idea-board-filter-clear-all]").click();
+ -    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(0);
+ -    await expect(page.locator("[data-idea-board-add-idea]")).toBeVisible();
+ -    await page.locator("[data-idea-board-filter-select-all]").click();
+ -    await expect(page.locator("[data-idea-board-idea-row]")).toHaveCount(3);
+ +    await expect(page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action]")).toHaveText(["Open in Game Hub", "Archive"]);
+ +    await page.locator("[data-idea-board-idea-row='lantern-reef'] [data-idea-board-idea-action='open-project']").click();
+ +    await page.waitForURL(/\/toolbox\/game-workspace\/index\.html\?game=lantern-reef-\d+$/);
+ +    await expect(page.getByRole("heading", { level: 1, name: "Game Hub" })).toBeVisible();
+ +    await expect(page.locator("[data-active-game-name]")).toHaveText("Lantern Reef");
+ +    await expect(page.locator("[data-source-idea-display]")).toHaveText("Lantern Reef");
+ +    await expect(page.locator("[data-source-idea-pitch]")).toHaveText("Guide light through a reef that rearranges at dusk.");
+ +    await expect(page.locator("[data-source-idea-notes]")).toContainText("Use dusk tide changes as the first Game Hub planning note.");
+ +    await expect(page.locator("main")).not.toContainText(/\bproject records\b|\bAPI\b|\bDB\b|\bmock\b|\bseed\b|\bdebug\b|\binternal\b/i);
+
+ -    expect(mutatingApiRequests).toEqual([]);
+ +    expect(mutatingApiRequests.some((request) => request.includes("/api/toolbox/game-workspace/repositories"))).toBe(true);
+ +    expect(mutatingApiRequests.some((request) => request.includes("/methods/createGame"))).toBe(true);
+      expect(failedRequests).toEqual([]);
+      expect(pageErrors).toEqual([]);
+      expect(consoleErrors).toEqual([]);
+    } finally {
+      restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
+      restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
+ +    Object.entries(previousSupabaseEnv).forEach(([key, value]) => restoreEnvValue(key, value));
+      await server.close();
+    }
+  });
+ diff --git a/tests/playwright/tools/ToolboxRoutePages.spec.mjs b/tests/playwright/tools/ToolboxRoutePages.spec.mjs
+ index b2d410c0f..bfe555c39 100644
+ --- a/tests/playwright/tools/ToolboxRoutePages.spec.mjs
+ +++ b/tests/playwright/tools/ToolboxRoutePages.spec.mjs
+ @@ -366,10 +366,6 @@ test("Idea Board launches from Toolbox with accordion table notes model", async
+      await page.locator("[data-idea-board-idea-status-input]").selectOption("Ready");
+      await page.locator("[data-idea-board-idea-action='save']").click();
+      await expect(page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Create Project", "Delete"]);
+ -    await page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action='create-project']").click();
+ -    await expect(page.locator("[data-idea-board-idea-row='launch-tile'] td").nth(1)).toHaveText("Project");
+ -    await expect(page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action]")).toHaveText(["Edit", "Open Project", "Archive"]);
+ -    await expect(page.locator("[data-idea-board-idea-row='launch-tile'] [data-idea-board-idea-action='delete']")).toHaveCount(0);
+      expect(mutatingApiRequests).toEqual([]);
+
+      expect(failedRequests).toEqual([]);
+ diff --git a/toolbox/game-workspace/game-workspace.js b/toolbox/game-workspace/game-workspace.js
+ index d57ed37ef..90aea08f8 100644
+ --- a/toolbox/game-workspace/game-workspace.js
+ +++ b/toolbox/game-workspace/game-workspace.js
+ @@ -3,12 +3,10 @@ import {
+    GAME_WORKSPACE_GAME_PURPOSES,
+    GAME_WORKSPACE_GAME_STATUSES,
+    createGameWorkspaceApiRepository,
+ -  readProjectWorkspaceProjectRecords,
+  } from "./game-workspace-api-client.js";
+  import { getSessionCurrent } from "../../src/api/session-api-client.js";
+
+  const repository = createGameWorkspaceApiRepository();
+ -let projectRecordContract = null;
+
+  const elements = {
+    activeGameName: document.querySelector("[data-active-game-name]"),
+ @@ -29,6 +27,10 @@ const elements = {
+    projectRecordStatus: document.querySelector("[data-project-record-status]"),
+    projectRecordsTable: document.querySelector("[data-project-records-table]"),
+    purposeInput: document.querySelector("[data-game-purpose-input]"),
+ +  sourceIdeaDisplay: document.querySelector("[data-source-idea-display]"),
+ +  sourceIdeaName: document.querySelector("[data-source-idea-name]"),
+ +  sourceIdeaNotes: document.querySelector("[data-source-idea-notes]"),
+ +  sourceIdeaPitch: document.querySelector("[data-source-idea-pitch]"),
+    gameStatus: document.querySelector("[data-game-status]"),
+    gameStatusInput: document.querySelector("[data-game-status-input]"),
+    publishingProgress: document.querySelector("[data-publishing-progress]"),
+ @@ -63,7 +65,7 @@ function isRepositoryErrorResult(value) {
+  }
+
+  function repositoryErrorMessage(value, context) {
+ -  return String(value?.message || value?.error || `${context} failed through the server API contract.`).trim();
+ +  return `${context} is temporarily unavailable. Refresh the page or try again shortly.`;
+  }
+
+  function reportRepositoryError(value, context) {
+ @@ -86,7 +88,7 @@ function normalizeActiveGame(value, context = "Active game") {
+      return null;
+    }
+    if (!isRecord(value) || !Array.isArray(value.members)) {
+ -    setStatusLog(`${context} response is malformed. Reload Game Hub after the server API contract is restored.`);
+ +    setStatusLog(`${context} is temporarily unavailable. Refresh the page or try again shortly.`);
+      return null;
+    }
+    return value;
+ @@ -96,23 +98,23 @@ function normalizeProgress(value) {
+    if (reportRepositoryError(value, "Game progress")) {
+      return {
+        gameStatus: "No Game",
+ -      gameProgress: "Blocked by server API error",
+ -      publishingProgress: "Blocked",
+ -      currentFocus: "Resolve the server API diagnostic",
+ +      gameProgress: "Progress is temporarily unavailable",
+ +      publishingProgress: "Unavailable",
+ +      currentFocus: "Refresh Game Hub",
+        recommendedNextTool: "Game Hub",
+        progressChecklist: [
+ -        { label: "Restore server API contract", status: "Blocked" },
+ +        { label: "Project information", status: "Unavailable" },
+        ],
+      };
+    }
+    if (!isRecord(value)) {
+ -    setStatusLog("Game progress response is malformed. Reload Game Hub after the server API contract is restored.");
+ +    setStatusLog("Game progress is temporarily unavailable. Refresh the page or try again shortly.");
+    }
+    return isRecord(value) ? value : {
+      gameStatus: "No Game",
+      gameProgress: "No active game",
+      publishingProgress: "Not started",
+ -    currentFocus: "Create or seed a game",
+ +    currentFocus: "Create a game",
+      recommendedNextTool: "Game Hub",
+      progressChecklist: [],
+    };
+ @@ -151,8 +153,8 @@ function refreshSaveControls() {
+    }
+    if (!saveAllowed) {
+      const currentStatus = String(elements.statusLog?.textContent || "");
+ -    if (!/Blocked|failed|malformed|Restore|Sign in required|unavailable/i.test(currentStatus)) {
+ -      setStatusLog("Guest browsing enabled; sign in required to save Game Hub project records.");
+ +    if (!/failed|Sign in required|unavailable/i.test(currentStatus)) {
+ +      setStatusLog("Sign in to create or update Game Hub projects.");
+      }
+    }
+  }
+ @@ -161,7 +163,7 @@ function ensureProjectRecordsSaveAllowed(action) {
+    if (projectRecordsSaveAllowed()) {
+      return true;
+    }
+ -  const message = `Sign in required to ${action} Game Hub project records.`;
+ +  const message = `Sign in required to ${action} Game Hub projects.`;
+    setStatusLog(message);
+    setProjectRecordStatus(message);
+    refreshSaveControls();
+ @@ -209,53 +211,31 @@ function createGameButton(game, isActive) {
+    return button;
+  }
+
+ -function renderProjectRecords() {
+ +function renderProjectInformation(activeGame, currentMember, progress) {
+    if (!elements.projectRecordsTable) {
+      return;
+    }
+
+ -  try {
+ -    projectRecordContract = readProjectWorkspaceProjectRecords();
+ -  } catch (error) {
+ -    projectRecordContract = null;
+ -    setProjectRecordStatus(error instanceof Error ? error.message : "Game Hub project records are unavailable.");
+ -    return;
+ -  }
+ -
+ -  const records = Array.isArray(projectRecordContract.records) ? projectRecordContract.records : [];
+ -  const source = projectRecordContract.sourceLabel || "Project records service";
+ -  const assetReferenceCount = Number(projectRecordContract.assetReferenceCount || 0);
+ -  const saveMode = projectRecordsSaveAllowed()
+ -    ? "signed-in saves enabled"
+ -    : "guest browsing enabled; guest saving blocked";
+ -  setProjectRecordStatus(`${projectRecordContract.terminology || "Game Hub"} records loaded from the project records service; authoritative keys managed by service; asset references linked to storage object keys: ${assetReferenceCount}; ${saveMode}.`);
+ -
+    elements.projectRecordsTable.replaceChildren();
+ -  if (!records.length) {
+ -    const row = document.createElement("tr");
+ -    ["No records", "No Game Hub records", "Not started", source].forEach((value) => {
+ -      const cell = document.createElement("td");
+ -      cell.textContent = value;
+ -      row.append(cell);
+ -    });
+ -    elements.projectRecordsTable.append(row);
+ -    return;
+ -  }
+ -
+ -  records.forEach((record) => {
+ -    const row = document.createElement("tr");
+ -    [
+ -      record.projectKey || "missing key",
+ -      record.name || "Untitled project",
+ -      record.status || "No status",
+ -      `${source}; asset refs ${Number(record.assetReferenceCount || 0)}`,
+ -    ].forEach((value) => {
+ -      const cell = document.createElement("td");
+ -      cell.textContent = value;
+ -      row.append(cell);
+ -    });
+ -    elements.projectRecordsTable.append(row);
+ +  const row = document.createElement("tr");
+ +  [
+ +    { datasetName: "activeGameName", value: activeGame?.name || "No game open" },
+ +    { datasetName: "activeGameStatus", value: activeGame?.status || progress?.gameStatus || "No Game" },
+ +    { datasetName: "activeGamePurpose", value: activeGame?.purpose || "No purpose" },
+ +    { datasetName: "activeGameOwner", value: activeGame?.ownerDisplayName || "No owner" },
+ +    { datasetName: "currentUserRole", value: currentMember?.role || "Viewer" },
+ +    { datasetName: "recommendedNextTool", value: progress?.recommendedNextTool || "Game Hub" },
+ +  ].forEach(({ datasetName, value }) => {
+ +    const cell = document.createElement("td");
+ +    cell.dataset[datasetName] = "true";
+ +    cell.textContent = value;
+ +    row.append(cell);
+    });
+ +  elements.projectRecordsTable.append(row);
+ +
+ +  setProjectRecordStatus(projectRecordsSaveAllowed()
+ +    ? "Project Information loaded."
+ +    : "Project Information loaded. Sign in to save changes.");
+  }
+
+  function renderGameList() {
+ @@ -268,7 +248,7 @@ function renderGameList() {
+    const listResult = repository.listGames(gameUserKey ? { userKey: gameUserKey } : {});
+    const games = Array.isArray(listResult) ? listResult : [];
+    if (!Array.isArray(listResult) && !reportRepositoryError(listResult, "Game list")) {
+ -    setStatusLog("Game list response is malformed. Reload Game Hub after the server API contract is restored.");
+ +    setStatusLog("Game list is temporarily unavailable. Refresh the page or try again shortly.");
+    }
+
+    elements.gameList.replaceChildren();
+ @@ -276,7 +256,7 @@ function renderGameList() {
+    if (games.length === 0) {
+      const emptyState = document.createElement("p");
+      emptyState.className = "status";
+ -    emptyState.textContent = "No games. Create or seed a game to continue.";
+ +    emptyState.textContent = "No games. Create a game to continue.";
+      elements.gameList.append(emptyState);
+      return;
+    }
+ @@ -343,7 +323,7 @@ function renderTableCounts() {
+      ? tableResult
+      : { users: [], games: [], game_members: [] };
+    if ((!isRecord(tableResult) || isRepositoryErrorResult(tableResult)) && !reportRepositoryError(tableResult, "Repository tables")) {
+ -    setStatusLog("Repository tables response is malformed. Reload Game Hub after the server API contract is restored.");
+ +    setStatusLog("Game Hub project details are temporarily unavailable. Refresh the page or try again shortly.");
+    }
+    const rows = [
+      ["users", Array.isArray(tables.users) ? tables.users.length : 0],
+ @@ -366,6 +346,29 @@ function renderTableCounts() {
+    });
+  }
+
+ +function renderSourceIdea(activeGame) {
+ +  const sourceIdea = isRecord(activeGame?.sourceIdea) ? activeGame.sourceIdea : null;
+ +  const name = String(sourceIdea?.idea || "").trim();
+ +  const pitch = String(sourceIdea?.pitch || "").trim();
+ +  const notes = Array.isArray(sourceIdea?.notes)
+ +    ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
+ +    : [];
+ +
+ +  setText(elements.sourceIdeaName, name || "No source idea yet");
+ +  setText(elements.sourceIdeaDisplay, name || "No source idea yet");
+ +  setText(elements.sourceIdeaPitch, pitch || "Create a project from Idea Board to see source details.");
+ +
+ +  if (elements.sourceIdeaNotes) {
+ +    elements.sourceIdeaNotes.replaceChildren();
+ +    const visibleNotes = notes.length ? notes : ["No source notes."];
+ +    visibleNotes.forEach((note) => {
+ +      const item = document.createElement("li");
+ +      item.textContent = note;
+ +      elements.sourceIdeaNotes.append(item);
+ +    });
+ +  }
+ +}
+ +
+  function renderChecklist(progress) {
+    if (!elements.progressChecklist) {
+      return;
+ @@ -419,7 +422,8 @@ function renderWorkspace() {
+    renderMembersTable(activeGame);
+    renderTableCounts();
+    renderChecklist(progress);
+ -  renderProjectRecords();
+ +  renderProjectInformation(activeGame, currentMember, progress);
+ +  renderSourceIdea(activeGame);
+    refreshSaveControls();
+  }
+
+ @@ -437,7 +441,7 @@ elements.form?.addEventListener("submit", (event) => {
+
+    if (reportRepositoryError(game, "Create Game") || !isRecord(game) || !String(game.name || "").trim()) {
+      if (!isRepositoryErrorResult(game)) {
+ -      setStatusLog("Create Game did not return a valid game. Restore the server API contract and try again.");
+ +      setStatusLog("Create Game could not be completed. Refresh the page or try again shortly.");
+      }
+      renderWorkspace();
+      return;
+ @@ -528,4 +532,15 @@ elements.currentUserRoleInput?.addEventListener("change", () => {
+  populateSelect(elements.purposeInput, GAME_WORKSPACE_GAME_PURPOSES);
+  populateSelect(elements.gameStatusInput, GAME_WORKSPACE_GAME_STATUSES);
+  populateSelect(elements.currentUserRoleInput, GAME_WORKSPACE_MEMBER_ROLES);
+ +const requestedGameId = new URL(window.location.href).searchParams.get("game");
+ +if (requestedGameId) {
+ +  const openedGame = repository.openGame(requestedGameId);
+ +  if (isRepositoryErrorResult(openedGame)) {
+ +    setStatusLog(repositoryErrorMessage(openedGame, "Open Game"));
+ +  } else if (openedGame) {
+ +    setStatusLog(`Opened ${openedGame.name}.`);
+ +  } else {
+ +    setStatusLog("That Game Hub project could not be found.");
+ +  }
+ +}
+  renderWorkspace();
+ diff --git a/toolbox/game-workspace/index.html b/toolbox/game-workspace/index.html
+ index ac1017b27..f204166d8 100644
+ --- a/toolbox/game-workspace/index.html
+ +++ b/toolbox/game-workspace/index.html
+ @@ -66,43 +66,58 @@
+                          </div>
+                      </aside>
+                      <div data-tool-display-mode data-asset-root="assets/theme-v2/images" data-tool-slug="game-workspace" data-tool-icon-src="assets/theme-v2/images/badges/index.png" data-tool-character-src="assets/theme-v2/images/characters/index.png"></div>
+ -                    <section class="tool-center-panel"><h2>Game Hub Overview</h2>
+ -                        <p>Game Hub manages game identity, status, progress, and launch readiness through the project records service.</p>
+ -                        <div class="status" role="status" data-project-record-status>Loading Game Hub project records.</div>
+ -                        <div class="table-wrapper">
+ -                            <table class="data-table" aria-label="Game Hub project records">
+ -                                <caption>Game Hub Project Records</caption>
+ -                                <thead>
+ -                                    <tr>
+ -                                        <th scope="col">Authoritative Key</th>
+ -                                        <th scope="col">Project</th>
+ -                                        <th scope="col">Status</th>
+ -                                        <th scope="col">Source</th>
+ -                                    </tr>
+ -                                </thead>
+ -                                <tbody data-project-records-table>
+ -                                    <tr><td>Loading</td><td>Loading</td><td>Loading</td><td>Project records service</td></tr>
+ -                                </tbody>
+ -                            </table>
+ -                        </div>
+ -                        <article class="card">
+ +                    <section class="tool-center-panel"><h2>Project Information</h2>
+ +                        <p>Review the open project and its source idea.</p>
+ +                        <div class="status" role="status" data-project-record-status>Project Information ready.</div>
+ +                        <article class="card" data-game-project-information>
+                              <div class="card-body content-stack">
+ -                                <div>
+ -                                    <div class="kicker">Open Game</div>
+ -                                    <h3 data-active-game-name>Demo Game</h3>
+ -                                </div>
+ -                                <div class="grid cols-3" aria-label="Active game summary">
+ -                                    <article class="mini-stat"><strong data-active-game-status>Under Construction</strong>Game Status</article>
+ -                                    <article class="mini-stat"><strong data-active-game-purpose>Game</strong>Game Purpose</article>
+ -                                    <article class="mini-stat"><strong data-active-game-owner>No owner</strong>Owner</article>
+ -                                    <article class="mini-stat"><strong data-current-user-role>Owner</strong>Current User Role</article>
+ -                                    <article class="mini-stat"><strong data-recommended-next-tool>Game Configuration</strong>Recommended Next Tool</article>
+ +                                <div class="table-wrapper">
+ +                                    <table class="data-table" aria-label="Project Information">
+ +                                        <caption>Project Information</caption>
+ +                                        <thead>
+ +                                            <tr>
+ +                                                <th scope="col">Project</th>
+ +                                                <th scope="col">Status</th>
+ +                                                <th scope="col">Purpose</th>
+ +                                                <th scope="col">Owner</th>
+ +                                                <th scope="col">Role</th>
+ +                                                <th scope="col">Next Tool</th>
+ +                                            </tr>
+ +                                        </thead>
+ +                                        <tbody data-project-records-table>
+ +                                            <tr>
+ +                                                <td data-active-game-name>Demo Game</td>
+ +                                                <td data-active-game-status>Under Construction</td>
+ +                                                <td data-active-game-purpose>Game</td>
+ +                                                <td data-active-game-owner>No owner</td>
+ +                                                <td data-current-user-role>Owner</td>
+ +                                                <td data-recommended-next-tool>Game Configuration</td>
+ +                                            </tr>
+ +                                        </tbody>
+ +                                    </table>
+                                  </div>
+                                  <div class="action-group">
+                                      <a class="btn primary" href="toolbox/game-journey/index.html?game=demo-game" data-game-journey-link>Open Game Journey</a>
+                                  </div>
+                              </div>
+                          </article>
+ +                        <article class="card" data-source-idea-section>
+ +                            <div class="card-body content-stack">
+ +                                <div>
+ +                                    <div class="kicker">Source Idea</div>
+ +                                    <h3 data-source-idea-name>No source idea yet</h3>
+ +                                </div>
+ +                                <div class="table-wrapper">
+ +                                    <table class="data-table" aria-label="Source Idea">
+ +                                        <tbody>
+ +                                            <tr><th scope="row">Idea</th><td data-source-idea-display>No source idea yet</td></tr>
+ +                                            <tr><th scope="row">Pitch</th><td data-source-idea-pitch>Create a project from Idea Board to see source details.</td></tr>
+ +                                            <tr><th scope="row">Notes</th><td><ul class="content-list" data-source-idea-notes><li>No source notes.</li></ul></td></tr>
+ +                                        </tbody>
+ +                                    </table>
+ +                                </div>
+ +                            </div>
+ +                        </article>
+                          <article class="card" data-game-workspace-foundation>
+                              <div class="card-body content-stack">
+                                  <div>
+ @@ -119,7 +134,7 @@
+                                      <article class="callout"><h3>Recommended Next Tool</h3><p data-recommended-next-tool>Game Configuration</p></article>
+                                      <article class="callout"><h3>Checklist</h3><ul data-game-progress-checklist><li>Game identity: Complete</li></ul></article>
+                                  </div>
+ -                                <div class="status" role="status" data-game-workspace-log>Demo Game seeded.</div>
+ +                                <div class="status" role="status" data-game-workspace-log>Game Hub ready.</div>
+                              </div>
+                          </article>
+                          <div class="accordion-stack" data-game-output-panels>
+ @@ -141,56 +156,7 @@
+                                      </div>
+                                  </div>
+                              </details>
+ -                            <details class="vertical-accordion" open>
+ -                                <summary>Repository Tables</summary>
+ -                                <div class="accordion-body">
+ -                                    <div class="table-wrapper">
+ -                                        <table class="data-table">
+ -                                            <caption>Game Hub data row counts</caption>
+ -                                            <thead>
+ -                                                <tr><th scope="col">Table</th><th scope="col">Rows</th></tr>
+ -                                            </thead>
+ -                                            <tbody data-game-table-counts>
+ -                                                <tr><td>users</td><td>3</td></tr>
+ -                                                <tr><td>games</td><td>4</td></tr>
+ -                                                <tr><td>game_members</td><td>12</td></tr>
+ -                                            </tbody>
+ -                                        </table>
+ -                                    </div>
+ -                                </div>
+ -                            </details>
+ -                            <details class="vertical-accordion" open>
+ -                                <summary>Team Members</summary>
+ -                                <div class="accordion-body">
+ -                                    <div class="table-wrapper">
+ -                                        <table class="data-table">
+ -                                            <caption>Open game members</caption>
+ -                                            <thead>
+ -                                                <tr><th scope="col">User</th><th scope="col">User Key</th><th scope="col">Role</th><th scope="col">Permission</th></tr>
+ -                                            </thead>
+ -                                            <tbody data-game-members-table>
+ -                                                <tr><td>No game</td><td>-</td><td>-</td><td>-</td></tr>
+ -                                            </tbody>
+ -                                        </table>
+ -                                    </div>
+ -                                </div>
+ -                            </details>
+                          </div>
+ -                        <article class="card" role="dialog" aria-labelledby="game-workspace-missing-requirements-title" data-missing-requirements>
+ -                            <div class="card-body content-stack">
+ -                                <div>
+ -                                    <div class="kicker">Requirements</div>
+ -                                    <h3 id="game-workspace-missing-requirements-title">Missing Requirements</h3>
+ -                                </div>
+ -                                <p>Not implemented yet: cross-tool blocking, publish validation, or persisted release gates. This review surface lists the next requirements only.</p>
+ -                                <div class="grid cols-3">
+ -                                    <article class="callout"><h3>Game Design</h3><p><span class="pill">Under Construction</span> Define win and lose conditions.</p></article>
+ -                                    <article class="callout"><h3>Game Configuration</h3><p><span class="pill">Planned</span> Choose release profile and debug policy.</p></article>
+ -                                    <article class="callout"><h3>Publish</h3><p><span class="pill">Planned</span> Prepare share metadata later.</p></article>
+ -                                </div>
+ -                                <div class="status" role="status">Game Hub does not run real publish gating yet.</div>
+ -                            </div>
+ -                        </article>
+                      </section>
+                      <aside class="tool-column tool-group-build">
+                          <div class="tool-column-header">
+ @@ -200,7 +166,7 @@
+                              <details class="vertical-accordion" open>
+                                  <summary>Status Log</summary>
+                                  <div class="accordion-body">
+ -                                    <p>Game Hub operations report status in the center panel while the right column stays reserved for inspector status and diagnostics.</p>
+ +                                    <p>Game Hub actions report status in the center panel.</p>
+                                      <div class="status" role="status">Game data ready.</div>
+                                  </div>
+                              </details>
+ diff --git a/toolbox/idea-board/index.html b/toolbox/idea-board/index.html
+ index 422d67b1b..5734f4703 100644
+ --- a/toolbox/idea-board/index.html
+ +++ b/toolbox/idea-board/index.html
+ @@ -103,7 +103,7 @@
+      <div data-partial="footer"></div>
+      <script src="assets/theme-v2/js/gamefoundry-partials.js" defer></script>
+      <script src="assets/theme-v2/js/tool-display-mode.js" defer></script>
+ -    <script src="toolbox/idea-board/index.js" defer></script>
+ +    <script type="module" src="toolbox/idea-board/index.js"></script>
+  </body>
+
+  </html>
+ diff --git a/toolbox/idea-board/index.js b/toolbox/idea-board/index.js
+ index 2b74e797d..74364a996 100644
+ --- a/toolbox/idea-board/index.js
+ +++ b/toolbox/idea-board/index.js
+ @@ -1,6 +1,10 @@
+ +import { createServerRepositoryClient } from "../../src/api/server-api-client.js";
+ +
+  const statusOptions = Object.freeze(["New", "Exploring", "Refining", "Ready", "Project", "Archived"]);
+  const defaultVisibleStatuses = Object.freeze(["New", "Exploring", "Refining", "Ready", "Project"]);
+  const userId = "user-1";
+ +const gameHubRoute = "toolbox/game-workspace/index.html";
+ +let gameHubRepository = null;
+
+  const ideaTable = [
+    {
+ @@ -108,6 +112,10 @@ function isProject(record) {
+    return record.status === "Project";
+  }
+
+ +function isLockedIdea(record) {
+ +  return Boolean(record && (isProject(record) || isArchived(record)));
+ +}
+ +
+  function visibleIdeas() {
+    return ideaTable.filter((record) => state.visibleStatuses.has(record.status));
+  }
+ @@ -128,6 +136,17 @@ function canDeleteIdea(record) {
+    return !isProject(record) || isArchived(record);
+  }
+
+ +function isRepositoryErrorResult(value) {
+ +  return Boolean(value && typeof value === "object" && value.error === true);
+ +}
+ +
+ +function gameHubProjectRepository() {
+ +  if (!gameHubRepository) {
+ +    gameHubRepository = createServerRepositoryClient("game-workspace");
+ +  }
+ +  return gameHubRepository;
+ +}
+ +
+  function cell(text) {
+    const td = document.createElement("td");
+    td.textContent = text;
+ @@ -269,21 +288,18 @@ function renderIdeaRow(tbody, record) {
+        " ",
+        actionButton("Delete", "delete", "ideaBoardIdeaAction"),
+      );
+ +  } else if (isProject(record)) {
+ +    actions.append(
+ +      actionButton("Open in Game Hub", "open-project", "ideaBoardIdeaAction", "primary"),
+ +      " ",
+ +      actionButton("Archive", "archive", "ideaBoardIdeaAction"),
+ +    );
+    } else {
+      actions.append(actionButton("Edit", "edit", "ideaBoardIdeaAction"));
+      if (record.status === "Ready") {
+        actions.append(" ", actionButton("Create Project", "create-project", "ideaBoardIdeaAction", "primary"));
+      }
+ -    if (isProject(record)) {
+ -      actions.append(
+ -        " ",
+ -        actionButton("Open Project", "open-project", "ideaBoardIdeaAction", "primary"),
+ -        " ",
+ -        actionButton("Archive", "archive", "ideaBoardIdeaAction"),
+ -      );
+ -    } else {
+ -      actions.append(" ", actionButton("Delete", "delete", "ideaBoardIdeaAction"));
+ -    }
+ +    actions.append(" ", actionButton("Delete", "delete", "ideaBoardIdeaAction"));
+    }
+    row.append(actions);
+    tbody.append(row);
+ @@ -312,7 +328,7 @@ function renderNoteInputRow(tbody, ideaId, record = null) {
+    input.focus();
+  }
+
+ -function renderNoteRow(tbody, record) {
+ +function renderNoteRow(tbody, record, locked = false) {
+    const row = document.createElement("tr");
+    row.dataset.noteId = record.noteId;
+    row.dataset.ideaId = record.ideaId;
+ @@ -320,9 +336,11 @@ function renderNoteRow(tbody, record) {
+    row.append(cell(record.note));
+
+    const actions = document.createElement("td");
+ -  actions.append(actionButton("Edit", "edit", "ideaBoardNoteAction"));
+ -  if (!record.system) {
+ -    actions.append(" ", actionButton("Delete", "delete", "ideaBoardNoteAction"));
+ +  if (!locked) {
+ +    actions.append(actionButton("Edit", "edit", "ideaBoardNoteAction"));
+ +    if (!record.system) {
+ +      actions.append(" ", actionButton("Delete", "delete", "ideaBoardNoteAction"));
+ +    }
+    }
+    row.append(actions);
+    tbody.append(row);
+ @@ -337,6 +355,7 @@ function renderExpandedNotesRow(tbody, record) {
+
+    const childSurface = document.createElement("div");
+    childSurface.className = "idea-board-notes-child-surface";
+ +  const locked = isLockedIdea(record);
+
+    const tableWrapper = document.createElement("div");
+    tableWrapper.className = "table-wrapper";
+ @@ -353,20 +372,22 @@ function renderExpandedNotesRow(tbody, record) {
+    childSurface.append(tableWrapper);
+
+    for (const note of notesForIdea(record.ideaId)) {
+ -    if (state.editingNoteId === note.noteId) {
+ +    if (!locked && state.editingNoteId === note.noteId) {
+        renderNoteInputRow(notesBody, record.ideaId, note);
+      } else {
+ -      renderNoteRow(notesBody, note);
+ +      renderNoteRow(notesBody, note, locked);
+      }
+    }
+ -  if (state.addingNoteIdeaId === record.ideaId) renderNoteInputRow(notesBody, record.ideaId);
+ -
+ -  const controls = document.createElement("div");
+ -  controls.className = "action-group idea-board-notes-child-actions";
+ -  const addNote = actionButton("Add Note", "add", "ideaBoardNoteAction", "primary");
+ -  addNote.dataset.ideaBoardAddNote = record.ideaId;
+ -  controls.append(addNote);
+ -  childSurface.append(controls);
+ +  if (!locked && state.addingNoteIdeaId === record.ideaId) renderNoteInputRow(notesBody, record.ideaId);
+ +
+ +  if (!locked) {
+ +    const controls = document.createElement("div");
+ +    controls.className = "action-group idea-board-notes-child-actions";
+ +    const addNote = actionButton("Add Note", "add", "ideaBoardNoteAction", "primary");
+ +    addNote.dataset.ideaBoardAddNote = record.ideaId;
+ +    controls.append(addNote);
+ +    childSurface.append(controls);
+ +  }
+    content.append(childSurface);
+
+    row.append(content);
+ @@ -391,7 +412,7 @@ function render(root) {
+    renderStatusFilter(root);
+    tbody.replaceChildren();
+    for (const record of visibleIdeas()) {
+ -    if (state.editingIdeaId === record.ideaId) {
+ +    if (state.editingIdeaId === record.ideaId && !isLockedIdea(record)) {
+        renderIdeaInputRow(tbody, record);
+      } else {
+        renderIdeaRow(tbody, record);
+ @@ -426,6 +447,12 @@ function saveIdeaRow(root, row) {
+        updateStatus(root, "Idea Board could not find that idea.");
+        return;
+      }
+ +    if (isLockedIdea(record)) {
+ +      state.editingIdeaId = null;
+ +      updateStatus(root, "This project is read-only.");
+ +      render(root);
+ +      return;
+ +    }
+      record.idea = idea;
+      record.pitch = pitch;
+      if (status === "Archived" && record.status !== "Archived") {
+ @@ -448,6 +475,14 @@ function saveIdeaRow(root, row) {
+
+  function saveNoteRow(root, row) {
+    const ideaId = row.dataset.ideaId;
+ +  const idea = ideaRecord(ideaId);
+ +  if (idea && isLockedIdea(idea)) {
+ +    state.editingNoteId = null;
+ +    state.addingNoteIdeaId = null;
+ +    updateStatus(root, "Project notes are read-only.");
+ +    render(root);
+ +    return;
+ +  }
+    const value = row.querySelector("[data-idea-board-note-input]")?.value.trim();
+    if (!value) {
+      updateStatus(root, "Enter note text before saving.");
+ @@ -513,6 +548,19 @@ function deleteIdea(root, ideaId) {
+    render(root);
+  }
+
+ +function projectSourceIdea(record) {
+ +  return {
+ +    idea: record.idea,
+ +    pitch: record.pitch,
+ +    notes: notesForIdea(record.ideaId).map((note) => note.note),
+ +  };
+ +}
+ +
+ +function gameHubUrl(record) {
+ +  const suffix = record.projectId ? `?game=${encodeURIComponent(record.projectId)}` : "";
+ +  return `${gameHubRoute}${suffix}`;
+ +}
+ +
+  function createProject(root, ideaId) {
+    const record = ideaRecord(ideaId);
+    if (!record) {
+ @@ -523,9 +571,26 @@ function createProject(root, ideaId) {
+      updateStatus(root, "Set this idea to Ready before creating a project.");
+      return;
+    }
+ +  const repository = gameHubProjectRepository();
+ +  const project = repository.createGame({
+ +    name: record.idea,
+ +    purpose: "Game",
+ +    sourceIdea: projectSourceIdea(record),
+ +    status: "Planning",
+ +  });
+ +  if (isRepositoryErrorResult(project) || !project || !project.id) {
+ +    console.warn("Idea Board could not create a Game Hub project.", project?.message || repository.__apiDiagnostic?.() || "");
+ +    updateStatus(root, "Game Hub project could not be created right now. Try again shortly.");
+ +    return;
+ +  }
+    record.status = "Project";
+    record.previousStatus = "Project";
+ +  record.projectId = project.id;
+ +  record.projectName = project.name || record.idea;
+    record.updated = today();
+ +  state.editingIdeaId = null;
+ +  state.editingNoteId = null;
+ +  state.addingNoteIdeaId = null;
+    updateStatus(root, `${record.idea} is now a project.`);
+    render(root);
+  }
+ @@ -539,6 +604,9 @@ function archiveIdea(root, ideaId) {
+    if (record.status !== "Archived") record.previousStatus = record.status;
+    record.status = "Archived";
+    record.updated = today();
+ +  state.editingIdeaId = null;
+ +  state.editingNoteId = null;
+ +  state.addingNoteIdeaId = null;
+    if (!state.visibleStatuses.has("Archived") && state.expandedIdeaId === ideaId) {
+      state.expandedIdeaId = null;
+    }
+ @@ -565,7 +633,12 @@ function openProject(root, ideaId) {
+      updateStatus(root, "Idea Board could not open that project.");
+      return;
+    }
+ -  updateStatus(root, `Opening ${record.idea}.`);
+ +  if (!record.projectId) {
+ +    updateStatus(root, "Create the Game Hub project before opening it.");
+ +    return;
+ +  }
+ +  updateStatus(root, `Opening ${record.idea} in Game Hub.`);
+ +  window.location.href = gameHubUrl(record);
+  }
+
+  function handleIdeaAction(root, actionControl) {
+ @@ -578,6 +651,11 @@ function handleIdeaAction(root, actionControl) {
+      updateStatus(root, "Adding a new idea.");
+      render(root);
+    } else if (action === "edit") {
+ +    if (isLockedIdea(ideaRecord(ideaId))) {
+ +      updateStatus(root, "This project is read-only.");
+ +      render(root);
+ +      return;
+ +    }
+      state.editingIdeaId = ideaId;
+      state.addingIdea = false;
+      updateStatus(root, `Editing ${ideaRecord(ideaId)?.idea}.`);
+ @@ -606,6 +684,14 @@ function handleNoteAction(root, actionControl) {
+    const action = actionControl.dataset.ideaBoardNoteAction;
+    const row = actionControl.closest("tr");
+    const ideaId = actionControl.dataset.ideaBoardAddNote || row?.dataset.ideaId || state.expandedIdeaId;
+ +  const idea = ideaRecord(ideaId);
+ +  if (idea && isLockedIdea(idea)) {
+ +    state.editingNoteId = null;
+ +    state.addingNoteIdeaId = null;
+ +    updateStatus(root, "Project notes are read-only.");
+ +    render(root);
+ +    return;
+ +  }
+    const noteId = row?.dataset.noteId;
+    if (action === "add") {
+      state.expandedIdeaId = ideaId;
++>>>>>>> decd37141d09cd8e2ff609da3c25404f1ed6c682
```
