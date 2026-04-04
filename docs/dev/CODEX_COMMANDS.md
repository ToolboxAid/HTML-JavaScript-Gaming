MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute this atomic Level 9 package in order.

Step 1:
Treat docs/pr/PLAN_PR_ASSET_DEPENDENCY_GRAPH.md as the governing architecture contract.

Step 2:
Create BUILD_PR_ASSET_DEPENDENCY_GRAPH.

BUILD requirements:
- Implement a minimal additive project-level asset dependency graph
- Preserve registry as source of truth
- Use stable IDs and deterministic edge generation
- Keep backward compatibility for legacy projects with no graph data
- Surface missing targets/orphaned assets as validation findings rather than hard failures
- Support Sprite Editor, Tile Map Editor, and Parallax Editor local graph contribution
- Do not modify engine core APIs

Step 3:
Validate BUILD against docs/pr/BUILD_PR_ASSET_DEPENDENCY_GRAPH.md.

Step 4:
Treat docs/pr/APPLY_PR_ASSET_DEPENDENCY_GRAPH.md as the acceptance boundary and package results.

Package:
HTML-JavaScript-Gaming/tmp/LEVEL_9_ASSET_DEPENDENCY_GRAPH_ATOMIC_PACKAGE_delta.zip
