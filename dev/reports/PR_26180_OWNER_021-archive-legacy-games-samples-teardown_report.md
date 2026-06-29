# PR_26180_OWNER_021-archive-legacy-games-samples-teardown Report

## Executive Summary

PR021 removes legacy manifest-era and archived tool sample surfaces that have no active `www/`, `api/`, `dev/scripts`, `dev/tests`, `dev/tools`, package, or CI references.

Deleted groups:

- `www/src/tools/common/` (2 files): inactive manifest-era browser helpers.
- `dev/archive/v1-v2/tools/old_object-vector-studio-v2/` (35 files): archived old Object Vector tool implementation superseded by current Object Vector runtime/schema/tests under `www/` and `dev/tests/`.
- `dev/archive/v1-v2/tools/old_Parallax Scene Studio/` (22 files): archived old Parallax tool/sample folder with no active runtime/test/script references.

Preserved groups:

- `dev/archive/v1-v2/games/`: preserved because current `www/`, `dev/scripts`, and `dev/tests` still reference archived game paths.
- `dev/archive/v1-v2/samples/`: preserved because current dev tooling and validation baselines still reference archived sample paths.
- `dev/archive/v1-v2/tools/SpriteEditor_old_keep/`: preserved because governance/reference docs still mark it as keep-policy material.
- `dev/workspace/generated/tool-images/**`: untouched.

## Evidence Review

| Candidate | Status | Decision |
|-----------|--------|----------|
| `old_games/**` | No exact tracked `old_games` folder found. | No deletion required. |
| `old_samples/**` | Only exact tracked `old_samples` match is under `SpriteEditor_old_keep`. | Preserved due explicit keep-policy references. |
| `dev/archive/v1-v2/games/**` | Active references remain in `www/src/shared/toolbox/*`, dev scripts, and dev tests. | Preserved; deletion blocked until references migrate. |
| `dev/archive/v1-v2/samples/**` | Active references remain in dev tools, dev scripts, dev tests, and validation baselines. | Preserved; deletion blocked until references migrate. |
| `www/src/tools/**` | `www/src/tools/common` had no active imports beyond extraction baseline entries. | Deleted. |
| Old Object Vector archive | No active runtime/test/script references outside archive/report/history. | Deleted. |
| Old Parallax archive samples | No active runtime/test/script references outside archive/report/history. | Deleted. |

## Runtime Boundary

No active `www/`, `api/`, `dev/scripts`, `dev/tests`, package, or GitHub workflow reference remains to the deleted PR021 paths.

The PR does not change product behavior, API behavior, database behavior, or active UI behavior.

## Follow-Up

Future PRs must migrate active archive game/sample references before deleting `dev/archive/v1-v2/games/**` or `dev/archive/v1-v2/samples/**`.
