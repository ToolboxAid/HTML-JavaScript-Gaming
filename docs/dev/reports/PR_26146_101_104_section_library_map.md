# PR_26146_101-104 Section Library Map

## Owner
The section library is owned by the Song Sheet surface and implemented in `SongSheetControl`.

## Controls
- `songSheetSectionLibrarySelect`: saved reusable section assets.
- `songSheetSaveSectionButton`: saves the selected populated Available Section as a reusable asset.
- `songSheetLoadSectionButton`: loads the selected asset into its matching built-in section editor or custom section row.
- `songSheetDuplicateSectionButton`: duplicates the selected asset into a new custom section.
- `songSheetSectionLibrarySummary`: read-only count/status for the section library.

## Data Flow
- Populated built-in editors and custom rows remain the source for Available Sections.
- Save Section reads the selected Available Section and stores a reusable asset inside `SongSheetControl`.
- Load Section writes the selected asset back to the matching first-class editor or custom section row, refreshes Available Sections, and updates canonical Song Sheet sections through the existing field-change path.
- Duplicate Section creates a new custom section label such as `VerseCopy1`, preserves the source progression, refreshes Available Sections, and updates canonical Song Sheet sections through the existing field-change path.

## Preservation
- Intro, Verse, Chorus, Bridge, and Outro remain first-class editors.
- Existing custom sections are preserved when duplicate section assets are added.
- Empty sections still do not populate Available Sections.

## Playwright Verification
The targeted test saves Verse, clears and reloads it, duplicates it to `VerseCopy1`, verifies Available Sections, and verifies the canonical Song Sheet sections include the duplicate custom section.
