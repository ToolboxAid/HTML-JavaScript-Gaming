MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1 as a conservative exact-cluster implementation.

Scope:
- active tools only
- reuse existing tools/shared modules first
- target only:
  - project system helper normalization
  - runtime asset loader helper normalization
  - runtime asset validation helper normalization
  - safe vector helper normalization already represented in tools/shared/vector/*
- no style/theme work in this PR
- no editor-state extraction
- no render-pipeline rewrites
- no tool-host work
- preserve tools/SpriteEditor_old_keep
- keep changed-file count minimal
- stop and report if helper semantics diverge too much

Validation:
- npm run test:launch-smoke -- --tools
- report exact files changed
- report extracted vs normalized helpers
- report helpers intentionally left local and why

Output:
- package repo-structured delta ZIP under <project folder>/tmp/
- use docs/dev/reports for validation/report files
