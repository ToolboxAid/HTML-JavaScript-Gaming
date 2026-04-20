MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_07_LAUNCH_CLARITY_AND_ROADMAP_APPEND_ONLY

Rules:
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_07_LAUNCH_CLARITY_AND_ROADMAP_APPEND_ONLY.zip
- do NOT create staging folders in <project folder>/tmp
- complete existing unfinished STYLE items before new ones
- lowest unfinished STYLE number first
- do NOT start STYLE_10 implementation work in this PR
- roadmap updates happen during execution only
- roadmap changes are append-only except for execution-backed status markers
- do NOT delete existing roadmap text
- do NOT rewrite existing roadmap text

Required work:
1. Implement STYLE_07 launch clarity/help text in the relevant UI.
2. Use exactly this wording:
   - Open Tool = launch the tool directly/standalone
   - Open In Host = launch the same tool inside a shared host shell/container
3. Append the bundled STYLE_07 and STYLE_10 through STYLE_17 sections to docs/dev/roadmaps/MASTER_ROADMAP_STYLE.md.
4. Mark STYLE_07 completion boxes only if execution-backed by the implemented change.
5. Keep the change narrow, testable, and free of inline/embedded styling.
