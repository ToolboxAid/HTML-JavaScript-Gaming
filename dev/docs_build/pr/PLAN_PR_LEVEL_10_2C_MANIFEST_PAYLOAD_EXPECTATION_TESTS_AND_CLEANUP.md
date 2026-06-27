# PLAN_PR_LEVEL_10_2C_MANIFEST_PAYLOAD_EXPECTATION_TESTS_AND_CLEANUP

## Purpose
Add strict manifest payload expectation tests and cleanup rules after review showed game manifests can pass current tests while still containing invalid/legacy sections.

## User Review Findings
The attached game manifest shows sections that should not survive the final manifest model:
- lineage
- sources
- assets
- sprite-editor for vector-only games
- tile-map-editor where not used
- parallax-editor where not used
- libraries when they are only reference/index metadata
- legacy sourcePath/path references to deleted JSON

## Scope
- Add tests that validate expected manifest payload shape, not just page load.
- Clean invalid/legacy sections from game manifests.
- Ensure tools only appear when valid for that game.
- Ensure Vector Asset Studio owns Asteroids vectors.
- Ensure Sprite Editor, Tile Map Editor, and Parallax Editor are absent from Asteroids if not used.
- No start_of_day changes.
