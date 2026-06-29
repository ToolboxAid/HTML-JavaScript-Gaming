#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "docs", "dev", "reports");
const SCHEMA_ROOTS = [
  path.join(ROOT, "www", "src", "shared", "schemas"),
  path.join(ROOT, "src", "shared", "schemas")
];
const DEPRECATED_GAME_TOOL_IDS = new Set(["asset-browser", "palette-browser", "vector-map-editor"]);

function parseArgs(argv) {
  const args = {
    mode: "all",
    ci: false,
    details: false,
    reportDir: REPORT_DIR
  };
  for (let i = 2; i < argv.length; i += 1) {
    const token = String(argv[i] || "").trim();
    if (!token) {
      continue;
    }
    if (token === "--ci" || token === "-Ci") {
      args.ci = true;
      continue;
    }
    if (token === "--details" || token === "-Details") {
      args.details = true;
      continue;
    }
    if (token.startsWith("--mode=")) {
      args.mode = token.slice("--mode=".length);
      continue;
    }
    if (token === "--mode" && i + 1 < argv.length) {
      args.mode = String(argv[i + 1] || "").trim();
      i += 1;
      continue;
    }
    if (token.startsWith("--reportDir=")) {
      args.reportDir = path.resolve(ROOT, token.slice("--reportDir=".length));
      continue;
    }
    if (token === "--reportDir" && i + 1 < argv.length) {
      args.reportDir = path.resolve(ROOT, String(argv[i + 1] || "").trim());
      i += 1;
      continue;
    }
  }
  return args;
}

function normalizeRel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function walkFiles(baseDir, matcher) {
  const output = [];
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if ([".git", "node_modules", "tmp", "dist", "build", "coverage", ".cache", ".next"].includes(entry.name)) {
          continue;
        }
        walk(full);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      if (matcher(full)) {
        output.push(full);
      }
    }
  }
  if (fs.existsSync(baseDir)) {
    walk(baseDir);
  }
  return output;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function writeCsv(filePath, columns, rows) {
  const lines = [];
  lines.push(columns.join(","));
  rows.forEach((row) => {
    lines.push(columns.map((col) => csvEscape(row[col] ?? "")).join(","));
  });
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function buildSchemaIndex() {
  const schemaFiles = SCHEMA_ROOTS.flatMap((schemaRoot) => walkFiles(schemaRoot, (filePath) => filePath.endsWith(".json")));
  const schemaIndex = new Map();
  schemaFiles.forEach((filePath) => {
    const rel = normalizeRel(filePath);
    const parsed = readJsonSafe(filePath);
    if (parsed) {
      schemaIndex.set(rel, parsed);
    }
  });
  return schemaIndex;
}

function resolveJsonPointer(document, pointer) {
  if (!pointer || pointer === "#") {
    return document;
  }
  if (!pointer.startsWith("#/")) {
    return undefined;
  }
  const parts = pointer.slice(2).split("/").map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));
  let current = document;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function resolveRef(currentSchemaPath, schemaNode, schemaIndex) {
  const ref = String(schemaNode.$ref || "").trim();
  if (!ref) {
    return null;
  }
  const [rawTargetPath, rawPointer] = ref.split("#");
  if (!rawTargetPath) {
    const base = schemaIndex.get(currentSchemaPath);
    if (!base) {
      return null;
    }
    const pointer = rawPointer ? `#${rawPointer}` : "#";
    const resolved = resolveJsonPointer(base, pointer);
    return resolved ? { schema: resolved, schemaPath: currentSchemaPath } : null;
  }
  const targetPath = path.normalize(path.join(path.dirname(currentSchemaPath), rawTargetPath)).replace(/\\/g, "/");
  const target = schemaIndex.get(targetPath);
  if (!target) {
    return null;
  }
  const pointer = rawPointer ? `#${rawPointer}` : "#";
  const resolved = resolveJsonPointer(target, pointer);
  return resolved ? { schema: resolved, schemaPath: targetPath } : null;
}

