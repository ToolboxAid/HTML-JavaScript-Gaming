#!/usr/bin/env node
import { runDatabaseMigrationLane } from "./database-migration-runner.mjs";

await runDatabaseMigrationLane({
  laneLabel: "database DDL",
  migrationDirs: [
    {
      directory: "dev/docs_build/database/ddl",
      type: "DDL",
    },
  ],
});
