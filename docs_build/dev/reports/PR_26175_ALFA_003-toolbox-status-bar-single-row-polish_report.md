# PR_26175_ALFA_003-toolbox-status-bar-single-row-polish Report

## Summary
Updated the shared toolbox status bar to a single-row creator context bar.

## Changes
- Removed visible selected-game labels, selected-game purpose, status category pills, and status action links from the status bar.
- Kept the visible status bar contract to selected game name on the left and current status message in the center.
- Preserved Game Hub ownership of selected-game context and Idea Board selected-game filtering exclusion.
- Preserved normal placement above the footer.
- Preserved fullscreen bottom anchoring and reserved the status-bar height for the fullscreen center tool area.
- Updated targeted Playwright coverage for removed labels, visible game/message text, same-row layout, and fullscreen center-panel bounds.

## Contract Notes
- No API/service contract changes were made.
- No browser-owned product data is used as selected-game source of truth.
- Environment/server details remain outside the status bar.
- Theme V2 shared CSS/classes remain the styling surface.