function makeValidator(schemaIndex) {
  function matchesSchemaType(nodeValue, schemaType) {
    if (schemaType === "object") {
      return isPlainObject(nodeValue);
    }
    if (schemaType === "array") {
      return Array.isArray(nodeValue);
    }
    if (schemaType === "string") {
      return typeof nodeValue === "string";
    }
    if (schemaType === "integer") {
      return Number.isInteger(nodeValue);
    }
    if (schemaType === "number") {
      return typeof nodeValue === "number" && !Number.isNaN(nodeValue);
    }
    if (schemaType === "boolean") {
      return typeof nodeValue === "boolean";
    }
    if (schemaType === "null") {
      return nodeValue === null;
    }
    return true;
  }

  function validate(value, schemaNode, schemaPath, pointer = "$") {
    const errors = [];

    function validateNode(nodeValue, nodeSchema, nodeSchemaPath, nodePointer) {
      if (!isPlainObject(nodeSchema)) {
        return;
      }

      if (typeof nodeSchema.$ref === "string") {
        const resolved = resolveRef(nodeSchemaPath, nodeSchema, schemaIndex);
        if (!resolved) {
          errors.push(`${nodePointer}: unresolved $ref ${nodeSchema.$ref}`);
          return;
        }
        validateNode(nodeValue, resolved.schema, resolved.schemaPath, nodePointer);
        return;
      }

      if (Array.isArray(nodeSchema.oneOf) && nodeSchema.oneOf.length > 0) {
        const branchMatches = nodeSchema.oneOf.filter((branch) => validate(nodeValue, branch, nodeSchemaPath, nodePointer).length === 0);
        if (branchMatches.length !== 1) {
          errors.push(`${nodePointer}: value must satisfy exactly one oneOf branch`);
        }
        return;
      }

      if (Array.isArray(nodeSchema.anyOf) && nodeSchema.anyOf.length > 0) {
        const branchMatches = nodeSchema.anyOf.some((branch) => validate(nodeValue, branch, nodeSchemaPath, nodePointer).length === 0);
        if (!branchMatches) {
          errors.push(`${nodePointer}: value must satisfy at least one anyOf branch`);
        }
        return;
      }

      if (Array.isArray(nodeSchema.allOf) && nodeSchema.allOf.length > 0) {
        nodeSchema.allOf.forEach((branch) => validateNode(nodeValue, branch, nodeSchemaPath, nodePointer));
        return;
      }

      if (isPlainObject(nodeSchema.not)) {
        const notErrors = validate(nodeValue, nodeSchema.not, nodeSchemaPath, nodePointer);
        if (notErrors.length === 0) {
          errors.push(`${nodePointer}: value must not satisfy disallowed schema`);
        }
        return;
      }

      if (Object.prototype.hasOwnProperty.call(nodeSchema, "const") && nodeValue !== nodeSchema.const) {
        errors.push(`${nodePointer}: expected const ${JSON.stringify(nodeSchema.const)}`);
        return;
      }

      if (Array.isArray(nodeSchema.enum) && !nodeSchema.enum.includes(nodeValue)) {
        errors.push(`${nodePointer}: value is not in enum`);
        return;
      }

      const inferredObjectSchema = !Object.prototype.hasOwnProperty.call(nodeSchema, "type")
        && (Array.isArray(nodeSchema.required)
          || isPlainObject(nodeSchema.properties)
          || isPlainObject(nodeSchema.patternProperties)
          || isPlainObject(nodeSchema.propertyNames)
          || Object.prototype.hasOwnProperty.call(nodeSchema, "additionalProperties"));
      const schemaTypes = Array.isArray(nodeSchema.type)
        ? nodeSchema.type.filter((entry) => typeof entry === "string")
        : (typeof nodeSchema.type === "string" ? [nodeSchema.type] : []);
      const schemaType = schemaTypes[0] || (inferredObjectSchema ? "object" : "");
      if (schemaTypes.length > 1 && !schemaTypes.some((candidate) => matchesSchemaType(nodeValue, candidate))) {
        errors.push(`${nodePointer}: value does not match any allowed schema types`);
        return;
      }

      if (!schemaType) {
        return;
      }

      if (schemaType === "object") {
        if (!isPlainObject(nodeValue)) {
          if (inferredObjectSchema) {
            return;
          }
          errors.push(`${nodePointer}: expected object`);
          return;
        }

        const required = Array.isArray(nodeSchema.required) ? nodeSchema.required : [];
        required.forEach((key) => {
          if (!Object.prototype.hasOwnProperty.call(nodeValue, key)) {
            errors.push(`${nodePointer}: missing required key "${key}"`);
          }
        });

        const properties = isPlainObject(nodeSchema.properties) ? nodeSchema.properties : {};
        const patternProperties = isPlainObject(nodeSchema.patternProperties) ? nodeSchema.patternProperties : {};
        const propertyNamesSchema = isPlainObject(nodeSchema.propertyNames) ? nodeSchema.propertyNames : null;

        Object.keys(nodeValue).forEach((key) => {
          const childPointer = `${nodePointer}.${key}`;

          if (propertyNamesSchema) {
            const propNameErrors = validate(key, propertyNamesSchema, nodeSchemaPath, `${nodePointer}#propertyName(${key})`);
            if (propNameErrors.length > 0) {
              errors.push(`${nodePointer}: property name "${key}" is not allowed by propertyNames`);
              return;
            }
          }

          if (Object.prototype.hasOwnProperty.call(properties, key)) {
            validateNode(nodeValue[key], properties[key], nodeSchemaPath, childPointer);
            return;
          }

          let matchedPattern = null;
          for (const pattern of Object.keys(patternProperties)) {
            try {
              if (new RegExp(pattern).test(key)) {
                matchedPattern = pattern;
                break;
              }
            } catch {
              // ignore invalid regex entries in scan mode
            }
          }
          if (matchedPattern) {
            validateNode(nodeValue[key], patternProperties[matchedPattern], nodeSchemaPath, childPointer);
            return;
          }

          if (nodeSchema.additionalProperties === false) {
            errors.push(`${nodePointer}: unknown key "${key}"`);
            return;
          }

          if (isPlainObject(nodeSchema.additionalProperties)) {
            validateNode(nodeValue[key], nodeSchema.additionalProperties, nodeSchemaPath, childPointer);
          }
        });
        return;
      }

      if (schemaType === "array") {
        if (!Array.isArray(nodeValue)) {
          errors.push(`${nodePointer}: expected array`);
          return;
        }
        if (isPlainObject(nodeSchema.items)) {
          nodeValue.forEach((item, index) => {
            validateNode(item, nodeSchema.items, nodeSchemaPath, `${nodePointer}[${index}]`);
          });
        }
        return;
      }

      if (schemaType === "string") {
        if (typeof nodeValue !== "string") {
          errors.push(`${nodePointer}: expected string`);
          return;
        }
        if (Number.isInteger(nodeSchema.minLength) && nodeValue.length < nodeSchema.minLength) {
          errors.push(`${nodePointer}: string shorter than minLength=${nodeSchema.minLength}`);
        }
        if (typeof nodeSchema.pattern === "string") {
          try {
            if (!new RegExp(nodeSchema.pattern).test(nodeValue)) {
              errors.push(`${nodePointer}: string does not match pattern`);
            }
          } catch {
            errors.push(`${nodePointer}: invalid schema regex pattern`);
          }
        }
        return;
      }

      if (schemaType === "integer") {
        if (!Number.isInteger(nodeValue)) {
          errors.push(`${nodePointer}: expected integer`);
          return;
        }
        if (typeof nodeSchema.minimum === "number" && nodeValue < nodeSchema.minimum) {
          errors.push(`${nodePointer}: value below minimum=${nodeSchema.minimum}`);
        }
        return;
      }

      if (schemaType === "number") {
        if (typeof nodeValue !== "number" || Number.isNaN(nodeValue)) {
          errors.push(`${nodePointer}: expected number`);
          return;
        }
        if (typeof nodeSchema.minimum === "number" && nodeValue < nodeSchema.minimum) {
          errors.push(`${nodePointer}: value below minimum=${nodeSchema.minimum}`);
        }
        return;
      }

      if (schemaType === "boolean") {
        if (typeof nodeValue !== "boolean") {
          errors.push(`${nodePointer}: expected boolean`);
        }
        return;
      }

      if (schemaType === "null") {
        if (nodeValue !== null) {
          errors.push(`${nodePointer}: expected null`);
        }
      }
    }

    validateNode(value, schemaNode, schemaPath, pointer);
    return errors;
  }

  return validate;
}

