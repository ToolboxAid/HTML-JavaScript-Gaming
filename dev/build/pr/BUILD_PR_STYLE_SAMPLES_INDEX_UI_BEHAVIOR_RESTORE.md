# BUILD_PR_STYLE_SAMPLES_INDEX_UI_BEHAVIOR_RESTORE

## Purpose
Restore the remaining samples index UI behavior without changing the current page shell or styling structure.

## Single PR Purpose
Fix the remaining `/samples/index.html` behavior regressions:
- restore all sample-filter dropdowns
- restore the pinned list
- change the tile pin affordance back to a pin, not a button
- restore preview images
- make the preview image the launch link
- add hover zoom on the preview image

## Confirmed Current State
The page shell is acceptable and should be kept.
Remaining problems are behavior/data/UI details:
- filter bar is showing
- dropdowns are not all showing/working
- pin is showing as a button instead of a pin
- pinned list is not showing
- preview image is missing
- preview image should be the `<a>` launch target
- preview image should zoom on hover

## Required Fix Direction
1. Keep the current page rendering shell.
2. Restore the original intended samples index UI capabilities only.
3. Do not redesign the page.
4. Do not restyle the entire page.
5. Reconnect the current shell to the correct data/UI behaviors.

## Required Behavior To Restore
### Filters
Restore all sample filter controls, including:
- phase
- class
- the remaining third filter currently missing from the restored page

The filter UI must both render and function.

### Pinning
Restore pinning behavior so that:
- the tile affordance is a pin, not a generic button
- the pinned list/section is visible again
- pinned state is reflected correctly in the UI
- pinning behavior works from the tile UI

### Preview Image
Restore preview image behavior so that:
- each sample tile shows the correct preview image
- the preview image is wrapped by the launch `<a>`
- clicking the preview image launches the sample
- the preview image has zoom-on-hover behavior
- this is implemented through shared CSS/markup behavior, not inline styling

## Required Rules
- no embedded `<style>` blocks
- no inline `style=""`
- no JS-generated styling
- keep scope limited to `/samples/index.html` and directly related sample-index UI/data/rendering dependencies
- preserve the current accepted page shell
- restore capability, not redesign

## Likely Root Causes To Check
- incomplete filter metadata wiring
- missing filter render path for class/third filter
- pinned-list render path disconnected
- pin UI simplified during restore
- preview image field not mapped from sample metadata
- image anchor wrapper removed
- hover-zoom class/markup no longer applied
- current template only partially restores the original tile model

## Acceptance
- `/samples/index.html` shows all intended filter dropdowns
- filters function correctly
- tile pin is shown as a pin, not a button
- pinned list is visible and working
- sample preview images render correctly
- preview image is the launch link
- preview image zooms on hover
- current page shell and header/body consistency remain intact
- change is visually and functionally testable
