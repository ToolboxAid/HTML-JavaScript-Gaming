MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_09_TOOLS_NORMALIZATION_AND_REQUIRED_TOOLS_COMBINED_PASS` as one combined Tools-lane PR.

Goal:
Finish as much of the remaining tool normalization and dependency-driven required tool work as truthfully possible in one pass.

Target items to close in this PR if supported:

Existing Tools
- TileMapEditor normalized
- ParallaxEditor normalized
- VectorMapEditor normalized
- VectorAssetStudio normalized

New Required Tools
- PhysicsSandboxTool
- StateInspectorTool
- ReplayVisualizerTool
- PerformanceProfilerTool
- AssetPipelineTool
- Tile/Model Converter Tool

Required work:
1. Treat the four existing tools as one normalization cluster.
2. Normalize their shared shell, placement, boundaries, and data-contract consistency.
3. Treat the required tools as one dependency-driven stabilization cluster.
4. Close as many partial or open items as truthfully possible without speculative overbuilding.
5. Reuse existing repo patterns and tool infrastructure instead of creating disconnected one-offs.
6. Close as many remaining tool items as truthfully possible in this one PR.
7. If anything remains open:
   - keep the residue very small
   - report exact blockers
   - leave it suitable for one residue-only PR

Roadmap:
- update status markers only
- do NOT rewrite roadmap text

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_09_TOOLS_NORMALIZATION_AND_REQUIRED_TOOLS_COMBINED_PASS.zip`

Hard rules:
- combine aggressively to reduce PR count
- keep the changes coherent
- no unrelated repo changes
- no missing ZIP