function collectSchemaStrictnessInventory(schemaIndex) {
  const rows = [];

  function walkNode(node, schemaPath, pointer = "#") {
    if (Array.isArray(node)) {
      node.forEach((entry, index) => walkNode(entry, schemaPath, `${pointer}/${index}`));
      return;
    }
    if (!isPlainObject(node)) {
      return;
    }

    if (node.type === "object") {
      if (!Object.prototype.hasOwnProperty.call(node, "additionalProperties")) {
        rows.push({
          schemaPath,
          jsonPointer: pointer,
          currentAdditionalProperties: "missing",
          looseReason: "missing additionalProperties on object schema",
          action: "set additionalProperties false or typed dictionary"
        });
      } else if (node.additionalProperties === true) {
        rows.push({
          schemaPath,
          jsonPointer: pointer,
          currentAdditionalProperties: "true",
          looseReason: "unknown fields explicitly allowed",
          action: "replace with false or typed dictionary schema"
        });
      }

      const hasStructuredFields = isPlainObject(node.properties) || isPlainObject(node.patternProperties);
      if (!hasStructuredFields && node.additionalProperties === false) {
        rows.push({
          schemaPath,
          jsonPointer: pointer,
          currentAdditionalProperties: "false",
          looseReason: "untyped object with no properties/patternProperties",
          action: "define explicit properties or typed map contract"
        });
      }
    }

    if (typeof node.$ref === "string" && /jsonValue$/i.test(node.$ref)) {
      rows.push({
        schemaPath,
        jsonPointer: pointer,
        currentAdditionalProperties: "n/a",
        looseReason: "broad jsonValue escape hatch",
        action: "replace with typed payload schema where repo-owned"
      });
    }

    if (isPlainObject(node.patternProperties) && Object.prototype.hasOwnProperty.call(node.patternProperties, "^.*$")) {
      const patNode = node.patternProperties["^.*$"];
      if (isPlainObject(patNode) && typeof patNode.$ref === "string" && /jsonValue$/i.test(patNode.$ref)) {
        rows.push({
          schemaPath,
          jsonPointer: `${pointer}/patternProperties/^.*$`,
          currentAdditionalProperties: "pattern:^.*$",
          looseReason: "open-ended dictionary with jsonValue",
          action: "narrow key pattern and value schema"
        });
      }
    }

    Object.entries(node).forEach(([key, value]) => walkNode(value, schemaPath, `${pointer}/${key.replace(/~/g, "~0").replace(/\//g, "~1")}`));
  }

  for (const [schemaPath, schemaNode] of schemaIndex.entries()) {
    walkNode(schemaNode, schemaPath);
  }

  rows.sort((a, b) => `${a.schemaPath} ${a.jsonPointer}`.localeCompare(`${b.schemaPath} ${b.jsonPointer}`));
  return rows;
}

