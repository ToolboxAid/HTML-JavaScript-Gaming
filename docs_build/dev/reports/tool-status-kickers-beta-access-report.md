# PR_26159_053 Tool Status Kickers Beta Access

## Executive Summary

Status kickers are now registry-driven on the Toolbox index. Existing internal `status` metadata is preserved for compatibility, while user-facing tiles derive `releaseChannel`, `releaseChannelLabel`, and exact hover/help text. AI Assistant is the first beta-restricted tool through `requiredRole: "beta"`, with User 2 seeded as the local beta tester.

Playwright impacted: Yes.

## Branch Guard

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch is main | PASS | `git branch --show-current` returned `main`. |
| Local branch list checked | PASS | `git branch --list` returned `* main`. |
| Worktree inspected before edits | PASS | Initial `git status --short --untracked-files=all` was clean. |

## Old Status/Beta Cleanup

| Area | Result |
| --- | --- |
| Old code found | Existing active Toolbox code used `TOOL_STATUS_MODEL` and visible tile labels `Ready`, `Wireframe`, `Planned`, `Hidden`; `tools-page-accordions.js` filtered creator tiles with `tool.status === "Ready"`. |
| Files cleaned | `toolbox/tools-page-accordions.js` now derives display/status filtering from release channels; the old visible `Ready` pill text is replaced by `Complete`. |
| No obsolete beta route found | No active `{tool}-beta` routes, beta-only pages, beta-only launch code, or voting code existed before this PR. |
| Intentionally preserved | `TOOL_STATUS_MODEL`, `status`, readiness metadata, Build Path status logic, `adminOnly`, `hidden`, and existing stable tool routes are preserved for compatibility. |
| Why preserved | Other admin/progress/build-path tooling still consumes legacy registry status fields; release channels are added as the clean user-facing access layer. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read project instructions first | PASS | `docs_build/dev/PROJECT_INSTRUCTIONS.md` read before edits. |
| Hard stop unless on main | PASS | Branch guard passed on `main`. |
| Remove/report obsolete status/beta/vote/filter code | PASS | Cleanup section above; no stale beta/vote implementation found. |
| Toolbox tiles show Planned/Wireframe/Beta/Complete kickers | PASS | `toolbox/toolRegistry.js` derives release channel labels; `toolbox/tools-page-accordions.js` renders `data-toolbox-kicker`. |
| Kicker hover/help text matches requested wording | PASS | Help text constants in `toolbox/toolRegistry.js` and Playwright title assertions in `ToolboxRoutePages.spec.mjs`. |
| Status count/filter controls side by side | PASS | `toolbox/index.html` adds `data-toolbox-status-filters`; Playwright verifies same-row button positions. |
| Default filters Complete, Beta, Wireframe | PASS | `visibleReleaseChannels` defaults to `complete`, `beta`, `wireframe`; Playwright checks `aria-pressed`. |
| Planned visible only when selected | PASS | Planned filter defaults false; Admin Build Game appears only after toggling Planned. |
| No `{tool}-beta` files/routes | PASS | Static `rg --files` check found no `-beta` route/file; stable hrefs asserted. |
| Registry-driven beta access | PASS | AI Assistant has `releaseChannel: "beta"` and `requiredRole: "beta"` in `toolbox/toolRegistry.js`. |
| Non-beta beta launch blocked | PASS | User 1 click shows `This tool is in beta. Request beta access to try it.` |
| Beta role launches beta tool | PASS | User 2 has seeded `beta` role and launches `/toolbox/ai-assistant/index.html`. |
| Admin launches beta tool | PASS | DavidQ/admin launches `/toolbox/ai-assistant/index.html`. |
| Complete tools launch normally | PASS | Existing stable Complete tool URLs remain unchanged; Colors remains `/toolbox/colors/index.html`. |
| Wireframe tools open preview pages | PASS | Wireframe action links are not blocked and are labeled `Open Preview`. |
| Planned tools show details/vote/feedback instead of runtime launch | PASS | Planned click stays on Toolbox and updates planned status; planned card includes non-persistent feedback controls. |
| Planned/Wireframe voting controls render only there | PASS | Playwright verifies Build Game and Fonts vote controls; renderer returns no controls for Beta/Complete. |
| No hidden vote persistence invented | PASS | Vote handlers update only the page status message. |
| No inline script/style/event handlers | PASS | Toolbox source checked in Playwright; no inline script/style/onclick added. |
| No console errors | PASS | Toolbox Playwright lane captured no repo-owned console errors. |

## Validation Evidence

| Lane | Status | Evidence |
| --- | --- | --- |
| Changed-file syntax | PASS | `node --check toolbox/tools-page-accordions.js`, `toolbox/toolRegistry.js`, `src/dev-runtime/persistence/mock-db-store.js`, and `tests/playwright/tools/ToolboxRoutePages.spec.mjs`. |
| Toolbox page/runtime Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --reporter=line` passed 3/3. |
| Registry validation | PASS | `node scripts/validate-tool-registry.mjs` returned `TOOL_REGISTRY_VALID`. |
| Diff whitespace | PASS | `git diff --check` passed; only existing LF/CRLF warnings were reported. |
| `{tool}-beta` static audit | PASS | `rg --files | rg "(^|/|\\\\)[^/\\\\]+-beta(\\.|/|\\\\)|beta-only|tool-vote|vote-tool"` returned no matches. |

## Skipped Lanes

| Lane | Why Safe to Skip |
| --- | --- |
| Full samples validation | PR touches Toolbox registry/index behavior and local seed roles only; no sample loader/runtime framework changed. |
| Full Playwright suite | Targeted Toolbox route/status/access lane covered the affected surface; full suite is outside this PR scope. |

## Notes

- Planned tools are intentionally not launched from Toolbox tiles, including for admin, because this PR explicitly says planned tools should show planned details/vote/feedback instead of launching unfinished runtime.
- A pre-existing/generated `docs_build/dev/reports/tool_registry_validation.txt` was updated by the registry validation lane.
- An unrelated untracked file, `docs_build/dev/admin-notes/engine/game setup.txt`, is present in the worktree and was not modified or packaged.
