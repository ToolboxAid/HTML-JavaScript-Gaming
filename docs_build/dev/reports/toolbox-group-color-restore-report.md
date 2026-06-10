# PR_26160_062 Toolbox Group Color Restore

## Branch Validation

| Check | Expected | Actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| Current git branch | main | main | PASS | `git branch --show-current` |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Restore `toolbox/index.html` group values to match Admin Tool Votes. | PASS | Playwright reads Admin Tool Votes rows from `admin/tool-votes.html`, then verifies every visible Toolbox card group label matches the Admin assignment. |
| Use `admin/tool-votes.html` as source for current correct assignment. | PASS | Targeted Playwright extracts `Tool -> Group` from `[data-toolbox-votes-tool-id]` rows and compares it with `[data-toolbox-tool-card]` group labels. |
| Restore Toolbox group colors to pre-voting/filter values. | PASS | Superseded by PR_26160_082: `assets/theme-v2/css/colors.css` now routes Build/Create through `--toolbox-group-build-color: var(--red)`. |
| Recover prior group color values from git history. | PASS | Source: `git show a3bc4016e:toolbox/tools-page-accordions.js` and `git show a3bc4016e:assets/theme-v2/css/colors.css`; `a3bc4016e` is the pre-PR_26160_055 recovery point. |
| Keep group as metadata, not status. | PASS | Group mapping remains separate from `stateSwatchMap` and release channel/status code. |
| Do not change tool status values or vote behavior. | PASS | No registry status/release/vote logic was changed. |
| Do not add new features or expand scope. | PASS | Changes are limited to group color classes/tokens, group swatch class mapping, readability preservation, and targeted validation. |
| Do not use inline script/style/event handlers. | PASS | `rg --pcre2` found no inline script/style/event handler matches in `toolbox/index.html` or `admin/tool-votes.html`. |

## Restored Group Color Source

Recovered from git history at `a3bc4016e` (`PR_26159_054-toolbox-status-and-display-cleanup`), before today’s Toolbox voting/filter changes:

| Group | Restored Color Source | Rendered Color |
| --- | --- | --- |
| AI | `swatch-purple` / `var(--purple)` | `rgb(184, 119, 255)` |
| Audio | `swatch-orange` / `var(--orange)` | `rgb(255, 122, 0)` |
| Build/Create | `--toolbox-group-build-color: var(--red)` | `rgb(255, 45, 45)` |
| Design | `swatch-pink` / `var(--pink)` | `rgb(255, 79, 139)` |
| Marketplace | `swatch-gold` / `var(--gold)` | `rgb(255, 200, 87)` |
| Platform | `swatch-blue` / `var(--electric-blue)` | `rgb(77, 163, 255)` |
| Play | `swatch-green` / `var(--green)` | `rgb(125, 217, 87)` |

Note: PR_26160_082 supersedes the prior recovered literal and keeps Build/Create on the Theme V2 SSoT path: `--toolbox-group-build-color: var(--red)`.

## Validation

| Lane | Command | Status |
| --- | --- | --- |
| Branch guard | `git branch --show-current` | PASS |
| Changed-file syntax | `node --check toolbox/tools-page-accordions.js`; `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS |
| Inline handler/style/script audit | `rg --pcre2 "onclick=|onchange=|oninput=|style=|<script(?![^>]+src=)|<style[\s>]" toolbox/index.html admin/tool-votes.html` | PASS |
| Group color token audit | `Select-String -Path assets/theme-v2/css/colors.css -Pattern '--toolbox-group-build-color|--red:'` | PASS |
| Targeted Toolbox/Admin group Playwright | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "toolbox group labels match"` | PASS |
| Static diff check | `git diff --check` | PASS with CRLF normalization warnings only |

## Impacted Lane

Targeted Toolbox/Admin group display validation was impacted and run.

## Skipped Lanes

Full samples validation was skipped because this PR only changes Toolbox group display colors and targeted Toolbox/Admin validation. No sample loader/framework code changed.

## Manual Test Notes

- Admin Tool Votes remains the source for `Tool -> Group` assignment.
- Toolbox cards show the same group names as Admin Tool Votes.
- Build/Create group badges render through `--toolbox-group-build-color: var(--red)`.
- Marketplace and Play group badges keep the previous readable dark text behavior.

## Artifact

- Repo-structured delta ZIP: `tmp/PR_26160_062-toolbox-group-color-restore_delta.zip`