function schemaPathForToolId(toolId) {
  const normalized = String(toolId || "").trim().toLowerCase();
  if (!normalized) {
    return "";
  }
  return `www/src/shared/schemas/tools/${normalized}.schema.json`;
}

function validateToolPayloadShallow(toolId, payload, schema, pointer) {
  const errors = [];
  if (!isPlainObject(payload)) {
    errors.push(`${pointer} must be an object`);
    return errors;
  }
  const rootProps = isPlainObject(schema?.properties) ? schema.properties : {};
  const requiredRoot = new Set(Array.isArray(schema?.required) ? schema.required : []);

  Object.keys(payload).forEach((key) => {
    if (!(key in rootProps)) {
      errors.push(`${pointer}.${key} is not allowed by schema`);
    }
  });
  requiredRoot.forEach((key) => {
    if (!(key in payload)) {
      errors.push(`${pointer}.${key} is required`);
    }
  });
  Object.entries(rootProps).forEach(([key, propertySchema]) => {
    if (isPlainObject(propertySchema) && Object.prototype.hasOwnProperty.call(propertySchema, "const") && key in payload && payload[key] !== propertySchema.const) {
      errors.push(`${pointer}.${key} must equal ${propertySchema.const}`);
    }
  });

  const expectedToolConst = schema?.properties?.tool?.const;
  if (typeof expectedToolConst === "string" && payload.tool !== expectedToolConst) {
    errors.push(`${pointer}.tool must equal ${expectedToolConst}`);
  }
  if (!Object.prototype.hasOwnProperty.call(rootProps, "payload")) {
    return errors;
  }

  if (!isPlainObject(payload.payload)) {
    errors.push(`${pointer}.payload must be an object`);
    return errors;
  }

  const payloadSchema = rootProps.payload;
  const payloadProps = isPlainObject(payloadSchema?.properties) ? payloadSchema.properties : {};
  const payloadRequired = new Set(Array.isArray(payloadSchema?.required) ? payloadSchema.required : []);
  Object.keys(payload.payload).forEach((key) => {
    if (!(key in payloadProps)) {
      errors.push(`${pointer}.payload.${key} is not allowed by schema`);
    }
  });
  payloadRequired.forEach((key) => {
    if (!(key in payload.payload)) {
      errors.push(`${pointer}.payload.${key} is required`);
    }
  });

  return errors;
}

