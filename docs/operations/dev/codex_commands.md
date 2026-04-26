
# Codex Command

Execute BUILD_PR_LEVEL_20_24_PLACE_PAGER_AT_PLATFORM_SHELL_MARKER

Steps:

1. Open tools/shared/platformShell.js
2. Locate:
   // pager should go here
3. Replace ONLY that line with pager render logic
4. Remove any other pager instances
5. Ensure tool mount still works
6. Do not modify unrelated code

Return ZIP
