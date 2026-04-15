MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_06_SAMPLE_PHASE_TRACKS_AND_2D_SAMPLE_BUILDS_INSPECT_FIRST`.

Goal:
Close as much of the remaining sample-phase and 2D dependency-driven sample lane as truthfully possible, but DO NOT blindly create items that may already exist.

Inspect-first requirements:
1. Inspect the repo first for each target item.
2. Classify each item as:
   - already exists and complete
   - partially exists and needs normalization
   - missing and needs creation
   - exists under the wrong name/location and needs alignment

Target items:

Sample Phase Tracks
- foundational phases normalized
- tilemap / camera / rendering phases normalized
- tool-linked sample phases normalized
- network concepts / latency / simulation phase normalized

Dependency-Driven Sample Builds
- 2D camera sample
- tilemap scrolling sample
- collision sample
- enemy behavior sample
- full 2D reference game sample

Required work:
1. Reuse and normalize existing sample assets/surfaces wherever possible.
2. Do NOT recreate samples that already exist under acceptable names/locations.
3. Create only the truly missing items.
4. Keep changes surgical and truth-based.
5. Update roadmap status markers only.
6. Report:
   - what already existed
   - what was normalized
   - what was newly created
   - what remains open, if anything

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_LEVEL_06_SAMPLE_PHASE_TRACKS_AND_2D_SAMPLE_BUILDS_INSPECT_FIRST.zip`

Hard rules:
- inspect first, create second
- no blind sample creation
- no unrelated repo changes
- no missing ZIP
