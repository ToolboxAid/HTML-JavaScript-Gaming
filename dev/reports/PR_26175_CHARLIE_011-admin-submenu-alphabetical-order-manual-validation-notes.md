# PR_26175_CHARLIE_011 Manual Validation Notes

## Admin Submenu Order

Visible labels after the change:

`Admin Tools`, `Analytics`, `Controls`, `Creators`, `DB Viewer`, `Environments`, `Game Migration`, `Infrastructure`, `Invites`, `Moderation`, `Operations`, `Platform Settings`, `Ratings`, `Responsibilities`, `Site Setup`, `System Health`, `Tool Votes`

## Route Preservation

The only source navigation reorder moved this existing item:

- `Creators`
  - path remained `admin/users.html`
  - route remained `admin-users`
  - label remained `Creators`

All other Admin navigation objects remained unchanged.

## Open-Page Check

The targeted Playwright navigation test collected every active Admin submenu href from the rendered submenu and requested each page through the local test server. Every response returned a status below HTTP 400.

## Duplicate Check

The targeted Playwright navigation test checks for duplicate rendered labels and duplicate active hrefs. The targeted unit script also checks duplicate labels and existing active paths.
