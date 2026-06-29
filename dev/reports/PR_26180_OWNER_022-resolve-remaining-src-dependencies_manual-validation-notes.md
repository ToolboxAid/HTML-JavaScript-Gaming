# Manual Validation Notes - PR_26180_OWNER_022-resolve-remaining-src-dependencies

- No manual browser route validation was required because public URLs and product behavior were not changed.
- `www/toolbox/toolRegistry.js` import smoke returned 47 tools after the path correction.
- Full `src/` retirement remains out of scope.
- `-v2` contracts and manifest/sample schemas remain root `src` transition files because active validation still references them.
