SQLite is deprecated.

Game Foundry Studio standard database:
PostgreSQL

Environment database model:
- DEV uses Local Docker PostgreSQL
- IST uses Local Docker PostgreSQL
- UAT uses Supabase PostgreSQL
- PRD uses Supabase PostgreSQL

Rules:
- No new SQLite implementations
- No new SQLite dependencies
- Existing SQLite references are technical debt
- New persistence work targets PostgreSQL
- PRs introducing SQLite should be rejected
