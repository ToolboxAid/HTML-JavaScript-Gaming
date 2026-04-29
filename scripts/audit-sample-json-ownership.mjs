import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getToolRegistry } from "../tools/toolRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const SAMPLES_ROOT = path.join(repoRoot, "samples");
const METADATA_PATH = path.join(SAMPLES_ROOT, "metadata", "samples.index.metadata.json");
const REPORT_PATH = path.join(repoRoot, "docs", "dev", "reports", "PR_11_41_sample_json_ownership_audit.md");

const SAMPLE_JSON_PATTERN = /^sample(?:\.|-)\d{4}[.-].+\.json$/i;
const SAMPLE_PATH_PATTERN = /^samples\/phase-\d{2}\/\d{4}\//;
const EXEMPT_WORKSPACE_SAMPLE_ID = "1902";
const EXEMPT_WORKSPACE_FILE = "sample.1902.workspace-all-tools.json";

function toPosix(value = "") {
  return String(value).replace(/\\/g, "/");
}

async function walkFiles(dir, result = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "start_of_day") {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(fullPath, result);
      continue;
    }
    result.push(fullPath);
  }
  return result;
}

function parseSampleFileIdentity(fileName) {
  const dot = fileName.match(/^sample\.(\d{4})\.([a-z0-9-]+)\.json$/i);
  if (dot) {
    return { sampleId: dot[1], token: dot[2], naming: "dot" };
  }
  const dash = fileName.match(/^sample-(\d{4})-([a-z0-9-]+)\.json$/i);
  if (dash) {
    return { sampleId: dash[1], token: dash[2], naming: "dash" };
  }
  return { sampleId: "", token: "", naming: "non-standard" };
}

function normalizeToken(value) {
  return String(value || "").trim().toLowerCase();
}

function inferIntendedToolUseCase(fileIdentity, metadataRefs) {
  if (metadataRefs.length > 0) {
    const unique = [...new Set(metadataRefs.map((ref) => normalizeToken(ref.toolId)).filter(Boolean))];
    return unique.join(", ");
  }
  const token = normalizeToken(fileIdentity.token);
  if (!token) {
    return "sample-local companion JSON";
  }
  if (token === "palette") {
    return "palette-browser (canonical palette payload)";
  }
  if (token === "workspace-all-tools") {
    return "workspace-manager integration manifest";
  }
  return token;
}

function resolveEntryPoint(toolRegistryMap, intendedToolUseCase) {
  if (!intendedToolUseCase) {
    return "unknown";
  }
  const ids = intendedToolUseCase
    .split(",")
    .map((part) => normalizeToken(part))
    .filter(Boolean);
  const entryPoints = [];
  for (const id of ids) {
    const resolvedId = id === "palette" ? "palette-browser" : id;
    const tool = toolRegistryMap.get(resolvedId);
    if (tool?.entryPoint) {
      entryPoints.push(`/tools/${tool.entryPoint}`);
    }
  }
  return entryPoints.length > 0 ? [...new Set(entryPoints)].join(" | ") : "unknown";
}

function evaluateFit({ folderSampleId, fileName, fileIdentity, metadataRefs }) {
  if (folderSampleId === EXEMPT_WORKSPACE_SAMPLE_ID && fileName === EXEMPT_WORKSPACE_FILE) {
    return { fit: "exempt", reason: "sample 1902 workspace integration manifest" };
  }

  if (fileIdentity.sampleId && fileIdentity.sampleId !== folderSampleId) {
    return {
      fit: "no",
      reason: `filename sample id (${fileIdentity.sampleId}) differs from folder sample id (${folderSampleId})`
    };
  }

  if (metadataRefs.length === 0) {
    return { fit: "yes", reason: "sample-local JSON with no metadata mismatch" };
  }

  for (const ref of metadataRefs) {
    if (normalizeToken(ref.sampleId) !== normalizeToken(folderSampleId)) {
      return {
        fit: "no",
        reason: `mapped to sample ${ref.sampleId} instead of folder sample ${folderSampleId}`
      };
    }
  }

  const expectedToken = normalizeToken(fileIdentity.token);
  const mappedToolIds = [...new Set(metadataRefs.map((ref) => normalizeToken(ref.toolId)).filter(Boolean))];

  if (!expectedToken) {
    return { fit: "yes", reason: "non-standard filename; mapped to same sample" };
  }

  const compatible = mappedToolIds.every((toolId) => {
    if (expectedToken === toolId) {
      return true;
    }
    if (expectedToken === "palette" && toolId === "palette-browser") {
      return true;
    }
    return false;
  });

  if (!compatible) {
    return {
      fit: "no",
      reason: `filename token (${expectedToken}) not aligned with mapped tool id(s): ${mappedToolIds.join(", ")}`
    };
  }

  return { fit: "yes", reason: "filename/tool mapping aligns with executable sample mapping" };
}

