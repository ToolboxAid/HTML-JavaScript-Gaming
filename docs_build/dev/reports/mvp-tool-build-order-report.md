# PR_26160_087 MVP Tool Build Order Report

## Branch Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | `git branch --show-current` returned `main` before changes. |

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Update DB-backed tool order for the paddle + ball MVP path | PASS WITH BLOCKER | Existing DB-backed MVP rows were reordered in `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`. `Vector Asset Studio` is not present in the current 43-tool inventory or `toolbox/` routes, so no DB-backed row was invented. |
| Move Project Journey after Game Testing for MVP 2 guidance | PASS | `Project Journey` now sorts after `Game Testing` and `Publish` in the compact existing MVP order. |
| Include Publish in the MVP path | PASS | `Publish` is now in the existing MVP order before `Project Journey`. |
| Move Particles group from Audio to Design | PASS | `Particles` now uses `category: "Design"`, `colorGroup: "tool-group-design"`, and `toolboxGroup: "Content"`. |
| Preserve MIDI and Music as separate tools | PASS | `MIDI` and `Music` remain separate rows with Audio grouping. |
| Ensure every MVP-path tool is beta or complete only when functionally usable | PASS WITH BLOCKERS | Existing functional tools remain `beta` or `complete`. Planned/wireframe/static tools were not falsely promoted; blockers are listed below. |
| Keep order/group/status changes DB-backed | PASS | Changes are limited to DB-backed seed metadata and tests. Toolbox/Admin pages still consume API/service-backed metadata. |
| Do not hardcode order/group/status in pages | PASS | No active page order/group/status hardcoding was added. |
| Do not use inline script/style/event handlers | PASS | No HTML/runtime inline handlers or styles were added. |

## MVP Path Readiness

| Requested Order | Tool | Current DB Status | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Project Workspace | beta | PASS | Functionally usable current project workspace surface. |
| 2 | Game Design | beta | PASS | Functionally usable current design repository/tool surface. |
| 3 | Colors | complete | PASS | Complete Colors tool remains complete. |
| 4 | Assets | beta | PASS | Functionally usable current asset repository/tool surface. |
| 5 | Vector Asset Studio | missing | BLOCKER | No DB-backed tool metadata row and no `toolbox/vector-asset-studio/` page exists. Not invented in this PR. |
| 6 | Game Configuration | beta | PASS | Functionally usable current configuration surface. |
| 7 | Objects | planned | BLOCKER | Existing page is a static/wireframe planning surface, not functionally usable for the MVP. |
| 8 | Controls | planned | BLOCKER | Existing page is a static/wireframe planning surface, not functionally usable for the MVP. |
| 9 | Hitboxes | planned | BLOCKER | Existing page is a static/wireframe planning surface, not functionally usable for the MVP. |
| 10 | Events | planned | BLOCKER | Existing page is a static/wireframe planning surface, not functionally usable for the MVP. |
| 11 | Saved Data | wireframe | BLOCKER | Existing page is wireframe-only and not functionally usable for the MVP. |
| 12 | Debug | planned | BLOCKER | Existing page is a static/wireframe planning surface, not functionally usable for the MVP. |
| 13 | Game Testing | planned | BLOCKER | Existing page is a static/wireframe planning surface, not functionally usable for the MVP. |
| 14 | Publish | planned | BLOCKER | Existing publish page is planned/static and not functionally usable for deploy/publish. |
| 15 | Project Journey | beta | PASS | Beta guidance tool moved after Game Testing/Publish in the compact DB-backed order. |

## Effective Existing DB-Backed MVP Order

Because `Vector Asset Studio` has no current DB-backed row, the existing rows now sort as:

1. Project Workspace
2. Game Design
3. Colors
4. Assets
5. Game Configuration
6. Objects
7. Controls
8. Hitboxes
9. Events
10. Saved Data
11. Debug
12. Game Testing
13. Publish
14. Project Journey

## Validation

| Lane | Result | Notes |
| --- | --- | --- |
| Branch guard | PASS | Current branch was `main`. |
| Metadata contract probe | PASS | Node probe verified compact MVP order, missing `Vector Asset Studio`, `Particles` Design grouping, and separate MIDI/Music rows. |
| Changed-file syntax | PASS | `node --check` passed for changed JS/test files. |
| Diff hygiene | PASS | `git diff --check` completed with line-ending normalization warnings only. |
| Toolbox/Admin metadata SSoT Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs --reporter=line` passed 4/4. |
| Toolbox Build Path Playwright | PASS | `npx playwright test tests/playwright/tools/BuildPathProgressSimplification.spec.mjs --reporter=line` passed 4/4. |
| Toolbox route/status Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --reporter=line` passed 8/8. |

## Impacted Lanes

- Impacted lane: Toolbox/Admin Tool Votes DB-backed metadata and Build Path ordering.
- Playwright impacted: Yes.
- Samples skipped: Safe to skip because no sample JSON, game runtime, or sample loader/framework changed.
- Full samples validation: Not run per request.

## Manual Test Notes

- Open `/toolbox/index.html`, switch to Build Path, and confirm the beta/complete rows sort Project Workspace, Game Design, Colors, Assets, Game Configuration, Project Journey.
- In Admin > Tool Votes, confirm order values are whole numbers and Particles appears as Design while MIDI and Music remain separate Audio tools.
