# PR_26172_CHARLIE_007 Shared JS Candidate Audit

## Purpose

Identify duplicated browser helper logic that should be considered for future extraction to:

`assets/js/shared/`

This PR is audit-only. No implementation was moved.

## Scope Reviewed

| Area | Status | Notes |
| --- | --- | --- |
| `assets/` | PASS | Reviewed Theme V2 page scripts, toolbox asset scripts, and shared UI patterns. |
| `toolbox/` | PASS | Reviewed active tool page scripts and tool API client wrappers. |
| `src/engine/` | PASS | Reviewed engine UI, debug, runtime, rendering, and validation helper patterns for overlap with browser UI code. |

## Candidate Summary

| Priority | Candidate | Proposed Shared Location | Source Files | Recommendation |
| --- | --- | --- | --- | --- |
| P1 | DOM text and element helpers | `assets/js/shared/dom.js` | `toolbox/game-design/game-design.js`, `toolbox/game-configuration/game-configuration.js`, `assets/theme-v2/js/account-page-data.js`, `assets/theme-v2/js/admin-service-page-data.js`, `assets/theme-v2/js/admin-setup-actions.js`, `assets/theme-v2/js/admin-system-health.js` | Extract small browser-safe helpers such as `setText`, `textOrFallback`, `appendCell`, and common selector helpers after one tool/page migration proves import paths. |
| P1 | Table rendering helpers | `assets/js/shared/table-rendering.js` | `assets/theme-v2/js/account-page-data.js`, `assets/theme-v2/js/admin-service-page-data.js`, `assets/theme-v2/js/admin-setup-actions.js`, `assets/theme-v2/js/admin-system-health.js`, `toolbox/game-design/game-design.js`, `toolbox/messages/messages.js`, `toolbox/objects/objects.js` | Create a configurable `renderDataTable` helper for caption, headers, rows, dataset name, empty-state row, and cell text normalization. |
| P1 | Validation overlay rendering | `assets/js/shared/validation-overlay.js` | `toolbox/game-design/game-design.js`, `toolbox/game-configuration/game-configuration.js`, `toolbox/objects/objects.js`, `toolbox/colors/colors.js`, `toolbox/assets/assets.js` | Extract shared render behavior for `validation.findings`, hidden overlay state, and status list item text. Keep tool-specific labels and data attributes local. |
| P2 | Status text and badge helpers | `assets/js/shared/status.js` | `assets/theme-v2/js/admin-system-health.js`, `assets/theme-v2/js/admin-operations.js`, `assets/theme-v2/js/admin-invitations.js`, `assets/theme-v2/js/account-ai-credits.js`, `assets/theme-v2/js/admin-setup-actions.js`, `assets/theme-v2/js/admin-db-status-panel.js` | Normalize `PASS/WARN/FAIL/PENDING/INFO/SKIP` formatting, title/aria reason text, and status element updates without changing service semantics. |
| P2 | Callout/follow-up card helpers | `assets/js/shared/callouts.js` | `assets/theme-v2/js/account-page-data.js`, `assets/theme-v2/js/admin-service-page-data.js` | Extract common callout creation for title, status/reason, and next action. |
| P2 | API client wrapper conventions | `assets/js/shared/api-client-adapters.js` | `toolbox/objects/objects-api-client.js`, `toolbox/colors/palette-api-client.js`, `toolbox/game-design/game-design-api-client.js`, `toolbox/game-configuration/game-configuration-api-client.js`, `toolbox/game-hub/game-hub-api-client.js`, `toolbox/game-journey/game-journey-api-client.js`, `toolbox/tags/tags-api-client.js`, `toolbox/messages/messages-api-client.js` | Do not duplicate `src/api/server-api-client.js`; instead add browser-facing adapter helpers only if future migrations need common constant freezing or repository factory naming. |
| P3 | Dialog and overlay helpers | `assets/js/shared/dialogs.js` | `assets/theme-v2/js/image-zoom-dialog.js`, `src/engine/ui/CanvasDialogPrimitives.js`, `toolbox/colors/colors.js`, `toolbox/assets/assets.js`, `toolbox/game-design/game-design.js`, `toolbox/game-configuration/game-configuration.js` | Keep canvas-specific primitives in `src/engine/ui/`. Consider shared DOM dialog/overlay open-close helpers separately for Theme V2/tool pages. |
| P3 | Form select/list helpers | `assets/js/shared/forms.js` | `toolbox/game-design/game-design.js`, `toolbox/messages/messages.js`, `toolbox/objects/objects.js`, `assets/theme-v2/js/admin-operations.js` | Extract later if repeated option/list generation remains after table and validation helpers are settled. |
| P3 | Runtime validation predicates | No browser shared move yet | `src/engine/debug/Validation.js`, `src/engine/runtime/engineV2DialogueSystem.js`, `src/engine/runtime/engineV2StatusEffectSystem.js`, `src/engine/object-model/objectDefinitionValidator.js` | Engine validators are domain/runtime logic, not immediate `assets/js/shared/` candidates. Keep under `src/engine/` unless a future UI-only wrapper is needed. |

## Category Findings

### API Helpers

Status: CANDIDATE.

