-- Game Foundry Studio DEV database DML / seed review
-- Group: Game Crew
-- Ownership: docs_build/database/dml/game-crew.sql
-- Runtime setup/seed operations for this group must run through server-side APIs.
-- Browser pages must not directly seed authoritative DB records.
-- Owned tables: project_members

-- DML status: Server-seed-owned.
-- The server/API layer generates all non-user keys and audit fields.
-- Direct SQL setup for this group remains deferred until a later migration-runner PR explicitly owns it.