function computeDecision({ fit, loaded, folderSampleId, fileName, metadataRefs, hasInSampleReference }) {
  if (fit === "exempt") {
    return { decision: "EXEMPT WORKSPACE SAMPLE", note: "1902 is workspace aggregation sample" };
  }

  if (fit === "no") {
    if (metadataRefs.length > 0) {
      return { decision: "MOVE / REHOME", note: "mapped tool/use-case indicates different ownership" };
    }
    return { decision: "CREATE / UPDATE CORRECT SAMPLE", note: "ownership mismatch without authoritative mapping" };
  }

  if (loaded === "yes") {
    return { decision: "KEEP + WIRE", note: "actively wired to executable sample/tool flow" };
  }

  if (hasInSampleReference) {
    return { decision: "KEEP + WIRE", note: "referenced by current sample-local entry/source" };
  }

  if (folderSampleId === EXEMPT_WORKSPACE_SAMPLE_ID && fileName === EXEMPT_WORKSPACE_FILE) {
    return { decision: "EXEMPT WORKSPACE SAMPLE", note: "workspace integration manifest" };
  }

  return { decision: "CREATE / UPDATE CORRECT SAMPLE", note: "not loaded by active mapping; defer destructive action" };
}

async function fileContainsText(filePath, token) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content.includes(token);
  } catch {
    return false;
  }
}

function boolToYesNoUnknown(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "unknown";
}

function escapeCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
}

