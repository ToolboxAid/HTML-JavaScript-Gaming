#!/usr/bin/env node
import { runDatabaseMigrationLane } from "./database-migration-runner.mjs";

await runDatabaseMigrationLane({
  laneLabel: "database DDL",
  migrationDirs: [
    {
      directory: "dev/build/database/ddl",
      type: "DDL",
    },
  ],
});
