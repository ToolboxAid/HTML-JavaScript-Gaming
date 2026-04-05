# Codex Commands

## Primary build
MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_VECTOR_SHOWCASE_AND_GEOMETRY_RUNTIME_FINAL` as a docs-driven implementation PR that combines the final public-facing vector platform showcase with deterministic geometry runtime finalization.

### Goals
- registry-driven showcase surface
- mandatory engine theme across all active first-class tools
- deterministic vector geometry runtime contracts
- stable transform/render/precision behavior
- preserve `tools/SpritEditor_old_keep/` but exclude it from active platform surface

### Active first-class tools
- `tools/Vector Map Editor/`
- `tools/Vector Asset Studio/`
- `tools/Tile Map Editor/`
- `tools/Parallax Editor/`

### Constraints
- keep changes surgical
- do not delete legacy sprite editor preserved path
- no obsolete `Sprite Editor V3` references
- no runtime-breaking engine rewrites
- do not hardcode duplicate tool lists outside registry
- prefer shared engine/theme and shared vector runtime over tool-specific behavior

### Package output
Create:
`<project folder>/tmp/BUILD_PR_VECTOR_SHOWCASE_AND_GEOMETRY_RUNTIME_FINAL.zip`

## Commit comment
Use `docs/dev/commit_comment.txt`.