Tool API clients already share core behavior through `src/api/server-api-client.js`. Remaining duplicated logic is mostly thin adapter code around:

- `readServerToolConstants`
- `requireServerConstant`
- `createServerRepositoryClient`
- optional freezing of returned constants
- tool-specific repository factory naming

Recommended path:

- Keep server contract logic in `src/api/`.
- Add `assets/js/shared/api-client-adapters.js` only if browser scripts need common adapter helpers during a future migration.

### DOM Helpers

Status: STRONG CANDIDATE.

Repeated helpers include:

- `setText(element, value)`
- `text(value)` or `asText(value, fallback)`
- `clearContent(root)`
- `appendCell(row, text)`
- common `querySelector`/root mapping patterns

Recommended path:

- Start with `assets/js/shared/dom.js`.
- Migrate one low-risk Theme V2 page and one low-risk toolbox script before broader rollout.

### Table Helpers

Status: STRONG CANDIDATE.

Multiple files build tables by hand with the same structure:

- wrapper
- `table.data-table`
- caption
- `thead`
- header row
- body rows
- fallback text normalization

Recommended path:

- Create `assets/js/shared/table-rendering.js`.
- Keep data ownership, row mapping, and service calls local.

### Status Helpers

Status: CANDIDATE.

Theme V2 scripts repeatedly set status strings and sometimes attach accessibility details for non-PASS states.

Recommended path:

- Create `assets/js/shared/status.js`.
- Support status normalization, `title`, `aria-label`, and `textContent`.
- Do not change status semantics in the extraction PR.

### Dialog Helpers

Status: CANDIDATE WITH SPLIT OWNERSHIP.

DOM dialogs and overlays exist in Theme V2/tool scripts, while canvas dialog primitives belong to engine UI.

Recommended path:

- Use `assets/js/shared/dialogs.js` only for DOM dialog helpers.
- Leave `src/engine/ui/CanvasDialogPrimitives.js` in engine ownership.

### Validation Helpers

Status: STRONG CANDIDATE FOR UI VALIDATION OVERLAYS.

Tool scripts repeatedly render `validation.findings` into a list and hide/show overlays.

Recommended path:

- Create `assets/js/shared/validation-overlay.js`.
- Keep tool-specific validation rules and repository calls local.
- Do not move engine domain validators into browser shared assets.

## Prioritized Follow-Up PRs

1. `PR_26172_CHARLIE_shared-dom-table-foundation`
   - Add `assets/js/shared/dom.js` and `assets/js/shared/table-rendering.js`.
   - Migrate one Theme V2 page and one low-risk toolbox script.

2. `PR_26172_CHARLIE_validation-overlay-shared-helper`
   - Add `assets/js/shared/validation-overlay.js`.
   - Migrate `game-design` and `game-configuration` validation overlay rendering first.

3. `PR_26172_CHARLIE_status-helper-foundation`
   - Add `assets/js/shared/status.js`.
   - Migrate Admin System Health or Admin Setup status rendering only after status accessibility semantics are preserved.

4. `PR_26172_CHARLIE_dom-dialog-helper-audit`
   - Audit DOM dialog/overlay behavior separately from engine canvas dialog primitives.

## Validation

| Validation | Status | Result |
| --- | --- | --- |
| Candidate list includes source files | PASS | Each candidate row includes source file examples. |
| Candidate list includes proposed shared location | PASS | Each extractable candidate includes an `assets/js/shared/` path. |
| No runtime source changed | PASS | This PR adds report artifacts only. |
| No implementation moved | PASS | No source extraction was performed. |

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch | PASS | `PR_26172_CHARLIE_repository-compliance-stack`. |
| Worktree clean before PR_007 edits | PASS | `git status --short` produced no output before report creation. |
| Local/origin sync before PR_007 edits | PASS | `0 0`. |
| Main merge avoided | PASS | No merge to `main` was performed. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Review `assets/` | PASS | Theme V2 scripts and Idea Board canonical asset path reviewed. |
| Review `toolbox/` | PASS | Active tool scripts and API clients reviewed. |
| Review `src/engine/` | PASS | Engine UI/debug/runtime helper patterns reviewed. |
| Identify API helpers | PASS | Tool API client adapters listed. |
| Identify DOM helpers | PASS | Text, selector, cell, and content helpers listed. |
| Identify table helpers | PASS | Repeated table rendering listed. |
| Identify status helpers | PASS | Theme V2 status update patterns listed. |
| Identify dialog helpers | PASS | DOM dialog and canvas dialog ownership split documented. |
| Identify validation helpers | PASS | Validation overlay rendering listed. |
| Do not move implementation | PASS | Audit-only report. |
| ZIP artifact exists | PASS | `tmp/PR_26172_CHARLIE_007-shared-js-candidate-audit_delta.zip` generated. |

## Manual Validation Notes

- The highest-value extraction candidates are DOM text helpers, table rendering, and validation overlay rendering.
- API helper extraction should be cautious because existing tool clients already depend on `src/api/server-api-client.js`.
- Canvas dialog primitives should remain in `src/engine/ui/`; only DOM dialog behavior should be considered for `assets/js/shared/`.
- No runtime or executable source files were modified by this PR.
