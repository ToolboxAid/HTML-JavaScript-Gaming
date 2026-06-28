#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createPostgresConnectionClient } from "../../api/persistence/postgres-connection-client.mjs";

const ENV_FILE = ".env";
const DDL_DIRECTORY = "dev/build/database/ddl";
const ACTION = "Run node .\\dev\\scripts\\apply-database-ddl.mjs against the current .env, then rerun drift validation.";
const REQUIRED_PLATFORM_SETTING_KEYS = Object.freeze([
  "platform.banner.enabled",
  "platform.banner.message",
  "platform.banner.tone",
]);

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

function parseColumnList(value) {
  return Array.from(String(value || "").matchAll(/"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*)/g))
    .map((match) => match[1] || normalizeIdentifier(match[2]))
    .filter(Boolean);
}

function parsePostgresArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "")).filter(Boolean);
  }
  const text = String(value || "").trim();
  if (!text || text === "{}") {
    return [];
  }
  return text
    .replace(/^\{|\}$/g, "")
    .split(",")
    .map((item) => item.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

function constraintSignature({ columns, foreignColumns = [], foreignTable = "", tableName, type }) {
  return [
    tableName,
    type,
    columns.join(","),
    foreignTable,
    foreignColumns.join(","),
  ].join(":");
}

function constraintLabel(constraint) {
  const columns = constraint.columns.join(", ");
  if (constraint.type === "foreign key") {
    return `${constraint.type} ${constraint.tableName}(${columns}) -> ${constraint.foreignTable}(${constraint.foreignColumns.join(", ")})`;
  }
  return `${constraint.type} ${constraint.tableName}(${columns})`;
}

function addConstraint(constraintMap, constraint) {
  const signature = constraintSignature(constraint);
  if (!constraintMap.has(signature)) {
    constraintMap.set(signature, {
      label: constraintLabel(constraint),
      source: constraint.source,
    });
  }
}

function readExpectedSchema() {
  const directory = path.resolve(process.cwd(), DDL_DIRECTORY);
  const constraintMap = new Map();
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
        if (!line) {
          return;
        }
        const namedUnique = line.match(/^CONSTRAINT\s+("[^"]+"|[A-Za-z_][A-Za-z0-9_]*)\s+UNIQUE\s*\(([^)]+)\)/i);
        if (namedUnique) {
          addConstraint(constraintMap, {
            columns: parseColumnList(namedUnique[2]),
            source: filePath,
            tableName,
            type: "unique",
          });
          return;
        }
        if (/^(CONSTRAINT|PRIMARY|UNIQUE|FOREIGN|CHECK)\b/i.test(line)) {
          return;
        }
        const columnMatch = line.match(/^"([^"]+)"/) || line.match(/^([A-Za-z_][A-Za-z0-9_]*)\b/);
        if (columnMatch) {
          const columnName = columnMatch[1];
          columns.add(columnName);
          if (/\bPRIMARY\s+KEY\b/i.test(line)) {
            addConstraint(constraintMap, {
              columns: [columnName],
              source: filePath,
              tableName,
              type: "primary key",
            });
          }
          if (/\bUNIQUE\b/i.test(line)) {
            addConstraint(constraintMap, {
              columns: [columnName],
              source: filePath,
              tableName,
              type: "unique",
            });
          }
          const foreignKey = line.match(/\bREFERENCES\s+("[^"]+"|[A-Za-z_][A-Za-z0-9_]*)\s*\(\s*("[^"]+"|[A-Za-z_][A-Za-z0-9_]*)\s*\)/i);
          if (foreignKey) {
            addConstraint(constraintMap, {
              columns: [columnName],
              foreignColumns: [normalizeIdentifier(foreignKey[2])],
              foreignTable: normalizeIdentifier(foreignKey[1]),
              source: filePath,
              tableName,
              type: "foreign key",
            });
          }
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
    constraints: constraintMap,
    indexes: indexMap,
    platformSettingKeys: new Set(REQUIRED_PLATFORM_SETTING_KEYS),
    tables: tableMap,
  };
}