function validateSamples(schemaIndex, validate) {
  const sampleFiles = walkFiles(path.join(ROOT, "samples"), (filePath) => filePath.endsWith(".json"));
  const rows = [];

  sampleFiles.forEach((filePath) => {
    const rel = normalizeRel(filePath);
    const document = readJsonSafe(filePath);
    if (!document) {
      rows.push({ filePath: rel, schemaPath: "", status: "invalid-json", errorCount: 1, firstErrors: "parse failed", note: "" });
      return;
    }

    let schemaPath = "";
    const isWorkspaceManifest = String(document?.schema || "").trim().toLowerCase() === "html-js-gaming.project";
    if (isWorkspaceManifest) {
      rows.push({ filePath: rel, schemaPath: "", status: "skipped", errorCount: 0, firstErrors: "", note: "separate workspace validation contract removed; sample workspace JSON is out of scope" });
      return;
    } else if (typeof document?.tool === "string") {
      schemaPath = schemaPathForToolId(document.tool);
    }

    if (!schemaPath) {
      rows.push({ filePath: rel, schemaPath: "", status: "skipped", errorCount: 0, firstErrors: "", note: "no matching schema contract" });
      return;
    }

    const schema = schemaIndex.get(schemaPath);
    if (!schema) {
      rows.push({ filePath: rel, schemaPath, status: "schema-missing", errorCount: 1, firstErrors: "schema not found", note: "" });
      return;
    }

    const normalizedDocument = (() => {
      if (!isPlainObject(document)) {
        return document;
      }
      if (!Object.prototype.hasOwnProperty.call(document, "payload") && isPlainObject(document.config)) {
        const clone = { ...document };
        clone.payload = clone.config;
        delete clone.config;
        return clone;
      }
      return document;
    })();

    const errors = validate(normalizedDocument, schema, schemaPath, "$");
    rows.push({
      filePath: rel,
      schemaPath,
      status: errors.length === 0 ? "valid" : "invalid",
      errorCount: errors.length,
      firstErrors: errors.slice(0, 3).join(" | "),
      note: ""
    });
  });

  rows.sort((a, b) => a.filePath.localeCompare(b.filePath));
  return rows;
}

