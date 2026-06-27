# PR_26158_042 Admin Notes Menu Link Report

## Summary

Added a dev/admin-only Admin Notes link to the existing Admin menu. The link routes directly to `docs_build/dev/admin-notes/index.txt`, remains hidden from public user navigation with the Admin menu, and preserves the PR_26158_041 ownership boundary for Admin Notes files.

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation. | PASS |
| Add Admin Notes to the appropriate Admin/dev menu so notes can be opened from the UI. | `assets/theme-v2/partials/header-nav.html` adds `Notes (Dev/Admin Only)` under Admin. | PASS |
| Link only to `docs_build/dev/admin-notes/` content. | Header link and route map target `docs_build/dev/admin-notes/index.txt`. | PASS |
| Keep Admin Notes clearly marked dev/admin-only. | Menu label is `Notes (Dev/Admin Only)`. | PASS |
| Do not expose Admin Notes from public user navigation. | User-session Admin menu stays hidden; static audits outside allowed Admin menu files found no exposure. | PASS |
| Do not include Admin Notes in public-facing bundles unless existing dev/admin menu is intentionally available there. | Only the existing Admin menu partial and its shared route map were touched. No toolbox/root/account public nav link was added. | PASS |
| Preserve admin notes file ownership from PR_26158_041. | `docs_build/dev/admin-notes/README.md` documents the sole Admin menu exception; boundary test enforces ownership. | PASS |
| Do not modify `start_of_day` folders. | `git diff --name-only \| rg "(^|/)start_of_day(/|$)"` returned no matches. | PASS |
| Run changed-file syntax checks. | `node --check` on changed JS/MJS test files. | PASS |
| Run targeted menu/navigation validation. | AdminNotesBoundary node test and focused RootToolsFutureState header-order Playwright lane passed. | PASS |
| Run Playwright only if Admin menu UI behavior changes. | Focused LoginSessionMode Admin menu lane passed. | PASS |
| Verify no public user nav exposes Admin Notes. | Static audits and User-session Playwright coverage. | PASS |

## Changed Files

| File | Purpose |
| --- | --- |
| `assets/theme-v2/partials/header-nav.html` | Adds the Admin submenu link. |
| `assets/theme-v2/js/gamefoundry-partials.js` | Adds the route map entry so the link resolves correctly from nested pages. |
| `docs_build/dev/admin-notes/README.md` | Documents the allowed Admin/dev menu link exception. |
| `tests/dev-runtime/AdminNotesBoundary.test.mjs` | Updates the Admin Notes boundary test to allow only the exact Admin menu link and route map support entry. |
| `tests/playwright/tools/LoginSessionMode.spec.mjs` | Verifies the Admin session sees the dev/admin-only Notes link and public user sessions do not expose Admin navigation. |

## Validation Evidence

| Validation | Result |
| --- | --- |
| `node --check assets/theme-v2/js/gamefoundry-partials.js; node --check tests/dev-runtime/AdminNotesBoundary.test.mjs; node --check tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS |
| `node --test tests/dev-runtime/AdminNotesBoundary.test.mjs` | PASS, 3/3 |
| Public path `rg` audit over `account admin toolbox src` | PASS, no matches |
| Asset path `rg` audit excluding the exact allowed header partial and route map | PASS, no matches |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Local users unlock their allowed Account and Admin pages"` | PASS |
| `npx playwright test tests/playwright/tools/RootToolsFutureState.spec.mjs --grep "common header renders primary navigation order across active pages"` | PASS |
| `git diff --check` | PASS, line-ending warnings only |

## Notes

- A broad exploratory run of `RootToolsFutureState.spec.mjs` failed an unrelated stale tool-count assertion (`4/37` expected, `5/38` rendered). The focused header/navigation lane from that file passed and covers this PR's menu-order behavior.
- No full samples smoke was run because no sample loader/framework or game runtime path changed.