function constraintType(contype) {
  if (contype === "p") {
    return "primary key";
  }
  if (contype === "u") {
    return "unique";
  }
  if (contype === "f") {
    return "foreign key";
  }
  return "";
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
  const constraintRows = await client.query(`
SELECT
  c.contype,
  rel.relname AS table_name,
  ARRAY(
    SELECT att.attname
    FROM unnest(c.conkey) WITH ORDINALITY AS cols(attnum, ord)
    JOIN pg_attribute att ON att.attrelid = c.conrelid AND att.attnum = cols.attnum
    ORDER BY cols.ord
  ) AS columns,
  frel.relname AS foreign_table,
  ARRAY(
    SELECT fatt.attname
    FROM unnest(c.confkey) WITH ORDINALITY AS cols(attnum, ord)
    JOIN pg_attribute fatt ON fatt.attrelid = c.confrelid AND fatt.attnum = cols.attnum
    ORDER BY cols.ord
  ) AS foreign_columns
FROM pg_constraint c
JOIN pg_class rel ON rel.oid = c.conrelid
JOIN pg_namespace ns ON ns.oid = rel.relnamespace
LEFT JOIN pg_class frel ON frel.oid = c.confrelid
WHERE ns.nspname = 'public' AND c.contype IN ('p', 'u', 'f');
`);
  const migrationRows = await client.query("SELECT count(*)::int AS count FROM schema_migrations;");
  const tableNames = new Set(tableRows.map((row) => row.table_name));
  const platformSettingRows = tableNames.has("platform_settings")
    ? await client.query('SELECT "settingKey" FROM platform_settings;')
    : [];
  const columnsByTable = new Map();
  columnRows.forEach((row) => {
    const tableName = row.table_name;
    const columns = columnsByTable.get(tableName) || new Set();
    columns.add(row.column_name);
    columnsByTable.set(tableName, columns);
  });
  return {
    columnsByTable,
    constraints: new Set(constraintRows
      .map((row) => ({
        columns: parsePostgresArray(row.columns),
        foreignColumns: parsePostgresArray(row.foreign_columns),
        foreignTable: row.foreign_table || "",
        tableName: row.table_name,
        type: constraintType(row.contype),
      }))
      .filter((constraint) => constraint.type)
      .map(constraintSignature)),
    indexes: new Set(indexRows.map((row) => row.indexname)),
    migrationCount: Number(migrationRows[0]?.count || 0),
    platformSettingKeys: new Set(platformSettingRows.map((row) => String(row.settingKey || ""))),
    tables: tableNames,
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
  expected.constraints.forEach((constraint, signature) => {
    if (!actual.constraints.has(signature)) {
      findings.push(`Missing constraint ${constraint.label} expected from ${constraint.source}. ${ACTION}`);
    }
  });
  expected.platformSettingKeys.forEach((settingKey) => {
    if (!actual.platformSettingKeys.has(settingKey)) {
      findings.push(`Missing platform_settings settingKey ${settingKey}. Run owner-approved DEV seed or server-side platform settings setup, then rerun drift validation.`);
    }
  });
  return findings;
}

function selfTest(expected) {
  const actual = {
    columnsByTable: new Map(),
    constraints: new Set(),
    indexes: new Set(),
    migrationCount: 0,
    platformSettingKeys: new Set(),
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
  console.log(`PASS - Expected DDL objects loaded from ${DDL_DIRECTORY}: tables=${expected.tables.size}; constraints=${expected.constraints.size}; indexes=${expected.indexes.size}; platform setting keys=${expected.platformSettingKeys.size}.`);
  console.log(`PASS - schema_migrations is the migration-state SSoT; applied records=${actual.migrationCount}.`);
  if (findings.length) {
    console.log(`FAIL - Database drift detected (${findings.length} finding(s)).`);
    findings.forEach((finding) => console.log(`FAIL - ${finding}`));
    process.exitCode = 1;
    return;
  }
  console.log("PASS - Database drift validation found no missing required tables, columns, indexes, constraints, or platform settings keys.");
}

await main();
