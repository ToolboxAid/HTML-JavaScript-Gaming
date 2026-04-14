MODEL: GPT-5.4
REASONING: medium

COMMAND GOAL:
Create a docs-only PR that corrects Section 8 roadmap wording and markers to match the completed
boundary scan.

CONSTRAINTS:
- Docs only
- No code changes
- No repo-wide restructuring
- Preserve completed status for Asteroids, Puckman, and SpaceInvaders
- Distinguish core-games completion from repo-wide adoption

REQUIRED OUTPUT:
Return ZIP to <project folder>/tmp/ with exact repo-relative structure.

FILES TO UPDATE:
- docs/MASTER_ROADMAP_HIGH_LEVEL.md
- docs/dev/ROADMAP_RULES.md
- docs/pr/BUILD_PR_LEVEL_08_07_ROADMAP_SCOPE_CORRECTION.md

VALIDATION INPUT:
Use the latest boundary scan results:
- No violations: Asteroids, Puckman, SpaceInvaders
- Violations remain across multiple other game folders
