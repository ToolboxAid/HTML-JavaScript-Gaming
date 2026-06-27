# PR_26171_ALPHA_023 Manual Validation Notes

TEAM ownership: ALPHA.

Manual validation performed:
- Confirmed Game Journey completion metrics dashboard renders through the Local API with a Postgres client stub.
- Confirmed `/api/game-journey/completion-metrics` returns `databaseEngine: "Postgres"` and the existing 14 completion metric records.
- Confirmed updating `001-idea` persists through the Postgres stub and returns `updatedMetric`.
- Confirmed missing Postgres configuration reports `GAMEFOUNDRY_DATABASE_URL`.
- Confirmed legacy SQLite data guard blocks startup without deleting the legacy file.

Expected outcome:
- Game Journey completion metrics preserve user-visible behavior and response shapes.
- Active metrics persistence no longer depends on `node:sqlite` or `DatabaseSync`.
- Legacy SQLite data cannot be silently dropped during cutover.

Out of scope:
- Full samples smoke.
- Broad Game Journey editor/detail regression tests.
- Live Postgres connectivity against an operator database.
