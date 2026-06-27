#!/usr/bin/env node
import { runDatabaseMigrationLane } from "./database-migration-runner.mjs";

await runDatabaseMigrationLane({
  laneLabel: "database DML",
  migrationDirs: [
    {
      directory: "dev/docs_build/database/dml",
      type: "DML",
    },
  ],
});
