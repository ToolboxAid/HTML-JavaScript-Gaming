# Codex command

Run from repo root:

```powershell
codex exec --model gpt-5.4-codex --reasoning high --sandbox workspace-write --ask-for-approval never @docs/pr/BUILD_PR_LEVEL_11_89_ASTEROIDS_ENGINE_RENDER_OWNERSHIP_STABILIZATION.md
```

## Required output from Codex
Codex must create a ZIP artifact at:

```text
C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\tmp\PR_11_89_ASTEROIDS_ENGINE_RENDER_OWNERSHIP_STABILIZATION.zip
```

The ZIP must include changed repo files and:
- docs/pr/PLAN_PR_LEVEL_11_89_ASTEROIDS_ENGINE_RENDER_OWNERSHIP_STABILIZATION.md
- docs/pr/BUILD_PR_LEVEL_11_89_ASTEROIDS_ENGINE_RENDER_OWNERSHIP_STABILIZATION.md
- docs/dev/reports/pr_11_89_asteroids_engine_render_ownership_report.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