function resolveManifestAssetPath(manifestPath, assetPath) {
  const normalized = String(assetPath || "").trim().replace(/\\/g, "/");
  if (!normalized || /^[a-z][a-z0-9+.-]*:/i.test(normalized) || normalized.startsWith("//")) {
    return "";
  }
  if (normalized.startsWith("/")) {
    return path.join(ROOT, normalized.slice(1));
  }
  if (normalized.startsWith("dev/archive/v1-v2/games/")) {
    return path.join(ROOT, normalized);
  }
  return path.join(path.dirname(manifestPath), normalized);
}

function assetManagerImageEntriesByRole(assetManagerAssets, role) {
  const normalizedRole = String(role || "").trim().toLowerCase();
  if (!normalizedRole || !isPlainObject(assetManagerAssets)) {
    return [];
  }
  return Object.entries(assetManagerAssets)
    .filter(([, entry]) => entry?.type === "image" && String(entry?.role || "").trim().toLowerCase() === normalizedRole);
}

function validateLocalAssetFiles(filePath, entries, role, errors) {
  for (const [assetId, entry] of entries) {
    const resolvedAssetPath = resolveManifestAssetPath(filePath, entry.path);
    if (!resolvedAssetPath) {
      errors.push(`${role} asset ${assetId} has a non-local or empty path: ${entry.path || "(empty)"}`);
    } else if (!fs.existsSync(resolvedAssetPath)) {
      errors.push(`${role} asset ${assetId} file is missing: ${normalizeRel(resolvedAssetPath)}`);
    }
  }
}

function validateGames(schemaIndex, validate) {
  const files = walkFiles(path.join(ROOT, "games"), (filePath) => path.basename(filePath).toLowerCase() === "game.manifest.json");
  const gameManifestSchemaPath = "src/shared/schemas/game.manifest.schema.json";
  const gameManifestSchema = schemaIndex.get(gameManifestSchemaPath);
  const rows = [];
  files.forEach((filePath) => {
    const rel = normalizeRel(filePath);
    const manifest = readJsonSafe(filePath);
    const errors = [];

    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
      errors.push("manifest must be an object");
    } else {
      if (!gameManifestSchema) {
        errors.push("src/shared/schemas/game.manifest.schema.json not found");
      } else {
        const schemaErrors = validate(manifest, gameManifestSchema, gameManifestSchemaPath, "$");
        errors.push(...schemaErrors.map((error) => `schema ${error}`));
      }

      const assetManagerAssets = manifest?.tools?.["asset-manager-v2"]?.assets;
      if (!assetManagerAssets || typeof assetManagerAssets !== "object" || Array.isArray(assetManagerAssets)) {
        errors.push("tools.asset-manager-v2.assets must be an object");
      } else {
        const previewEntries = assetManagerImageEntriesByRole(assetManagerAssets, "preview");
        if (previewEntries.length === 0) {
          errors.push("tools.asset-manager-v2.assets must include an image preview asset");
        }
        validateLocalAssetFiles(filePath, previewEntries, "preview", errors);
        validateLocalAssetFiles(filePath, assetManagerImageEntriesByRole(assetManagerAssets, "background"), "background", errors);
        validateLocalAssetFiles(filePath, assetManagerImageEntriesByRole(assetManagerAssets, "bezel"), "bezel", errors);
      }

      Object.keys(manifest?.tools || {}).forEach((toolId) => {
        if (DEPRECATED_GAME_TOOL_IDS.has(toolId)) {
          errors.push(`deprecated game manifest tool is not allowed: tools.${toolId}`);
        }
      });
    }

    rows.push({
      filePath: rel,
      status: errors.length === 0 ? "valid" : "invalid",
      errorCount: errors.length,
      firstErrors: errors.slice(0, 4).join(" | ")
    });
  });

  rows.sort((a, b) => a.filePath.localeCompare(b.filePath));
  return rows;
}

