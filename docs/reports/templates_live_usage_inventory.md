# templates/ Live Usage Inventory

Generated: 2026-04-12
Scope: `templates/` only (non-archive evidence for active docs; code/tests from active runtime surfaces)

## 1) Exact Files Under templates/
Observed files:
1. `templates/starter-project-template/README.md`
2. `templates/starter-project-template/config/starter.project.json`
3. `templates/vector-native-arcade/README.md`
4. `templates/vector-native-arcade/assets/palettes/vector-native-primary.palette.json`
5. `templates/vector-native-arcade/assets/parallax/template-backdrop.parallax.json`
6. `templates/vector-native-arcade/assets/parallax/template-backdrop.svg`
7. `templates/vector-native-arcade/assets/tilemaps/template-arena.tilemap.json`
8. `templates/vector-native-arcade/assets/tilemaps/template-ui.tileset.json`
9. `templates/vector-native-arcade/assets/vectors/template-hud.vector.json`
10. `templates/vector-native-arcade/assets/vectors/template-obstacle-large.vector.json`
11. `templates/vector-native-arcade/assets/vectors/template-obstacle-small.vector.json`
12. `templates/vector-native-arcade/assets/vectors/template-player.vector.json`
13. `templates/vector-native-arcade/assets/vectors/template-title.vector.json`
14. `templates/vector-native-arcade/config/template.project.json`
15. `templates/vector-native-arcade/docs/ROLLBACK_NOTES.md`
16. `templates/vector-native-arcade/docs/STARTER_GUIDE.md`
17. `templates/vector-native-arcade/runtime/bootstrap.runtime.json`

## 2) Direct imports / requires
Command pattern used:
- `^\s*import .*templates/`
- `^\s*.*require\(.*templates/`
- `^\s*export .* from .*templates/`

Result:
- No direct JS import/require/export module references to `templates/` in `tools/`, `src/`, `games/`, `samples/`, `tests/`.

Assessment:
- Consumer coupling is path-string based, not module-import based.

## 3) String Path References (Code + Tests + Runtime-Adjacent)

| Consumer File | Evidence Shape | Consumer Type | Classification | Notes |
| --- | --- | --- | --- | --- |
| `tools/shared/vectorNativeTemplate.js` | Hard-coded `templates/vector-native-arcade/...` paths for asset/config/runtime/docs references | runtime | canonical | Primary active template contract surface; high coupling to exact folder structure. |
| `tools/shared/vectorTemplateSampleGame.js` | String replace from `templates/vector-native-arcade/` -> `games/vector-arcade-sample/` | runtime | transitional | Explicit migration bridge assumption on exact prefix. |
| `tests/tools/VectorNativeTemplate.test.mjs` | Assertions against `templatePath === "templates/vector-native-arcade/"` and report text | test-only | canonical | Tests lock the current template root and report formatting. |
| `games/vector-arcade-sample/README.md` | Documentation string references source template path | docs-only (game doc) | transitional | Human-facing provenance reference to template origin. |

## 4) Docs / Planning References (Non-Archive)

Active docs with `templates/` references:
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`
- `docs/reports/repo_cleanup_targets.txt`
- `docs/reports/roadmap_status_delta.txt`
- `docs/pr/BUILD_PR_TEMPLATES_POLICY_CLASSIFICATION.md`
- `docs/pr/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE.md`
- `docs/pr/PLAN_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE.md`
- Additional active report/planning docs under `docs/dev/reports/` and `docs/pr/` that cite template cleanup constraints.

Classification:
- docs-only and planning-oriented; primarily transitional governance references.

## 5) Coupling / Path Assumptions Blocking Safe Move

Blocking assumptions identified:
1. Exact hard-coded prefix `templates/vector-native-arcade/` in runtime helper surfaces (`vectorNativeTemplate.js`, `vectorTemplateSampleGame.js`).
2. Template contract tests assert exact path strings, so directory relocation would fail tests without synchronized updates.
3. Runtime bootstrap/config/docs path strings are part of generated/report output contracts from `vectorNativeTemplate.js`.
4. Cleanup planning docs currently encode explicit deferment rules; moving now would violate active planning constraints.

## 6) Legacy/Transitional/Cleanliness Assessment
- `templates/` is not an orphaned legacy surface.
- It has live runtime + test + docs references.
- Current usage indicates **active canonical template source with transitional migration coupling**.

## 7) Inventory Conclusion
- `templates/` currently has live references and coupling that block safe move/delete in this lane.
- Any future migration must update runtime helpers, tests, and synchronized docs/contracts in one controlled PR sequence.
- No destructive action is warranted in this BUILD.
