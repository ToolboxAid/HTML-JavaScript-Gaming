import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const WORKSPACE_SCHEMA_PATH = "tools/schemas/workspace.manifest.schema.json";
const SAMPLE_1902_PATH = "samples/phase-19/1902/sample.1902.workspace-all-tools.json";

function readJson(relativePath) {
  return JSON.parse(readFileSyncRelative(relativePath));
}

function readFileSyncRelative(relativePath) {
  return fs.readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function resolveJsonPointer(document, pointer) {
  if (!pointer || pointer === "#") {
    return document;
  }
  const parts = pointer
    .replace(/^#\//, "")
    .split("/")
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));
  let node = document;
  for (const part of parts) {
    if (!node || typeof node !== "object" || !(part in node)) {
      return undefined;
    }
    node = node[part];
  }
  return node;
}

function assertSchemaObjectsStrict(node, issues, pathLabel = "$") {
  if (!node || typeof node !== "object") {
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, index) => assertSchemaObjectsStrict(item, issues, `${pathLabel}[${index}]`));
    return;
  }
  if (node.type === "object") {
    if (!Object.prototype.hasOwnProperty.call(node, "additionalProperties")) {
      issues.push(`missing additionalProperties at ${pathLabel}`);
    } else if (node.additionalProperties !== false) {
      issues.push(`additionalProperties must be false at ${pathLabel}`);
    }
  }
  for (const [key, value] of Object.entries(node)) {
    assertSchemaObjectsStrict(value, issues, `${pathLabel}.${key}`);
  }
}

function assertRefsResolve(relativePath, document, schemaIndex, issues, pathLabel = "$") {
  if (!document || typeof document !== "object") {
    return;
  }
  if (Array.isArray(document)) {
    document.forEach((item, index) => {
      assertRefsResolve(relativePath, item, schemaIndex, issues, `${pathLabel}[${index}]`);
    });
    return;
  }
  if (typeof document.$ref === "string") {
    const ref = document.$ref;
    const [rawTargetPath, rawPointer] = ref.split("#");
    if (!rawTargetPath || rawTargetPath.trim().length === 0) {
      const pointer = rawPointer ? `#${rawPointer}` : "#";
      const node = resolveJsonPointer(schemaIndex.get(relativePath), pointer);
      if (typeof node === "undefined") {
        issues.push(`unresolved local $ref ${ref} at ${relativePath}:${pathLabel}`);
      }
    } else {
      const resolvedPath = path
        .normalize(path.join(path.dirname(relativePath), rawTargetPath))
        .replace(/\\/g, "/");
      if (!schemaIndex.has(resolvedPath)) {
        issues.push(`missing $ref target file ${resolvedPath} from ${relativePath}:${pathLabel}`);
      } else if (rawPointer && rawPointer.length > 0) {
        const targetNode = resolveJsonPointer(schemaIndex.get(resolvedPath), `#${rawPointer}`);
        if (typeof targetNode === "undefined") {
          issues.push(`missing $ref pointer ${ref} from ${relativePath}:${pathLabel}`);
        }
      }
    }
  }
  for (const [key, value] of Object.entries(document)) {
    assertRefsResolve(relativePath, value, schemaIndex, issues, `${pathLabel}.${key}`);
  }
}

function validateToolPayload(toolId, payload, schema, errors, pointer) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    errors.push(`${pointer} must be an object`);
    return;
  }
  const rootProps = schema.properties ?? {};
  const requiredRoot = new Set(schema.required ?? []);
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
    if (propertySchema && Object.prototype.hasOwnProperty.call(propertySchema, "const") && key in payload && payload[key] !== propertySchema.const) {
      errors.push(`${pointer}.${key} must equal ${propertySchema.const}`);
    }
  });
  const expectedToolConst = schema?.properties?.tool?.const;
  if (typeof expectedToolConst === "string") {
    if (payload.tool !== expectedToolConst) {
      errors.push(`${pointer}.tool must equal ${expectedToolConst}`);
    }
  } else if (payload.tool !== toolId) {
    if (Object.prototype.hasOwnProperty.call(rootProps, "payload")) {
      errors.push(`${pointer}.tool must equal ${toolId}`);
    }
  }
  if (!Object.prototype.hasOwnProperty.call(rootProps, "payload")) {
    return;
  }
  const payloadValue = payload.payload;
  if (!payloadValue || typeof payloadValue !== "object" || Array.isArray(payloadValue)) {
    errors.push(`${pointer}.payload must be an object`);
    return;
  }
  const payloadSchema = rootProps.payload;
  const payloadProps = (payloadSchema && payloadSchema.properties) || {};
  const requiredPayload = new Set((payloadSchema && payloadSchema.required) || []);
  Object.keys(payloadValue).forEach((key) => {
    if (!(key in payloadProps)) {
      errors.push(`${pointer}.payload.${key} is not allowed by schema`);
    }
  });
  requiredPayload.forEach((key) => {
    if (!(key in payloadValue)) {
      errors.push(`${pointer}.payload.${key} is required`);
    }
  });
}

