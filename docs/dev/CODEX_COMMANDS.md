MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_EDITOR_ADVANCED_SIMULATION_FULL_MAPS as an implementation delta. Upgrade simulation in both tools/Tile Map Editor/ and tools/Parallax Editor/ from basic preview to full-map simulation mode. Both editors must support scrollable full-map simulation with play, pause, stop/exit, restart position, and map traversal context. Tile Map Editor must visibly validate full layout, obstacles, collision/data layers, and object/spawn markers over a wide map. Parallax Editor must visibly validate depth, foreground/background behavior, repeat/wrap, and scroll-factor behavior over a full-map traverse. Keep sample loading local to each editor, do not modify engine core APIs, and keep both editors as separate tools.

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_EDITOR_ADVANCED_SIMULATION_FULL_MAPS_delta.zip
- Include docs/dev/reports/
- Include only relevant files
