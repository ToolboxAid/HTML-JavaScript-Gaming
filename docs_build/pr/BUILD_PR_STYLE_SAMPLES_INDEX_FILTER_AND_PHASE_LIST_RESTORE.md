# BUILD_PR_STYLE_SAMPLES_INDEX_FILTER_AND_PHASE_LIST_RESTORE

## Purpose
Restore the missing samples filter UI and full phase listing on `/samples/index.html` after the shared style migration work.

## Single PR Purpose
Fix `/samples/index.html` so it shows:
- the filter controls
- all phases

## Confirmed Symptom
`/samples/index.html` currently does not show:
- the filter
- all phases

## Required Fix Direction
1. Restore the filter UI if it is missing or hidden.
2. Restore the full phase list if it is truncated, filtered incorrectly, or not rendering all groups.
3. Keep the page aligned with the shared style system.
4. Do not redesign the page.
5. Prefer restoring existing functionality over inventing new behavior.

## Likely Root Causes To Check
- filter markup removed or not mounted
- filter hidden by CSS or collapsible behavior
- wrong body/page-shell classes interfering with visibility
- sample list data source not fully loaded
- phase grouping loop broken
- CSS selector collision hiding sections
- page script not running or mounting expected controls
- over-aggressive refactor from the entry-page consistency work

## Required Rules
- no embedded `<style>` blocks
- no inline `style=""`
- no JS-generated styling
- keep scope limited to `/samples/index.html` and its directly related shared script/CSS dependencies only
- preserve the new shared header/body consistency work
- restore behavior, do not redesign

## Acceptance
- `/samples/index.html` shows the filter UI
- `/samples/index.html` shows all phases
- filtering behavior works as intended
- page remains aligned with the shared style system
- no regressions to header/body consistency
- change is visually testable
