# PR_26180_OWNER_012 Manual Validation Notes

## Manual Review

- Confirmed `package.json` still exposes:
  - `npm run dev:bootstrap`
  - `npm run dev:api`
  - `npm run dev:web`
  - `npm run dev:local-api`
- Confirmed GitHub Actions platform validation now calls a package script instead of hardcoding the runner path.
- Confirmed developer scripts use current `www/games/` and `www/toolbox/` assumptions where they route or report moved browser-served paths.
- Confirmed no `www/` or `api/` files were moved.
- Confirmed no production page, API route, database, or product runtime behavior was modified.

## Notes For Reviewer

This PR is infrastructure-path maintenance for the layout migration stack. It should be reviewed after PR011 and before the legacy-layout retirement PR.
