# PR_26160_063-toolbox-user-voting-and-admin-width

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`
- Branch validation: PASS

## Summary

- Toolbox vote buttons now remain visible with counts for guests, but guest sessions cannot vote.
- Authenticated selected votes now receive the same `primary` selected button treatment used by other Toolbox controls.
- Admin Tool Votes now receives `Total Votes`, `Up %`, and `Down %` from the server-backed vote snapshot.
- Admin Tool Votes now has an expand/collapse width control that collapses the side menu and gives the table more horizontal room.
- Tool group assignments, tool order rules, and tool status rules were not changed.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Limit Toolbox voting to authenticated users only | PASS | `toolbox/tools-page-accordions.js` disables vote buttons when `session.authenticated`/`session.userKey` is absent; `src/dev-runtime/server/mock-api-router.mjs` still rejects unauthenticated vote writes. |
| Guests may view Up/Down vote counts but not vote | PASS | Vote controls still render `Up n` and `Down n`; guest buttons are disabled and covered by Playwright guest assertions in `tests/playwright/tools/ToolboxRoutePages.spec.mjs`. |
| Show visible login/sign-in required state for guests | PASS | `data-toolbox-vote-login-required` displays `Login required to vote.` for guest sessions. |
| Keep Up/Down buttons with vote counts | PASS | Existing button rendering is preserved; only disabled state and message were added. |
| Visually identify current user's selected vote with selected Toolbox treatment | PASS | Selected vote buttons toggle `primary` and `aria-pressed`; Playwright validates `primary` on selected Up/Down states. |
| Preserve one-vote-per-user-per-tool behavior | PASS | Existing server row update by `(toolId, userKey)` remains unchanged; Playwright verifies User 1 and User 2 vote counts and switching behavior. |
| Add Total Votes, Up %, Down % columns to Admin > Tool Votes | PASS | `admin/tool-votes.html`, `admin/tool-votes.js`, and server snapshot fields `totalVotes`, `upPercent`, `downPercent` added; Playwright validates values. |
| Add horizontal accordion/equivalent expand/collapse control for more table visibility | PASS | `data-toolbox-votes-width-toggle` toggles `data-toolbox-votes-expanded` on the account panel and collapses the side menu; Playwright validates expanded/collapsed behavior. |
| Do not change tool group assignments, order rules, or status rules | PASS | No registry/status/order assignment files were changed; only vote rendering/snapshot fields and admin table display changed. |
| Do not use inline script/style/event handlers | PASS | Static `rg` checks found no runtime/page inline handlers/styles; only existing Playwright source assertions matched. |

## Validation

- PASS: `node --check admin/tool-votes.js`
- PASS: `node --check toolbox/tools-page-accordions.js`
- PASS: `node --check src/dev-runtime/server/mock-api-router.mjs`
- PASS: `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- PASS: `git diff --check` (line-ending warnings only, no whitespace errors)
- PASS: Runtime/page inline check: no inline handlers/styles/scripts in changed active runtime/page files.
- PASS: `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright` (8 passed)
- SKIPPED/invalid command: `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=chromium`; repo config exposes `ui` and `playwright`, not `chromium`.

## Impacted Lane

- Targeted Toolbox/Admin Tool Votes Playwright lane.

## Skipped Lanes

- Full samples validation: skipped because this PR only changes Toolbox vote controls, Admin Tool Votes table display, and server vote snapshot fields.
- Full repo smoke: skipped per request to run targeted Toolbox/Admin Tool Votes validation only.

## Manual Test Notes

- Guest `Build Game` vote buttons show counts, are disabled, and show `Login required to vote.`
- Authenticated Up/Down selection shows `primary` selected styling and persisted vote counts.
- Admin Tool Votes shows new `Total Votes`, `Up %`, and `Down %` columns.
- Admin Tool Votes width toggle expands the table area by collapsing the Admin side menu, then restores it.
