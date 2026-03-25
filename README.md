Toolbox Aid
David Quesenberry
03/25/2026
README.md

# Engine Usage Normalization — Delta

This delta provides:
- A BUILD_PR document to normalize engine usage listings across samples and games
- A CODEX_COMMANDS.md to execute the PR
- A helper script to audit actual engine usage from source imports

## Goal
Ensure all index.html entries list ONLY the engine classes actually used by each sample/game.

## Canonical Order
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme (if used)
- add others ONLY if used (e.g., ActionInputService, Camera2D)

## How to Use
1) Run the Codex command from CODEX_COMMANDS.md
2) Optionally run the audit script locally:
   python scripts/engine_usage_audit.py <repo_root>

3) Update index.html entries to match actual imports (no speculative entries)

## Notes
- Do NOT include unused engine modules
- Keep entries minimal and accurate
- No engine code changes in this PR (docs + normalization only)
