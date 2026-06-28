# PR_26180_OWNER_004 Requirement Checklist

| Requirement | Result | Notes |
|---|---|---|
| Document proposed future layout `www/`, `api/`, `dev/` | PASS | Added to repository layout architecture plan. |
| Include deployment model | PASS | `www/` and `api/` deployable surfaces documented; `dev/` non-runtime. |
| Include browser/API/database flow | PASS | Browser -> API -> Postgres/R2 documented. |
| Include developer local-runtime flow | PASS | Developer command -> dev bootstrap -> local www/API flow documented. |
| Include migration strategy | PASS | Strategy and constraints documented. |
| Include stacked PR sequence | PASS | Eight-step proposed sequence documented. |
| Hard rule: no feature work mixed into migration | PASS | Documented. |
| Hard rule: runtime must never depend on `dev/` | PASS | Documented. |
| Hard rule: browser must never own authoritative product data | PASS | Documented. |
| Update `BACKLOG_MASTER.md` Owner planned item | PASS | Added Team/Product Area/Status/Percent/Next Milestone entry. |
| Increment Project Instructions version if ProjectInstructions changed | PASS | Version bumped to `2026.06.28.004`. |
| Do not move files | PASS | No file moves performed. |
| Do not modify runtime code | PASS | No runtime files changed. |
| Do not change `package.json` commands | PASS | `package.json` unchanged. |