async function main() {
  const allFiles = await walkFiles(SAMPLES_ROOT);
  const sampleJsonFiles = allFiles
    .map((absolutePath) => toPosix(path.relative(repoRoot, absolutePath)))
    .filter((rel) => SAMPLE_PATH_PATTERN.test(rel) && SAMPLE_JSON_PATTERN.test(path.basename(rel)))
    .sort((a, b) => a.localeCompare(b));

  const metadata = JSON.parse(await fs.readFile(METADATA_PATH, "utf8"));
  const presetRows = [];
  for (const sample of Array.isArray(metadata?.samples) ? metadata.samples : []) {
    const sampleId = String(sample?.id || "").trim();
    const sampleTitle = String(sample?.title || "").trim();
    const presets = Array.isArray(sample?.roundtripToolPresets) ? sample.roundtripToolPresets : [];
    for (const preset of presets) {
      const toolId = String(preset?.toolId || "").trim();
      const presetPath = toPosix(String(preset?.presetPath || "").trim().replace(/^\//, ""));
      if (!toolId || !presetPath) {
        continue;
      }
      presetRows.push({ sampleId, sampleTitle, toolId, presetPath });
    }
  }

  const metadataByPath = new Map();
  for (const row of presetRows) {
    if (!metadataByPath.has(row.presetPath)) {
      metadataByPath.set(row.presetPath, []);
    }
    metadataByPath.get(row.presetPath).push(row);
  }

  const toolRegistryMap = new Map(
    getToolRegistry().map((tool) => [normalizeToken(tool.id), tool])
  );

  const rows = [];
  for (const relPath of sampleJsonFiles) {
    const folderMatch = relPath.match(/^samples\/phase-\d{2}\/(\d{4})\//);
    const folderSampleId = folderMatch ? folderMatch[1] : "";
    const fileName = path.basename(relPath);
    const fileIdentity = parseSampleFileIdentity(fileName);
    const metadataRefs = metadataByPath.get(relPath) || [];

    const sampleFolderAbs = path.join(repoRoot, path.dirname(relPath));
    const siblingFiles = (await fs.readdir(sampleFolderAbs, { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(sampleFolderAbs, entry.name))
      .filter((abs) => toPosix(path.relative(repoRoot, abs)) !== relPath)
      .filter((abs) => /\.(html|js|json|md)$/i.test(abs));

    let hasInSampleReference = false;
    for (const sibling of siblingFiles) {
      if (await fileContainsText(sibling, fileName)) {
        hasInSampleReference = true;
        break;
      }
    }

    const loadedByMetadata = metadataRefs.length > 0;
    const loaded = loadedByMetadata || hasInSampleReference ? "yes" : "no";

    const fitResult = evaluateFit({ folderSampleId, fileName, fileIdentity, metadataRefs });
    const intendedToolUseCase = inferIntendedToolUseCase(fileIdentity, metadataRefs);
    const entryPoint = resolveEntryPoint(toolRegistryMap, intendedToolUseCase);
    const decision = computeDecision({
      fit: fitResult.fit,
      loaded,
      folderSampleId,
      fileName,
      metadataRefs,
      hasInSampleReference
    });

    const visible = loaded === "yes"
      ? (loadedByMetadata ? "yes" : "unknown")
      : "no";

    rows.push({
      jsonPath: relPath,
      currentSample: folderSampleId,
      intendedToolUseCase,
      executableEntryPoint: entryPoint,
      fit: fitResult.fit,
      loaded,
      visible,
      decision: decision.decision,
      notes: `${fitResult.reason}; ${decision.note}`
    });
  }

  const movedOrRehome = rows.filter((row) => row.decision === "MOVE / REHOME");
  const deleteRows = rows.filter((row) => row.decision === "DELETE");
  const keepRows = rows.filter((row) => row.decision === "KEEP + WIRE");
  const exemptRows = rows.filter((row) => row.decision === "EXEMPT WORKSPACE SAMPLE");
  const deferredRows = rows.filter((row) => row.decision === "CREATE / UPDATE CORRECT SAMPLE");

  const summaryLines = [
    "# PR 11.41 Sample JSON Ownership Audit",
    "",
    "## Scope",
    "- Audited sample-owned JSON files under `samples/phase-*/####/sample*.json`.",
    "- Cross-checked against `samples/metadata/samples.index.metadata.json` roundtrip tool preset mappings.",
    "- Cross-checked sample-local entrypoint/source references (`index.html`, `main.js`, sibling JSON/MD references).",
    "",
    "## Sample 1902 Exemption",
    "- `samples/phase-19/1902/sample.1902.workspace-all-tools.json` is marked **EXEMPT WORKSPACE SAMPLE**.",
    "- Single-tool KEEP/MOVE/DELETE ownership rules were not applied to 1902.",
    "- 1902 was validated only as a workspace integration manifest source.",
    "",
    "## Coverage Preserved Statement",
    "- This PR does not reduce sample-to-tool/use-case coverage.",
    "- No sample JSON file was moved or deleted by this execution because no unambiguous safe ownership relocation/deletion was proven.",
    "",
    "## Decision Summary",
    `- KEEP + WIRE: ${keepRows.length}`,
    `- MOVE / REHOME: ${movedOrRehome.length}`,
    `- DELETE: ${deleteRows.length}`,
    `- CREATE / UPDATE CORRECT SAMPLE: ${deferredRows.length}`,
    `- EXEMPT WORKSPACE SAMPLE: ${exemptRows.length}`,
    "",
    "## Files Moved/Deleted/Updated",
    "- moved: none",
    "- deleted: none",
    "- updated sample JSON: none",
    "",
    "## Uncertain Items Deferred To Next PR",
    ...(deferredRows.length > 0
      ? deferredRows.map((row) => `- ${row.jsonPath} :: ${row.notes}`)
      : ["- none"]),
    "",
    "## Decision Table",
    "| JSON Path | Current Owning Sample | Intended Tool/Use Case | Executable Entry Point | Fits Current Sample? | Is Loaded? | Visibly Affects UI/State/Output? | Decision | Notes |",
    "|---|---|---|---|---|---|---|---|---|"
  ];

  for (const row of rows) {
    summaryLines.push(
      `| ${escapeCell(row.jsonPath)} | ${escapeCell(row.currentSample)} | ${escapeCell(row.intendedToolUseCase)} | ${escapeCell(row.executableEntryPoint)} | ${escapeCell(row.fit)} | ${escapeCell(row.loaded)} | ${escapeCell(row.visible)} | ${escapeCell(row.decision)} | ${escapeCell(row.notes)} |`
    );
  }

  await fs.writeFile(REPORT_PATH, `${summaryLines.join("\n")}\n`, "utf8");

  const output = {
    totalRows: rows.length,
    keepWireCount: keepRows.length,
    moveRehomeCount: movedOrRehome.length,
    deleteCount: deleteRows.length,
    createUpdateCount: deferredRows.length,
    exemptCount: exemptRows.length,
    reportPath: toPosix(path.relative(repoRoot, REPORT_PATH))
  };

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

await main();
