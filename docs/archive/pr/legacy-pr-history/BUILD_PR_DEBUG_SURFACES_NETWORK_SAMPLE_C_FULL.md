Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_DEBUG_SURFACES_NETWORK_SAMPLE_C_FULL.md

# BUILD_PR_DEBUG_SURFACES_NETWORK_SAMPLE_C_FULL

## Build Summary
Prepared the next docs-first implementation package for the Level 11 network sequence so Codex can build **Network Sample C - Divergence / Trace Validation** without skipping the repo workflow.

## Deliverables In This Bundle
1. PR planning docs for Sample C full implementation
2. Updated `docs/dev/NETWORK_SAMPLES_PLAN.md`
3. Roadmap guidance for `docs/archive/dev-ops/BIG_PICTURE_ROADMAP.md`
4. Codex command, commit comment, next command, and validation reports

## Implementation Direction
### 1) Games Hub
- add Sample C to `games/index.html` under **Level 11 - Network Games**
- use the existing debug showcase card format already used by Network Sample A and Network Sample B
- do not add a new top section and do not replace the page body structure

### 2) Sample C Experience
- deterministic divergence scenario
- event sequencing timeline
- divergence explanation notes
- reproduction guide
- validation checklist
- safe Play-first / Debug-second onboarding language

### 3) Tracking Docs
- move Track P to in-progress for Sample C
- keep Track T (server dashboard) and Track U (server containerization) listed as future tracks unless implementation is actually present

### 4) Roadmap Hygiene
- remove broken icon usage in the big-picture roadmap network/debug section
- keep plain-text Track T and Track U headings
- preserve existing roadmap ordering and wording where possible

## Scope Safety
- no code is included in this bundle
- no engine API changes are requested here
- no server/container code is included in this PR package
