# Cleanup Keep/Move/Future-Delete Matrix

| Target | Exists? | Live References? | Proposed Classification | Evidence Summary | Action Now | Recommended Future PR Scope |
| --- | --- | --- | --- | --- | --- | --- |
| `templates/` | yes | yes | `needs-manual-review` | Active refs in `tools/shared/vectorNativeTemplate.js`, `tools/shared/vectorTemplateSampleGame.js`, `tests/tools/VectorNativeTemplate.test.mjs`, and docs/planning surfaces. | none in this PR | Dedicated cleanup/build lane to classify keep vs migrate-later with dependency verification. |
| `tools/SpriteEditor_old_keep/` policy | yes | yes | `keep` | Legacy-hidden runtime registry entry in `tools/toolRegistry.js`; referenced in specs, roadmap, and reports. | none in this PR | Separate legacy policy PR to define exact retirement criteria and transition gates. |
| `classes_old_keep` policy target | no | yes (docs-only) | `needs-manual-review` | Path not present on disk; only planning references found in roadmap/targets/build spec docs. | none in this PR | Clarify whether this is a historical placeholder, rename candidate, or retired concept before any cleanup execution. |
| `docs/archive/` archived-notes policy | yes | yes | `keep` | Archive destination is actively documented across docs structure/readme/paths files; policy item still planned in roadmap. | none in this PR | Policy-definition PR to formalize retention + move criteria for archived notes. |
| Legacy path imports (`/engine/`, `../engine/`, `./engine/`) | pattern check | no (active code) | `future-delete-candidate` | No matches for inspected old-engine import patterns in tools/src/games/samples. | none in this PR | Add guard/reporting checks in future cleanup PR to prevent regressions and retire stale legacy-import guidance. |
| Eventual legacy-retirement candidates list | yes | yes (planning) | `migrate-later` | Explicitly tracked in roadmap + cleanup target docs and referenced by this BUILD spec. | none in this PR | Convert candidates into exact, dependency-ordered cleanup BUILDs after reference-safe verification. |

## Notes
- This matrix is decision-prep only.
- No deletion, move, rename, or migration is executed in this PR.
- `templates/` remains explicitly deferred.