function validateWorkspace1902(sampleDocument, schemaIndex) {
  const errors = [];
  if (!sampleDocument || typeof sampleDocument !== "object" || Array.isArray(sampleDocument)) {
    return ["sample document must be an object"];
  }
  const workspaceSchema = schemaIndex.get(WORKSPACE_SCHEMA_PATH);
  if (!workspaceSchema) {
    return [`missing schema ${WORKSPACE_SCHEMA_PATH}`];
  }
  const requiredTopLevel = new Set(workspaceSchema.required || []);
  const topLevelProps = workspaceSchema.properties || {};
  Object.keys(sampleDocument).forEach((key) => {
    if (!(key in topLevelProps)) {
      errors.push(`root.${key} is not allowed by workspace.manifest schema`);
    }
  });
  requiredTopLevel.forEach((key) => {
    if (!(key in sampleDocument)) {
      errors.push(`root.${key} is required by workspace.manifest schema`);
    }
  });
  const tools = sampleDocument.tools;
  if (!tools || typeof tools !== "object" || Array.isArray(tools)) {
    errors.push("root.tools must be an object");
    return errors;
  }
  const toolsSchema = topLevelProps.tools;
  const allowedToolIds = new Set(Object.keys((toolsSchema && toolsSchema.properties) || {}));
  if (!allowedToolIds.has("palette-browser")) {
    errors.push("workspace tools schema must include required palette-browser tool");
  }
  Object.keys(tools).forEach((toolId) => {
    if (!allowedToolIds.has(toolId)) {
      errors.push(`root.tools.${toolId} is not allowed by workspace.manifest schema`);
      return;
    }
    const toolSchemaPath = toolId === "palette-browser"
      ? "tools/schemas/tools/palette-browser.schema.json"
      : `tools/schemas/tools/${toolId}.schema.json`;
    const toolSchema = schemaIndex.get(toolSchemaPath);
    if (!toolSchema) {
      errors.push(`missing schema for tool ${toolId}: ${toolSchemaPath}`);
      return;
    }
    validateToolPayload(toolId, tools[toolId], toolSchema, errors, `root.tools.${toolId}`);
  });
  return errors;
}

function buildSchemaIndex() {
  const repoRootPath = fileURLToPath(new URL("../../", import.meta.url));
  const schemaRootPath = fileURLToPath(new URL("../../tools/schemas", import.meta.url));
  const schemaFiles = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        schemaFiles.push(fullPath);
      }
    }
  }

  walk(schemaRootPath);

  const schemaIndex = new Map();
  schemaFiles.forEach((absolutePath) => {
    const relativePath = path.relative(repoRootPath, absolutePath).replace(/\\/g, "/");
    schemaIndex.set(relativePath, JSON.parse(fs.readFileSync(absolutePath, "utf8")));
  });
  return schemaIndex;
}

export async function run() {
  const schemaIndex = buildSchemaIndex();
  assert.equal(schemaIndex.size > 0, true, "Expected tools/schemas JSON files to exist.");

  const strictIssues = [];
  for (const [relativePath, schema] of schemaIndex.entries()) {
    assertSchemaObjectsStrict(schema, strictIssues, `${relativePath}:$`);
  }
  assert.deepEqual(strictIssues, [], `Strict schema violations found:\n${strictIssues.join("\n")}`);

  const refIssues = [];
  for (const [relativePath, schema] of schemaIndex.entries()) {
    assertRefsResolve(relativePath, schema, schemaIndex, refIssues, "$");
  }
  assert.deepEqual(refIssues, [], `Schema $ref resolution failures:\n${refIssues.join("\n")}`);

  const sample1902 = readJson(SAMPLE_1902_PATH);
  const sampleValidationErrors = validateWorkspace1902(sample1902, schemaIndex);
  assert.deepEqual(
    sampleValidationErrors,
    [],
    `Sample 1902 failed strict workspace schema validation:\n${sampleValidationErrors.join("\n")}`
  );

  const injected = clone(sample1902);
  injected.tools["asset-browser"].payload.__unknown = true;
  const unknownFieldErrors = validateWorkspace1902(injected, schemaIndex);
  assert.equal(
    unknownFieldErrors.some((message) => message.includes("asset-browser.payload.__unknown")),
    true,
    "Unknown payload field injection must fail validation."
  );

  const requiredToolIds = [
    "vector-map-editor",
    "svg-asset-studio",
    "tile-map-editor",
    "parallax-editor",
    "sprite-editor",
    "skin-editor",
    "asset-browser",
    "state-inspector",
    "replay-visualizer",
    "performance-profiler",
    "physics-sandbox",
    "asset-pipeline",
    "tile-model-converter",
    "3d-json-payload",
    "3d-asset-viewer",
    "3d-camera-path-editor",
    "palette-browser"
  ];
  requiredToolIds.forEach((toolId) => {
    assert.equal(toolId in sample1902.tools, true, `Sample 1902 must include ${toolId}.`);
  });

  const paletteSidecarPath = new URL("../../samples/phase-19/1902/sample.1902.palette.json", import.meta.url);
  assert.equal(fs.existsSync(paletteSidecarPath), false, "sample.1902.palette.json must not exist.");
}
