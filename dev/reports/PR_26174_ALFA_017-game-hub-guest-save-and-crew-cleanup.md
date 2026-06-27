# PR_26174_ALFA_017-game-hub-guest-save-and-crew-cleanup

## Summary

Updated Game Hub parent table and save behavior for the ALFA_017 stack item.

## Implementation

- Guest Add/Edit rows remain reachable for browsing, but Add and Edit Save buttons redirect to `account/sign-in.html`.
- Renamed the current role side control area to a `Game Crew` accordion.
- Removed Owner from displayed parent table headers, parent rows, add rows, edit rows, and expanded row colspan.
- Kept parent game rows with Source Idea and Readiness Output child rows/tables.
- Removed the instructional copy from the center panel.
- Matched parent table action buttons to compact game button sizing.

## Scope Control

- Preserved existing API/service contract.
- Did not add browser-owned product data.
- Did not add readiness math.
- Did not modify table-first governance content.

## ZIP

- `tmp/PR_26174_ALFA_017-game-hub-guest-save-and-crew-cleanup_delta.zip`
