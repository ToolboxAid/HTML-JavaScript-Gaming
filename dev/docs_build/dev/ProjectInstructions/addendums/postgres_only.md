SQLite is deprecated/retired and is not an active runtime database.

Game Foundry Studio standard database:
PostgreSQL

Rules:
- No new SQLite implementations
- No new SQLite dependencies
- Existing SQLite references are technical debt
- New persistence work targets PostgreSQL/Postgres
- Local (VS Code), DEV, IST, UAT, and PROD runtime database work targets Postgres
- PRs introducing SQLite should be rejected
