Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

# CODEX COMMANDS

## MODEL
GPT-5.4

## REASONING
high

## COMMAND
Create `APPLY_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS` as an implementation PR that applies the approved render pipeline contract for Tile Map Editor, Parallax Editor, Sprite Editor, and Vector Asset Studio.

Requirements:
- Implement one shared runtime contract path for `toolbox.render.asset-document` and `toolbox.render.composition-document`
- Add validation, normalization, deterministic render stage ordering, and structured errors
- Lock tool-to-engine mappings exactly as documented
- Add composition-driven mixed-scene assembly
- Add focused automated tests for valid documents, invalid documents, stage ordering, and composition assembly
- Keep changes surgical and architecture-safe
- Do not move reusable logic into samples
- Do not add implementation code to docs bundles
- Do not perform unrelated refactors

Required output artifacts:
- Update repo files needed for implementation
- Update `docs/dev/change_summary.txt`
- Update `docs/dev/validation_checklist.txt`
- Preserve file headers for all newly created files
- Package the repo-structured delta ZIP to:
  - `<project folder>/tmp/APPLY_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS_delta.zip`
