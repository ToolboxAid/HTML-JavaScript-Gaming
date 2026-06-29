# PR_26180_OWNER_018-move-src-browser-to-www Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Use PR017 src destination audit as source of truth | PASS | Moved only audit-classified browser/www-owned source buckets. |
| Move browser/www-owned src files into www/src | PASS | 501 staged renames into `www/src/`. |
| Preserve public browser import URLs such as /src/... | PASS | Static route check resolves public `/src/...` URLs into `www/src/...`. |
| Update references only where required | PASS | Active API/dev/test filesystem imports updated for moved browser modules. |
| Do not move API/server-owned files | PASS | API/server-owned root `src/shared/contracts`, schemas, and project data store remain for PR019. |
| Do not move dev-owned files | PASS | Dev-owned source remains for later PR020 scope. |
| Do not change product behavior | PASS | Migration preserves public URLs and route behavior. |
| Stop on ambiguous ownership | PASS | No ambiguous files were moved; remaining source buckets are documented for later PRs. |
| Stop if browser file depends directly on api runtime internals | PASS | No direct browser-to-`api/` import introduced. |
| Stop if preserving public URLs requires API/server behavior changes | PASS | Existing static web-root compatibility resolved routes without API behavior changes. |
| Required reports under dev/reports | PASS | Report bundle generated. |
| Required ZIP under dev/workspace/zips | PASS | `dev/workspace/zips/PR_26180_OWNER_018-move-src-browser-to-www_delta.zip` generated for this outcome. |
