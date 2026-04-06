Toolbox Aid
David Quesenberry
04/06/2026
APPLY_PR_DEBUG_SURFACES_ADVANCED_INSPECTORS.md

# APPLY_PR_DEBUG_SURFACES_ADVANCED_INSPECTORS

## Apply Intent
Implement advanced shared inspectors as an opt-in debug capability with read-only data flow and no engine core edits.

## Apply Rules
- no engine core changes
- no auto-injection into unrelated games/samples
- no hidden 3D assumptions
- no runtime mutation paths
- use host/registry/command public APIs only

## Required Validation
- imports pass for inspector modules
- host + registry command flow works
- inspector snapshots stay read-only and bounded
- no forced sample/game adoption
- roadmap edits remain bracket-only

## Roadmaps
Roadmap edits (if needed) are limited to bracket states in:
- docs/roadmaps/BIG_PICTURE_ROADMAP.md
- docs/roadmaps/NETWORK_SAMPLES_PLAN.md
- docs/roadmaps/PRODUCTIZATION_ROADMAP.md
