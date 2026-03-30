MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_EDITOR_LOAD_UX_AND_SIMULATION_POLISH as an implementation delta. Apply one final polish pass to both tools/Tile Map Editor/ and tools/Parallax Editor/. Add consistent top-level actions for New Project, Load Project, Load Sample, Save Project, Simulate, and Exit Simulation. Add simulation/preview mode to both editors. Tile Map Editor simulation should preview authored tile/data/object state. Parallax Editor simulation should preview background/foreground depth, scroll factors, repeat/wrap, and camera-relative motion. Keep sample loading local to each tool, do not modify engine core APIs, and keep both editors as separate tools.

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_EDITOR_LOAD_UX_AND_SIMULATION_POLISH_delta.zip
- Include docs/dev/reports/
- Include only relevant files
