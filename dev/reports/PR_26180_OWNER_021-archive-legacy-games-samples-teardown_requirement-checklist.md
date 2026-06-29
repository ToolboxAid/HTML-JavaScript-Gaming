# PR_26180_OWNER_021-archive-legacy-games-samples-teardown Requirement Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Base from PR020 | PASS | Branch created from `PR_26180_OWNER_020-src-legacy-teardown`. |
| Delete archived `old_games/**` if only archive/legacy | PASS | No exact tracked `old_games` path exists. Active archive games were preserved due current references. |
| Delete archived `old_samples/**` if only archive/legacy | PASS WITH PRESERVATION | Only exact `old_samples` file is under `SpriteEditor_old_keep`, which has active keep-policy governance references. Old Parallax sample archive was deleted. |
| Delete/archive old manifest-era code | PASS | Removed inactive `www/src/tools/common` manifest-era helpers. |
| Remove references to non-existent `games/**` | PASS | No deleted active game path references introduced; active archive-game references remain intentionally preserved. |
| Remove references to `samples/**` unless active use is proven | PASS | Active sample references remain only where current validation/dev tools prove use. |
| Audit `www/src/tools/**` | PASS | Deleted inactive `www/src/tools/common`; `www/src/tools` no longer exists in working tree. |
| Audit old Object Vector files | PASS | Deleted archived `old_object-vector-studio-v2`; current Object Vector runtime/schema/test paths remain. |
| Preserve active `www/`, `api/`, `dev/tests`, Project Instructions behavior | PASS | No active references remain to deleted PR021 paths. |
| Do not touch `dev/workspace/generated/tool-images/**` | PASS | Protected generated tool-image workspace untouched. |
| Hard stop before deleting files used by active runtime/API/validation/tests | PASS | Active-reference scan passed before deletion scope was finalized. |
| Required reports under `dev/reports/` | PASS | PR-specific report, checklist, validation report, manual notes, branch validation, diff, and changed-file report generated. |
| Required ZIP under `dev/workspace/zips/` | PASS | Repo-structured delta ZIP generated. |
