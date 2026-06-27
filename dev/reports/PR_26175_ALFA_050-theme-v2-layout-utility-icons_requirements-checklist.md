# PR_26175_ALFA_050 Requirements Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Use shared icons for fullscreen enter/exit controls. | PASS | `tool-display-mode.js` adds fullscreen and exit-fullscreen registry icons; status-bar Playwright asserts both files. |
| Use shared icons for previous/next navigation. | PASS | Tool display navigation prepends shared chevron-left/chevron-right icons; Playwright asserts both files. |
| Use shared icons for column collapse/expand controls. | PASS | Horizontal accordion toggles render shared chevron icons through the Theme V2 helper path. |
| Use shared icons for return-to-top controls. | PASS | Shared partials replace return-to-top content with the registry chevron-up icon; route Playwright asserts it. |
| Preserve accessible names, roles, and keyboard behavior. | PASS | Existing button/link labels and aria attributes are retained while icons are `aria-hidden`. |
| Preserve fullscreen bottom status bar anchoring and content reserve. | PASS | Selected-game status bar Playwright suite passed. |
| Keep utility controls compact and stable. | PASS | Shared `.layout-icon` sizing and navigation-link styles were added without layout refactors. |
| Avoid page-local utility icon markup when shared helpers can own it. | PASS | Shared partial/helper paths own return-to-top and horizontal toggle icon replacement. |
| No inline styles, style blocks, or page-local CSS introduced. | PASS | Targeted `rg` scan returned no matches. |
| No unrelated page/tool redesign. | PASS | Changes are limited to layout utility icon rendering, compact CSS, tests, and reports. |
| No engine core or `start_of_day` changes. | PASS | No engine or `start_of_day` files changed. |