function validateToolSchemas(schemaIndex, validate) {
  const rows = [];
  for (const [schemaPath, schema] of schemaIndex.entries()) {
    if (!schemaPath.startsWith("www/src/shared/schemas/tools/") || !schemaPath.endsWith(".schema.json")) {
      continue;
    }
    const errors = [];
    if (schema?.type !== "object") {
      errors.push("root type must be object");
    }
    if (schema?.additionalProperties !== false) {
      errors.push("root additionalProperties must be false");
    }
    if (!Array.isArray(schema?.required) || !schema.required.includes("tool") || !schema.required.includes("version")) {
      errors.push("required must include tool/version");
    }
    const selfErrors = validate(schema, { type: "object" }, schemaPath, "$schema-self");
    if (selfErrors.length > 0) {
      errors.push(...selfErrors.slice(0, 2));
    }
    rows.push({
      schemaPath,
      status: errors.length === 0 ? "valid" : "invalid",
      errorCount: errors.length,
      firstErrors: errors.slice(0, 4).join(" | ")
    });
  }
  rows.sort((a, b) => a.schemaPath.localeCompare(b.schemaPath));
  return rows;
}

function writeStrictnessReports(rows, reportDir) {
  const csvPath = path.join(reportDir, "schema_strictness_inventory.csv");
  const mdPath = path.join(reportDir, "schema_strictness_inventory.md");
  writeCsv(csvPath, ["schemaPath", "jsonPointer", "currentAdditionalProperties", "looseReason", "action"], rows);

  const summaryByReason = new Map();
  rows.forEach((row) => {
    summaryByReason.set(row.looseReason, (summaryByReason.get(row.looseReason) || 0) + 1);
  });

  const lines = [];
  lines.push("# Schema Strictness Inventory");
  lines.push("");
  lines.push(`Total findings: ${rows.length}`);
  lines.push("");
  lines.push("## Counts By Reason");
  if (summaryByReason.size === 0) {
    lines.push("- none");
  } else {
    for (const [reason, count] of [...summaryByReason.entries()].sort((a, b) => b[1] - a[1])) {
      lines.push(`- ${reason}: ${count}`);
    }
  }
  lines.push("");
  lines.push("## Findings");
  lines.push("| schemaPath | jsonPointer | currentAdditionalProperties | looseReason | action |");
  lines.push("| --- | --- | --- | --- | --- |");
  rows.forEach((row) => {
    lines.push(`| ${row.schemaPath} | ${row.jsonPointer} | ${row.currentAdditionalProperties} | ${row.looseReason} | ${row.action} |`);
  });
  fs.writeFileSync(mdPath, `${lines.join("\n")}\n`, "utf8");

  return { csvPath, mdPath };
}

function writeUsageReport(reportDir, usageSummary) {
  const filePath = path.join(reportDir, "schema_usage_code_updates.md");
  const lines = [];
  lines.push("# Schema Usage Code Updates");
  lines.push("");
  lines.push("## Updated Runtime/Validation Paths");
  lines.push("- dev/scripts/validate-json-contracts.mjs: validates game manifests against the current schema, Asset Manager V2 preview/background/bezel asset file paths, and deprecated game-manifest tool keys.");
  lines.push("");
  lines.push("## Validation Summary");
  lines.push(`- Tool schema rows: ${usageSummary.toolRows}`);
  lines.push(`- Sample JSON rows: ${usageSummary.sampleRows}`);
  lines.push(`- Game manifest rows: ${usageSummary.gameRows}`);
  lines.push(`- Invalid tool rows: ${usageSummary.invalidToolRows}`);
  lines.push(`- Invalid sample rows: ${usageSummary.invalidSampleRows}`);
  lines.push(`- Invalid game rows: ${usageSummary.invalidGameRows}`);
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
  return filePath;
}

