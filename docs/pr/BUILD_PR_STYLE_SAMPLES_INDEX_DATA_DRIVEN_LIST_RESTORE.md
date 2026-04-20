# BUILD_PR_STYLE_SAMPLES_INDEX_DATA_DRIVEN_LIST_RESTORE

## Purpose
Restore the real data-driven samples index behavior on `/samples/index.html` so it shows phase descriptions, all samples within each phase, and sample pinning behavior.

## Single PR Purpose
Fix `/samples/index.html` so it renders the full sample list model correctly instead of collapsing each phase to a single `xx01` launch entry.

## Confirmed Regression
Current behavior is still wrong:
- phases display
- each phase launches only `xx01`
- phase descriptions are missing
- per-sample details are missing
- pinning behavior is missing
- the real sample list is not being rendered

## Required Correct Behavior
`/samples/index.html` must restore the original intended samples index behavior:
1. show each phase
2. show the phase description
3. show all samples within each phase
4. show per-sample details sourced from the sample list data
5. preserve/restore sample pinning behavior
6. keep filter behavior working
7. keep the shared header/body style consistency work intact

## Required Fix Direction
1. Identify the actual samples index data source / rendering path.
2. Restore rendering from that source instead of using a simplified phase-to-`xx01` shortcut.
3. Restore phase description rendering.
4. Restore all sample entries per phase.
5. Restore sample pinning behavior.
6. Preserve the shared style migration work already completed.

## Likely Root Causes To Check
- simplified phase-only rendering path introduced during refactor
- wrong data source selected for samples page
- phase metadata loaded but sample metadata ignored
- grouping loop reduced to one sample per phase
- template/render function no longer iterates the full sample list
- pinned sample state/UI removed or disconnected
- old samples index script path not being used
- partial restore focused only on phases, not the underlying list model

## Required Rules
- no embedded `<style>` blocks
- no inline `style=""`
- no JS-generated styling
- keep scope limited to `/samples/index.html` and directly related sample-index data/rendering dependencies
- preserve the shared header/body consistency fixes
- restore behavior, do not redesign

## Acceptance
- `/samples/index.html` shows phase descriptions
- `/samples/index.html` shows all samples within each phase
- `/samples/index.html` shows per-sample details from the sample list data
- sample pinning behavior is restored
- filter behavior continues to work
- header/body consistency remains correct
- page is visually and functionally testable
