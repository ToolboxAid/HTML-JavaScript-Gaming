# PR_26146_105-108 Classification Map

## Ownership
- Classification remains owned by Song Details.
- Classification remains a human-entered metadata field.
- Song Details owns the generated ID preview because generated ID is derived from Name and Classification.

## Common Examples
The Classification examples library includes:
- Menu
- Intro
- Loop
- Boss
- Victory
- Game Over
- Ambient
- Cutscene
- Underwater
- Flying
- Ice
- Lava
- Space
- Castle
- Town
- Dungeon
- Forest
- Night
- Stealth
- Puzzle
- Chase

## Custom Classification Preservation
- The text Classification field accepts values outside the examples library.
- Custom values update the generated ID preview.
- Custom values continue to drive the existing classification-guided defaults as custom metadata.

## Generated ID
- ID remains read-only.
- ID remains generated as `camelCase(Name) + "-" + Classification`.
- Playwright verifies both example-driven and custom Classification ID updates.

## Game Usage Separation
- Game Usage assignment is persisted separately at `music.songs[].director.usage`.
- Classification is not overwritten by Game Usage assignment.
- Automatic game-trigger wiring remains red/unwired because the runtime trigger workflow is incomplete.