function printCount(label, rows) {
  const invalid = rows.filter((row) => row.status === "invalid" || row.status === "invalid-json" || row.status === "schema-missing").length;
  console.log(`${label}: total=${rows.length} invalid=${invalid}`);
}

function main() {
  const args = parseArgs(process.argv);
  ensureDir(args.reportDir);

  const schemaIndex = buildSchemaIndex();
  const validate = makeValidator(schemaIndex);

  const strictnessRows = collectSchemaStrictnessInventory(schemaIndex);
  const strictnessPaths = writeStrictnessReports(strictnessRows, args.reportDir);

  const runTools = args.mode === "all" || args.mode === "tools";
  const runSamples = args.mode === "all" || args.mode === "samples";
  const runGames = args.mode === "all" || args.mode === "games";
  const toolRows = runTools ? validateToolSchemas(schemaIndex, validate) : [];
  const sampleRows = runSamples ? validateSamples(schemaIndex, validate) : [];
  const gameRows = runGames ? validateGames(schemaIndex, validate) : [];

  writeCsv(path.join(args.reportDir, "tool_payload_schema_validation.csv"), ["schemaPath", "status", "errorCount", "firstErrors"], toolRows);
  writeCsv(path.join(args.reportDir, "sample_json_schema_validation.csv"), ["filePath", "schemaPath", "status", "errorCount", "firstErrors", "note"], sampleRows);
  writeCsv(path.join(args.reportDir, "game_manifest_schema_validation.csv"), ["filePath", "status", "errorCount", "firstErrors"], gameRows);

  const usagePath = writeUsageReport(args.reportDir, {
    toolRows: toolRows.length,
    sampleRows: sampleRows.length,
    gameRows: gameRows.length,
    invalidToolRows: toolRows.filter((row) => row.status !== "valid").length,
    invalidSampleRows: sampleRows.filter((row) => row.status !== "valid" && row.status !== "skipped").length,
    invalidGameRows: gameRows.filter((row) => row.status !== "valid").length
  });

  console.log(`schema_strictness_inventory.csv: ${normalizeRel(strictnessPaths.csvPath)}`);
  console.log(`schema_strictness_inventory.md: ${normalizeRel(strictnessPaths.mdPath)}`);
  if (runTools) {
    printCount("tool_payload_schema_validation", toolRows);
  }
  if (runSamples) {
    printCount("sample_json_schema_validation", sampleRows);
  }
  if (runGames) {
    printCount("game_manifest_schema_validation", gameRows);
  }
  console.log(`schema_usage_code_updates.md: ${normalizeRel(usagePath)}`);

  if (args.details) {
    const invalidSamples = sampleRows.filter((row) => row.status !== "valid" && row.status !== "skipped");
    const invalidGames = gameRows.filter((row) => row.status !== "valid");
    if (runSamples && invalidSamples.length > 0) {
      console.log("invalid sample rows:");
      invalidSamples.slice(0, 25).forEach((row) => console.log(`- ${row.filePath}: ${row.firstErrors}`));
    }
    if (runGames && invalidGames.length > 0) {
      console.log("invalid game rows:");
      invalidGames.slice(0, 25).forEach((row) => console.log(`- ${row.filePath}: ${row.firstErrors}`));
    }
  }

  const strictFailures = strictnessRows.length;
  const validationFailures = toolRows.filter((row) => row.status !== "valid").length
    + sampleRows.filter((row) => row.status !== "valid" && row.status !== "skipped").length
    + gameRows.filter((row) => row.status !== "valid").length;

  if (args.ci && (strictFailures > 0 || validationFailures > 0)) {
    process.exit(1);
  }
}

main();
