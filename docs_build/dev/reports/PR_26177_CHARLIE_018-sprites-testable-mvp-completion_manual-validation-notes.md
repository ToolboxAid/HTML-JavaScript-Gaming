# Manual Validation Notes

PR: PR_26177_CHARLIE_018-sprites-testable-mvp-completion

Status: PASS

## Manual Test Steps

1. Start the local API/site server.
2. Open `/toolbox/index.html`.
3. Confirm the Sprites card is visible without enabling Planned tools.
4. Click Sprites and confirm navigation to `/toolbox/sprites/index.html`.
5. Confirm the Sprites table, summary cards, filters, preview, metadata, references, and validation panels render.
6. Click `Add Sprite`.
7. Enter `Hero Sprite`.
8. Select category `Character`.
9. Save and confirm a row appears with status `Ready`.
10. Click `Edit`, change the name to `Hero Sprite Revised`, choose category `Icon`, and save.
11. Search for `revised` and confirm only the matching sprite remains visible.
12. Filter category `Icon` and confirm the matching sprite remains visible.
13. Click `Archive` and confirm status changes to `Archived`.
14. Confirm the metadata panel shows key, file/source details, size/dimensions unavailable where appropriate, palette color key, updated by, and updated at.
15. Confirm the reference panel says destructive delete is disabled until Object/World reference contracts are available.
16. Sign out or set a guest session.
17. Open `/toolbox/sprites/index.html`, click `Add Sprite`, enter a name, and save.
18. Confirm the browser redirects to `/account/sign-in.html`.
19. Confirm Palette/Colors references are shown by key only and no Sprites-owned reusable color definitions are present.

## Manual Notes

- Preview is intentionally metadata-safe until storage/image byte preview integration is available.
- Palette/Colors empty state is explicit when no reusable color records are available.
- Destructive delete is intentionally unavailable; archive is the supported MVP lifecycle operation.
