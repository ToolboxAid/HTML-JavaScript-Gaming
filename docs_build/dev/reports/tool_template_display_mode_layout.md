# PR_26152_275 Tool Template Display Mode Layout

## Scope

- Updated `retired Theme V2 tool template`.
- Kept `_page_template_v2.html` unchanged.
- Did not rebuild Storage Inspector.
- Did not touch samples.
- Did not add CSS, copied CSS, inline style, inline script, or inline event handlers.

## Layout Contract

| Region | Contract | Result |
| --- | --- | --- |
| Left column | Persistent selection, input, and configuration | PASS - left column is explicitly labeled and uses persistent Theme V2 `surface`, `field-group`, and `feedback` patterns. |
| Center column | Includes the `toolDisplayMode` host | PASS - center `tool-center-panel` includes the existing `data-tool-display-mode` host and loads the external `tool-display-mode.js` script. |
| Right column | Persistent output, status, diagnostics, and details | PASS - right column is explicitly labeled and uses persistent Theme V2 `surface`, `feedback`, and `event-log` patterns. |
| Left/right accordions | No accordions in either side column | PASS - left and right side-column accordions were removed. |

## Theme V2 Usage

- Existing Theme V2 classes used: `grid`, `cols-3`, `tool-workspace`, `tool-column`, `tool-center-panel`, `surface`, `surface-header`, `surface-body`, `field-group`, `field-hint`, `feedback`, `feedback-title`, `feedback-message`, `event-log`, `event-log-entry`, `table-wrapper`, and `data-table`.
- The template keeps the `tool-workspace` hook while adding existing Theme V2 `grid cols-3` layout classes so the left, center, and right regions render side by side without new CSS.
- No Theme V2 CSS files were changed.
- No page-local or tool-local CSS was added.

## Validation

- `git diff --check` - PASS
- Template marker scan for explicit left, center, right column labels - PASS
- Template marker scan for `data-tool-display-mode` and external `tool-display-mode.js` wiring - PASS
- Template guard scan for left/right accordion markers - PASS
- Template guard scan for inline style, inline script blocks, and inline event handlers - PASS

## Lanes

- Executed: template/static validation because only the shared Theme V2 tool template changed.
- Skipped: runtime, engine, samples, recovery/UAT, and tool rebuild lanes because no runtime page, engine surface, sample, or tool implementation changed.
- Samples decision: SKIP - samples are out of scope.
- Playwright impacted: No - this PR updates an inactive template contract only and does not rebuild or change a runtime tool page.
