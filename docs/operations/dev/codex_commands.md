MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_10_12_INTERACTION_HIERARCHY_AND_COMPONENT_STANDARDIZATION

Rules:
- complete the lowest unfinished STYLE first
- this PR is valid only after STYLE_07 is complete
- bundle STYLE_10 through STYLE_12 in this PR only
- do NOT start STYLE_13+ implementation work
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_10_12_INTERACTION_HIERARCHY_AND_COMPONENT_STANDARDIZATION.zip
- do NOT create staging folders in <project folder>/tmp
- do NOT modify roadmap in the PR bundle
- Codex updates roadmap during execution only
- roadmap changes are append-only except for execution-backed status markers
- do NOT delete existing roadmap text
- do NOT rewrite existing roadmap text

Required work:
1. Implement STYLE_10 interaction and flow improvements on the migrated shell tools.
2. Implement STYLE_11 visual hierarchy and readability improvements on the same tool set.
3. Implement STYLE_12 component standardization on the same tool set.
4. Preserve the shared shell/layout from STYLE_06–09.
5. Keep the change narrow, testable, and free of inline/embedded styling.
6. Update MASTER_ROADMAP_STYLE.md during execution:
   - mark STYLE_10, STYLE_11, STYLE_12 only if execution-backed
   - append STYLE_10–STYLE_17 sections only if any are still missing
   - do not delete or rewrite existing roadmap text
