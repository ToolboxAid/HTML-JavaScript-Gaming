MODEL: GPT-5.4
REASONING: high

TASK:
Create BUILD_PR_VECTOR_GEOMETRY_RUNTIME in the HTML-JavaScript-Gaming repo.

GOAL:
Implement the first production-ready vector geometry runtime that follows docs/specs/vector_asset_contract.md and is suitable for vector-native sample games.

IMPORTANT SCOPE:
- Build only the geometry/runtime layer needed to support vector-native rendering and geometry operations
- Do not introduce unrelated gameplay work
- Do not do broad engine refactors
- Do not revive or depend on old SpriteEditor
- Keep public boundaries clean and surgical
- Respect docs-first repo workflow
- Use approved/public selectors and contracts only

REPO TARGET:
C:\Users\DavidQ\Documents\GitHub\HTML-JavaScript-Gaming

PRIMARY OBJECTIVE:
Create a geometry runtime that can support vector asset consumption and runtime operations for sample games and future vector-native tooling.

REQUIRED CAPABILITIES:
1. Vector asset ingestion from the agreed vector asset contract
2. Shape normalization / parsing
3. Transform support:
   - translate
   - rotate
   - scale
4. Geometry helpers:
   - bounds / bounding box
   - center/origin handling
   - point transformation
5. Runtime-ready renderable output for supported primitives
6. Collision-ready geometry primitives where appropriate
7. Clear separation between:
   - asset contract parsing
   - geometry math
   - render preparation
   - runtime helpers

NON-GOALS:
- no broad gameplay systems
- no AI systems
- no collaboration/multiplayer systems
- no large engine rewrite
- no unrelated tool redesign
- no legacy SpriteEditor preservation

REQUIRED FILES / DELIVERABLES:
1. docs/pr/BUILD_PR_VECTOR_GEOMETRY_RUNTIME.md
2. docs/dev/codex_commands.md
3. docs/dev/commit_comment.txt
4. docs/dev/reports/file_tree.txt
5. docs/dev/reports/change_summary.txt
6. docs/dev/reports/validation_checklist.txt

IMPLEMENTATION EXPECTATIONS:
- follow vector_asset_contract.md exactly
- keep modules small and composable
- prefer pure geometry utilities where possible
- keep boundaries clean between parsing/math/runtime usage
- expose only what sample games need now
- avoid premature abstraction beyond this runtime slice

VALIDATION MUST COVER:
- vector assets parse successfully
- transforms behave correctly
- bounds compute correctly
- supported primitives produce usable runtime output
- sample-game integration path is clear
- no broken imports/paths introduced

BUILD PR DOC MUST INCLUDE:
- runtime scope
- modules created or changed
- public/runtime boundaries
- validation performed
- follow-up recommendations for next PR

ZIP REQUIREMENT:
Package as a repo-structured ZIP at:
<project folder>/tmp/BUILD_PR_VECTOR_GEOMETRY_RUNTIME.zip

COMMIT COMMENT:
Implement the initial vector geometry runtime aligned to the vector asset contract, with clean parsing, transform, bounds, and render-prep support for vector-native sample games.
