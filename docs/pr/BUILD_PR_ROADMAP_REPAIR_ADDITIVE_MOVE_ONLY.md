# BUILD_PR_ROADMAP_REPAIR_ADDITIVE_MOVE_ONLY

## Purpose
Repair `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` under strict additive/move-only rules.

## Non-negotiable rules
- NO delete
- NO text rewrite
- NO summarization
- NO compression/shortening
- NO line replacement except status marker updates where explicitly needed
- ONLY allow:
  - adds
  - moves
  - status marker updates

## Intent
The roadmap currently has drift and appended/duplicated content.
This PR repairs structure while preserving all existing roadmap text.

## Required approach

### A. Preserve all text
- Every existing roadmap line must survive somewhere in the repaired file
- If text is in the wrong place, MOVE it
- Do not delete duplicated/appended content; relocate it to the correct place or preserve it in an explicit additive holding section if exact placement is uncertain

### B. No wording changes
- Keep wording exactly as-is
- Do not normalize spelling
- Do not rephrase
- Do not "clean up" text

### C. Status-only updates
- Status markers may be updated where execution truth clearly supports it
- No surrounding text changes

### D. Productization rule handling
- If rule text is currently in the roadmap in a task-like place, MOVE it to the correct policy/instruction area in the roadmap or preserve it in an additive policy section
- Do not delete it
- Do not rewrite it

### E. Duplicate / appended content handling
- If the roadmap has duplicated headings or appended fragments, MOVE them into the correct section or into an additive recovery section at the end
- Do not delete the content
- Do not rewrite the content

### F. Recovery-first rule
If Codex cannot confidently place a line into its exact intended location:
- preserve it in an additive `Recovery / Preserved Content` section at the bottom
- do not delete it
- do not rewrite it

## Validation requirements
Codex must report:
- lines/sections moved
- lines/sections added
- any status markers updated
- confirmation that no roadmap text was deleted
- confirmation that no roadmap wording was changed

## Packaging requirement
Codex must package all changed files into:
`<project folder>/tmp/BUILD_PR_ROADMAP_REPAIR_ADDITIVE_MOVE_ONLY.zip`

## Scope guard
- roadmap repair only
- docs-first
- no unrelated repo changes

## Applied delta
- Added structural containment at the roadmap tail:
  - `---`
  - `## Recovery / Preserved Content`
- Preserved and retained the appended status fragment directly under that section with exact original wording:
  - `# MASTER ROADMAP HIGH LEVEL (status updates only)`
  - `[.] asset naming normalization`
  - `[.] manifest discovery`
  - `[x] fullscreen bezel overlay system (low priority, before next game)`

## Validation output
- no roadmap text deleted: confirmed (`MISSING_COUNT=0` in before/after line-preservation check)
- no roadmap wording changed: confirmed (roadmap diff shows additive insertion only; no modified/deleted wording lines)
- only adds, moves, and status updates were used: confirmed (this repair used additive structural placement only; no status markers changed)
