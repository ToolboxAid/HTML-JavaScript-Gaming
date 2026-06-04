# PR_26155_028 Toolbox Create Build Content Split

## Summary

- Reworked active Toolbox groups to: Create, Build, Content, Media, Test, Share, Account.
- Removed Admin as a Toolbox group.
- Kept one top-level Admin navigation area in the shared header.
- Removed the stale Toolbox Learn route so Learn remains a top-level site navigation item.
- Kept Arcade out of Toolbox.

## Grouping

- Create: Objects, Characters, Worlds, Animations, AI Assistant.
- Build: Project Workspace, Game Design, Game Configuration, Build Game, Custom Extensions.
- Content: Assets, Colors, Fonts, Sprites.
- Media: Audio, Music, Voices, Videos, MIDI, Particles, Audio Effects, Voice Capture, Voice Output.
- Test: Game Testing, Controls, Hitboxes, Debug, Performance, Events.
- Share: Publish, Marketplace, Community, Languages, Cloud.
- Account: Saved Data, Achievements, Ratings.

## Admin And Learn

- Admin-only Toolbox group entries were removed from the Toolbox renderer and registry.
- Environments, Game Migration, and Platform Settings are exposed only through the top-level Admin navigation.
- Users already had a top-level Admin destination at `admin/users.html`; the old `toolbox/users/` shell is not exposed as an active Toolbox item.
- Learn is exposed through top-level `learn/index.html`, not as a Toolbox tile or Toolbox submenu item.

## Child Capabilities

- Worlds preserves child capability text: Vector, Tilemap, Isometric, Hex.
- These remain beneath Worlds and are not top-level Toolbox groups.

## Validation Notes

- `node scripts/validate-active-tools-surface.mjs`: PASS, 37 active Toolbox tools.
- `node scripts/validate-tool-registry.mjs`: PASS.
- `npm run test:workspace-v2`: PASS, 3 Playwright tests.
- `git diff --check`: PASS.

## Manual Test Notes

- Confirmed Toolbox view controls remain visible.
- Confirmed Assets renders under Content.
- Confirmed Learn is top-level navigation only.
- Confirmed Admin is not duplicated under Toolbox.
- Confirmed Arcade is absent from Toolbox.
- Confirmed no forbidden product suffix label appears in changed active Toolbox or Learn surfaces.
