Toolbox Aid
David Quesenberry
04/03/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4
REASONING: high
COMMAND:
Create BUILD_PR_PROJECT_ASSET_REGISTRY docs-first implementation bundle.

Requirements:
- Implement project-level asset registry support for Sprite Editor, Tile Map Editor, and Parallax Editor
- Prefer separate project.assets.json unless repo conventions require embedding in existing project file
- Preserve legacy standalone file compatibility
- Do not modify engine core APIs
- Use project-relative normalized paths
- Add additive, non-destructive registry merge behavior
- Avoid duplicate asset entries where practical
- Include sample project data showing shared palette/sprite/tileset/parallax references

Validation:
- All manual checklist items in docs/dev/reports/validation_checklist.txt must pass

Package:
- Output delta zip to HTML-JavaScript-Gaming/tmp/BUILD_PR_PROJECT_ASSET_REGISTRY_delta.zip

COMMIT COMMENT:
docs: plan project asset registry for cross-tool shared asset references

NEXT COMMAND:
BUILD_PR_PROJECT_ASSET_REGISTRY
