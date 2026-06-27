# PR_26174_ALFA_020-game-hub-idea-board-cleanup

## Summary

Updated Game Hub and Idea Board cleanup items for the Alfa stack.

## Changes

- Removed the Game Crew accordion from Game Hub and left the scoped game action surface.
- Stopped rendering the Source Idea child table when a game has no Source Idea context.
- Preserved the Readiness Output child table for expanded game rows.
- Moved Idea Board status filtering into the left-side top accordion.
- Marked Idea Board and Game Hub complete in the Project Instructions backlog.
- Reflected Idea Board and Game Hub completion in DB-backed toolbox metadata.
- Updated impacted Playwright expectations for the new child-row and status-filter behavior.

## Notes

- No API/service contract changes were made.
- No browser-owned product data or fallback arrays were added.
- The table-first parent/child pattern remains intact.
