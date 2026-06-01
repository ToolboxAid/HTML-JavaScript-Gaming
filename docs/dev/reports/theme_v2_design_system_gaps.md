# Theme V2 Design System Gaps

Task: PR_26152_023-theme-v2-home-migration

Migration order:
1. Home
2. Company
3. Admin
4. Account
5. Tools
6. Games
7. Samples

Discovered gaps:

## Elevation and Effects Ownership

- Gap: The approved Theme V2 ownership list does not include a dedicated elevation, effects, or shadow file.
- Affected surfaces: Home, and likely future Company/Admin/Account/Tools migrations that use shared card, panel, header, menu, and footer shadows.
- Current handling: Existing reusable shadow tokens were kept inside `spacing.css` because no additional CSS location is approved.
- Follow-up plan: Confirm whether elevation/effects tokens remain in `spacing.css` or whether a future governance PR should approve a dedicated Theme V2 ownership file.
- Local workaround used: None.

## Legacy Home Class Names

- Gap: Home currently uses existing page-era class names such as `hero`, `trending-grid`, `game-tile`, `check-panel`, and `cta`.
- Affected surfaces: Home now; future Company and landing-style pages may want more explicitly reusable Theme V2 component names.
- Current handling: Existing class names were preserved to keep Home visually stable and avoid redesigning markup in this migration PR.
- Follow-up plan: During Company page migration, decide whether these landing-page patterns should keep the current reusable names or receive approved Theme V2 component names.
- Local workaround used: None.

No blocking design-system gaps were found for the Home migration.
