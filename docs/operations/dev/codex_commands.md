MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_FINAL_SYSTEM_COMPLETION_AND_UAT_READY

Rules:
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_FINAL_SYSTEM_COMPLETION_AND_UAT_READY.zip
- do NOT create staging folders in <project folder>/tmp
- do NOT modify roadmap in the PR bundle
- Codex updates roadmap during execution only
- roadmap changes must be execution-backed
- do NOT delete existing roadmap text
- do NOT rewrite existing roadmap text
- no embedded <style> blocks
- no inline style=""
- no JS-generated styling introduced

Required work:
1. Audit remaining unfinished items in Tracks A, B, E, F, and G of MASTER_ROADMAP_STYLE.md.
2. Implement the minimum execution-backed work needed to complete them.
3. Complete Track F:
   - explicit spacing scale
   - margin/padding audit
   - typography standardization
4. Complete Track G:
   - per-PR migration rule
   - validation rule
   - old-style retirement rule
5. Close remaining partials in Tracks A, B, and E only if repo state supports them.
6. Mark roadmap items complete only when execution-backed.
7. Include a closeout report mapping each newly completed roadmap item to repo evidence.
8. End with the repo UAT-ready.

UAT-ready means:
- no inline style system violations
- shared theme/tokens/spacing/typography are coherent
- rules are documented and enforced by repo state
- no false roadmap completions
