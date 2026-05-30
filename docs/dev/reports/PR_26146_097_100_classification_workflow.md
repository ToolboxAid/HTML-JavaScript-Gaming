# PR_26146_097-100 Classification Workflow

## Ownership
- Classification remains owned by `music.songs[].classification` in Song Details.
- The generated ID remains read-only and is derived as `camelCase(Name)-Classification`.
- Classification does not mutate instrument SSoT data directly.

## User-Facing Behavior
- The Classification help icon now includes examples and guidance:
  - Classification is human-entered.
  - Classification seeds default section templates.
  - Classification surfaces instrument suggestions.
  - Classification surfaces generation hints.
  - ID behavior remains `camelCase(Name)-Classification`.

## Default Workflow Data
`SongSheetControl` resolves a classification workflow from the current classification value:
- `sectionTemplates`: default Intro, Verse, Chorus, Bridge, Outro progressions.
- `instrumentSuggestions`: visible suggested instruments for the cue type.
- `generationHints`: visible arrangement guidance for the current cue type.
- `summary`: concise profile label used by the guide output.

Known classification profiles added:
- Ambient
- Boss
- Chase
- Flying
- Loop
- Menu
- Puzzle
- Underwater
- Victory

Unknown or freeform classifications use the General defaults while preserving the typed classification label.

## Template Insertion
- Built-in template options still target first-class section editors: Intro, Verse, Chorus, Bridge, Outro.
- Template preview and template insertion use the same classification workflow resolver.
- Applying a template into a populated built-in section appends the template chords instead of replacing existing chords.
- Custom sections are preserved and remain outside the built-in template replacement flow.
- If a template has no resolved chords, the Apply Template control is marked red/unwired with a status explaining the incomplete state.

## Verification
- Playwright enters `Underwater`, checks the read-only ID becomes `camptownRacesUatReel-Underwater`, verifies the classification guide, previews the Underwater Verse template, and confirms insertion appends `Dm Bb C Dm` into the populated Verse editor.
