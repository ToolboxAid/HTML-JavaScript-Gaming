# BUILD_PR_SAMPLES_METADATA_TAG_NORMALIZATION_AND_FILTER_BAR_UX

## Purpose
Improve `/samples/index.html` sample discovery by normalizing metadata and tightening the filter/tile UX without redesigning the page shell.

## Single PR Purpose
Fix the samples metadata and filter/tile behavior in one focused pass:
- make tags real tags instead of duplicated class values
- expose the sample class list correctly
- sort dropdown values alphabetically with no duplicates
- align search on the same row as Phase / Class / Tag
- restore pin behavior using explicit text values instead of colored icons
- keep preview image as the launch link with hover zoom

## Metadata Rules
### Class
- each sample must have a clear class value
- class values should be broad categories
- class filter options presented in the UI must be sorted alphabetically
- class filter options must not contain duplicates

### Tags
- tags must be meaningful descriptive labels, not copies of class values
- tags should reflect capabilities, behaviors, systems, or topics in the sample
- tag filter options must be sorted alphabetically
- tag filter options must not contain duplicates
- tag filtering must use the real tag values

### Class List Display
- class information may be shown in a dedicated class area/list for each sample if needed
- do NOT append or inject the class list into the main sample description text
- the sample description must remain a human-readable description only

## Description Rule
Do NOT include classes in the description text.

Example of what must NOT happen:
`Phase 03 | Classes: ... | Tags: ...` appended into the description body.

Keep:
- sample title
- human-readable description

Separate from description if shown elsewhere:
- phase
- classes
- tags

## Filter Bar UX Rules
- search must be on the same line as:
  - Phase
  - Class
  - Tag
- dropdown options must be alphabetically sorted
- dropdown options must not contain duplicates
- keep the filter bar compact and readable
- preserve existing functionality
- do not redesign the entire page

## Pin UX Rules
- do NOT use a colored icon for pin/unpin state
- pinned/unpinned must show explicit text values:
  - `Pinned`
  - `Unpinned`
- pinning behavior and pinned list behavior must be preserved/restored
- if placement over the preview image is retained, the text treatment must remain readable and clean

## Preview Image Rules
- keep preview image as the launch anchor
- preserve hover zoom behavior
- do not break launch behavior

## Required Rules
- no embedded `<style>` blocks
- no inline `style=""`
- no JS-generated styling
- keep scope limited to `/samples/index.html` and directly related sample metadata/rendering/filter dependencies
- preserve the current accepted page shell and shared header/body consistency

## Acceptance
- tags are real descriptive tags, not class duplicates
- class/tag dropdown values are alphabetical and contain no duplicates
- classes are not appended into the description text
- search is on the same line as Phase / Class / Tag
- pin state shows `Pinned` / `Unpinned` text, not red/green icon treatment
- preview image remains the launch link with hover zoom
- filtering and pinning continue to work
- change is visually and functionally testable
