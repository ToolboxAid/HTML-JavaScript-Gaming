# Toolbox Tool Count And Group Name

Stack item: `PR_26155_024-toolbox-tool-count-and-group-name`

## Summary

- Added `Tool Count: <visible>/<total>` to the right of the Toolbox view controls.
- Tool count reflects the active role filter:
  - Guest: `30/42`
  - Creator: `30/42`
  - Admin: `42/42`
- Renamed the Toolbox group from `Assets` to `Content`.
- Kept the tool label `Assets`.

## Validation Notes

- Targeted static validation confirms the Tool Count slot exists.
- Targeted Playwright validation confirms Guest, Creator, and Admin counts.
- Targeted Playwright validation confirms the grouped view uses `Content` and no longer exposes an `Assets` group heading.
- Targeted Playwright validation confirms Arcade is absent from the Toolbox page.
- Targeted Playwright validation confirms no forbidden tool label suffix appears in active Toolbox tile labels.

## Manual Test Notes

- `/toolbox/index.html` shows Order A-Z, Group, Progress, Build Path, and Tool Count.
- Group view displays `Content` as the group heading.
- The `Assets` tool remains present as a tile inside the Content group.
