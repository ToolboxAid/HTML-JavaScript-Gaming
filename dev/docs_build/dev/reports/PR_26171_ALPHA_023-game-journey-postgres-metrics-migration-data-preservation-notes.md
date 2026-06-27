# PR_26171_ALPHA_023 Migration And Data Preservation Notes

TEAM ownership: ALPHA.

Migration behavior:
- Active Game Journey completion metrics persistence now uses Postgres through `GAMEFOUNDRY_DATABASE_URL`.
- The legacy SQLite file path is treated as a data-preservation guard only.
- Existing legacy SQLite metrics data is preserved in place and is not deleted or overwritten.
- If the legacy file exists, the metrics store stops with an actionable diagnostic instead of silently replacing data with Postgres seed rows.
- No SQLite fallback is used after the Postgres path is active.

Operator action when legacy data exists:
- Export or migrate legacy metrics into Postgres.
- Verify the Postgres `game_journey_completion_metrics` table contains the expected rows.
- Move or archive the legacy SQLite file after verification.
- Restart the Local API.

Known local state:
- This workspace had an ignored legacy metrics file under `tmp/local-api/`; tests used injected Postgres stubs and disabled the legacy-path guard only for isolated validation.
