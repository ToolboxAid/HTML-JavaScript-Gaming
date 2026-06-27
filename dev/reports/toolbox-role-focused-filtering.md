# Toolbox Role Focused Filtering

Stacked PR:
- PR_26155_064-toolbox-role-focused-filtering

## Summary

Added dev-mode Toolbox filtering by Project Member Role on top of the existing role simulation.

Existing role simulation remains:
- `?role=guest`
- `?role=user`
- `?role=admin`

New optional member-role filter:
- `?memberRole=Owner`
- `?memberRole=Designer`
- `?memberRole=World%20Builder`
- `?memberRole=Artist`
- `?memberRole=Audio%20Creator`
- `?memberRole=Translator`
- `?memberRole=Tester`
- `?memberRole=Publisher`
- `?memberRole=Viewer`

Default guest/user views remain Owner-style non-admin current-tool views for compatibility with the existing Toolbox surface. Focused member roles narrow visible tiles for review.

Role focus behavior:
- Owner sees all current non-admin tools allowed by the current wireframe status model.
- Designer focuses on Project Workspace, Game Design, Game Configuration, Objects, Worlds, Characters, Colors, and Assets.
- World Builder focuses on Worlds, Objects, Assets, Colors, and Animations.
- Artist focuses on Assets, Colors, Fonts, Sprites, Characters, Objects, and Animations.
- Audio Creator focuses on Audio, Music, Voices, MIDI, Audio Effects, Voice Capture, Voice Output, and Assets.
- Translator focuses on Languages, Voices, Voice Capture, and Voice Output.
- Tester focuses on Game Testing, Controls, Hitboxes, Debug, Performance, and Events.
- Publisher focuses on Publish, Marketplace, Community, Cloud, and Languages.
- Viewer focuses on preview-safe read-only tiles.
- Admin view still shows planned/admin-capable Toolbox entries.

Focused views include a callout explaining that unavailable tools are hidden by role focus, not by security enforcement.

## Validation

Covered by:
- `npm run test:lane:project-workspace`
- `npm run test:workspace-v2`

The targeted lane verifies:
- Owner/user view still shows the current non-admin surface.
- Designer view focuses expected tools.
- Audio Creator view exposes expected media tools, including planned media capabilities.
- Viewer view is reduced to preview-safe tiles.
- Admin view still shows planned/admin-capable tools and Project Data controls.
- No console errors.
