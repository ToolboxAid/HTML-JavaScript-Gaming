# PR_26128_014 Playwright Session Inspector V2 Shell Layout

## Command
`npm run test:workspace-v2`

## Result
PASS: 14/14 tests passed.

## Targeted Coverage
- Session Inspector V2 loads the shared V2 shell stylesheet.
- Header/details shell state enters and exits fullscreen.
- Fullscreen root expands to the viewport-width shell.
- Fullscreen layout uses the V2 side panel column pattern with 340px left and 360px right panels.
- `Return to Workspace` is present in the header frame.
- The controls accordion no longer contains a duplicate `Return to Workspace`.
- Session entry tiles have fixed 184px by 148px dimensions.
- Session entry tiles wrap left-to-right and top-to-bottom.
- Each tile contains its own Delete button.
- Per-entry Delete still removes the correct sessionStorage key and refreshes the tile list.
- Delete All still clears the displayed sessionStorage entries.
- Controls, Filters, Entries, Details, and Status accordions still open and close from header label and icon clicks.

## Skipped
Full samples smoke test was skipped as requested because this PR changes Session Inspector V2 shell and tile layout only, without touching sample JSON or sample runtime paths.
