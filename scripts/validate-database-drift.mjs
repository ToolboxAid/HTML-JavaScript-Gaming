#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createPostgresConnectionClient } from "../src/dev-runtime/persistence/postgres-connection-client.mjs";

const ENV_FILE = ".env";
const DDL_DIRECTORY = "docs_build/database/ddl";
const ACTION = "Run node .\\scripts\\apply-database-ddl.mjs against the current .env, then rerun drift validation.";

function parseEnvValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ENV_FILE);
  if (!fs.existsSync(envPath)) {
    throw new Error(`${ENV_FILE} was not found; drift validation uses the same runtime env file.`);
  }
  const loadedKeys = [];
  fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex <= 0) {
      return;
    }
    const key = normalized.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      return;
    }
    if (process.env[key] !== undefined) {
      return;
    }
    process.env[key] = parseEnvValue(normalized.slice(separatorIndex + 1));
    loadedKeys.push(key);
  });
  return loadedKeys.sort();
}

function normalizeIdentifier(value) {
  const trimmed = String(value || "").trim();
  if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
    return trimmed.slice(1, -1);
  }
  return trimmed.toLowerCase();
}

function readExpectedSchema() {
  const directory = path.resolve(process.cwd(), DDL_DIRECTORY);
  const tableMap = new Map();
  const indexMap = new Map();
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".sql")) {
      continue;
    }
    const filePath = `${DDL_DIRECTORY}/${entry.name}`;
    const sql = fs.readFileSync(path.join(directory, entry.name), "utf8");
    const tablePattern = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+("[^"]+"|[A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*?)\);/gi;
    for (const match of sql.matchAll(tablePattern)) {
      const tableName = normalizeIdentifier(match[1]);
      const columns = new Set();
      match[2].split(/\r?\n/).forEach((rawLine) => {
        const line = rawLine.trim().replace(/,$/, "");
        if (!line || /^(CONSTRAINT|PRIMARY|UNIQUE|FOREIGN|CHECK)\b/i.test(line)) {
          return;
        }
        const columnMatch = line.match(/^"([^"]+)"/) || line.match(/^([A-Za-z_][A-Za-z0-9_]*)\b/);
        if (columnMatch) {
          columns.add(columnMatch[1]);
        }
      });
      tableMap.set(tableName, {
        columns,
        source: filePath,
      });
    }
    const indexPattern = /CREATE\s+(?:UNIQUE\s+)?INDEX\s+IF\s+NOT\s+EXISTS\s+("[^"]+"|[A-Za-z_][A-Za-z0-9_]*)\s+ON\s+("[^"]+"|[A-Za-z_][A-Za-z0-9_]*)/gi;
    for (const match of sql.matchAll(indexPattern)) {
      const indexName = normalizeIdentifier(match[1]);
      indexMap.set(indexName, {
        source: filePath,
        tableName: normalizeIdentifier(match[2]),
      });
    }
  }
  return {
    indexes: indexMap,
    tables: tableMap,
  };
}

async function readActualSchema() {
  const client = createPostgresConnectionClient();
  const tableRows = await client.query(`
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
`);
  const columnRows = await client.query(`
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public';
`);
  const indexRows = await client.query(`
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';
`);
  const migrationRows = await client.query("SELECT count(*)::int AS count FROM schema_migrations;");
  const columnsByTable = new Map();
  columnRows.forEach((row) => {
    const tableName = row.table_name;
    const columns = columnsByTable.get(tableName) || new Set();
    columns.add(row.column_name);
    columnsByTable.set(tableName, columns);
  });
  return {
    columnsByTable,
    indexes: new Set(indexRows.map((row) => row.indexname)),
    migrationCount: Number(migrationRows[0]?.count || 0),
    tables: new Set(tableRows.map((row) => row.table_name)),
  };
}

function compareSchema(expected, actual) {
  const findings = [];
  expected.tables.forEach((table, tableName) => {
    if (!actual.tables.has(tableName)) {
      findings.push(`Missing table ${tableName} expected from ${table.source}. ${ACTION}`);
      return;
    }
    const actualColumns = actual.columnsByTable.get(tableName) || new Set();
    table.columns.forEach((columnName) => {
      if (!actualColumns.has(columnName)) {
        findings.push(`Missing column ${tableName}.${columnName} expected from ${table.source}. ${ACTION}`);
      }
    });
  });
  expected.indexes.forEach((index, indexName) => {
    if (!actual.indexes.has(indexName)) {
      findings.push(`Missing index ${indexName} on ${index.tableName} expected from ${index.source}. ${ACTION}`);
    }
  });
  return findings;
}

function selfTest(expected) {
  const actual = {
    columnsByTable: new Map(),
    indexes: new Set(),
    migrationCount: 0,
    tables: new Set(),
  };
  const findings = compareSchema(expected, actual);
  if (!findings.length) {
    throw new Error("Diagnostic self-test did not produce a missing-object finding.");
  }
  console.log("PASS - Missing/changed schema diagnostic self-test produced actionable output.");
  console.log(`PASS - Example diagnostic: ${findings[0]}`);
}

async function main() {
  const expected = readExpectedSchema();
  if (process.argv.includes("--diagnostic-self-test")) {
    selfTest(expected);
    return;
  }
  const loadedKeys = loadEnvFile();
  const actual = await readActualSchema();
  const findings = compareSchema(expected, actual);
  console.log(`PASS - .env loaded for database drift validation (${loadedKeys.length} key(s) applied).`);
  console.log(`PASS - Expected DDL objects loaded from ${DDL_DIRECTORY}: tables=${expected.tables.size}; indexes=${expected.indexes.size}.`);
  console.log(`PASS - schema_migrations is the migration-state SSoT; applied records=${actual.migrationCount}.`);
  if (findings.length) {
    console.log(`FAIL - Database drift detected (${findings.length} finding(s)).`);
    findings.forEach((finding) => console.log(`FAIL - ${finding}`));
    process.exitCode = 1;
    return;
  }
  console.log("PASS - Database drift validation found no missing required tables, columns, or indexes.");
}

await main();
