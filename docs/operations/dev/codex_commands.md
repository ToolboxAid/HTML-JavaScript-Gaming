MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_16_17_PERF_FINAL_QA_AND_ROADMAP_CLOSEOUT

Rules:
- continue the lowest unfinished STYLE first
- complete STYLE_16 and STYLE_17 first
- then close remaining roadmap items only if execution-backed
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_16_17_PERF_FINAL_QA_AND_ROADMAP_CLOSEOUT.zip
- do NOT create staging folders in <project folder>/tmp
- do NOT modify roadmap in the PR bundle
- Codex updates roadmap during execution only
- roadmap changes are status-only / append-only as needed from execution-backed evidence
- do NOT delete existing roadmap text
- do NOT rewrite existing roadmap text
- do NOT invent completions

Required work:
1. Execute STYLE_16 Performance & Render Cleanliness.
2. Execute STYLE_17 Final QA & Visual Audit.
3. Audit all remaining open/partial items in MASTER_ROADMAP_STYLE.md.
4. Mark complete only the items directly supported by the repo state and execution evidence.
5. Leave any item unchanged if support is incomplete.
6. Include a closeout mapping report that shows:
   - roadmap item
   - status set
   - evidence/source in repo
7. Keep the change narrow, testable, and free of inline/embedded styling.

Validation emphasis:
- no horizontal overflow
- no unexpected vertical scroll traps
- spacing consistency
- typography consistency
- header full-width responsive behavior with preserved image aspect ratio
- collapsible stability
- tool-shell stability
- no avoidable reflow/thrashing patterns in touched flows
