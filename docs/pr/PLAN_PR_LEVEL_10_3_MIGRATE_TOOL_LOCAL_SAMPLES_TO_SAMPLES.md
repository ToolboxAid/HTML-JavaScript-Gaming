# PLAN_PR_LEVEL_10_3_MIGRATE_TOOL_LOCAL_SAMPLES_TO_SAMPLES

## Purpose
Move tool-local sample/demo payloads out of tools and into `/samples`, preserving sample behavior while enforcing the rule that tools do not own samples.

## User Request
Move the three samples from each tool into `/samples`:
- Vector Map Editor
- Vector Asset Studio
- Parallax Scene Studio
- Tilemap Studio

Vector Asset Studio was listed twice by the user; treat it once unless the repo contains two distinct sample groups.

## Scope
- Find tool-local samples/demos in the listed tools.
- Move each to the correct `/samples/phase-*` location.
- Use existing sample naming and directory conventions.
- Update `samples/index.html`.
- Remove tool-local sample dropdown/select entries only after sample parity exists.
- Add/update tests so samples still launch from `/samples`.

## Non-Goals
- No broad tool UX rewrite beyond removing/migrating sample entry points.
- No game manifest changes unless a migrated sample requires manifest input.
- No validators.
- No `start_of_day` changes.
