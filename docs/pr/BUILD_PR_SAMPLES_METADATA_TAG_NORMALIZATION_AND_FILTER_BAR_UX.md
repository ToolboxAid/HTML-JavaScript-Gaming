# BUILD_PR_SAMPLES_METADATA_TAG_NORMALIZATION_AND_FILTER_BAR_UX

## Purpose
Improve `/samples/index.html` sample discovery by normalizing metadata and tightening the filter/tile UX without redesigning the page shell.

## Single PR Purpose
Fix the samples metadata and filter/tile behavior in one focused pass:
- make tags real tags instead of duplicated class values
- expose the sample class list clearly
- sort classes alphabetically
- align search on the same row as Phase / Class / Tag
- move the pin affordance to the top-right over the preview image if allowed by the current tile structure
- use green instead of red when pinned

## Metadata Rules
### Class
- each sample must have a clear class value
- class values should be broad categories
- class options presented in the UI must be sorted alphabetically

### Tags
- tags must be meaningful descriptive labels, not copies of class values
- tags should reflect capabilities, behaviors, systems, or topics in the sample
- examples:
  - physics
  - collision
  - parallax
  - networking
  - debug
  - editor
  - tilemap
  - input
  - particles
  - replay
- tag filtering must use the real tag values

### Class List Visibility
- include/display the class list for each sample
- keep it readable and clearly distinct from tags

## Filter Bar UX Rules
- search must be on the same line as:
  - Phase
  - Class
  - Tag
- keep the filter bar compact and readable
- preserve existing functionality
- do not redesign the entire page

## Tile UX Rules
### Pin
- move pinned control/indicator to the top-right over the preview image if the tile structure allows it cleanly
- pin should look like a pin, not a generic button
- pinned visual state should change from red to green
- preserve pinning behavior and pinned list behavior

### Preview Image
- keep preview image as the launch anchor
- preserve hover zoom behavior
- do not break launch behavior

## Required Rules
- no embedded `<style>` blocks
- no inline `style=""`
- no JS-generated styling
- keep scope limited to `/samples/index.html` and directly related sample metadata/rendering/filter dependencies
- preserve the accepted page shell and shared header/body consistency

## Acceptance
- tags are real descriptive tags, not class duplicates
- class values/lists are clearly available and class filter options are alphabetical
- search is on the same line as Phase / Class / Tag
- pinned control is top-right over the preview image when allowed
- pinned state uses green, not red
- preview image remains the launch anchor with hover zoom
- filtering and pinning continue to work
- change is visually and functionally testable
