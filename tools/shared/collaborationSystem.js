import { buildProjectVersioning } from "./projectVersioning.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function createAudit(event, message) {
  return {
    event: sanitizeText(event),
    message: sanitizeText(message)
  };
}

function collectConflicts(baseSnapshot, incomingSnapshot) {
  const conflicts = [];
  const baseRefs = baseSnapshot?.assetRefs && typeof baseSnapshot.assetRefs === "object" ? baseSnapshot.assetRefs : {};
  const incomingRefs = incomingSnapshot?.assetRefs && typeof incomingSnapshot.assetRefs === "object" ? incomingSnapshot.assetRefs : {};
  const keys = Array.from(new Set([...Object.keys(baseRefs), ...Object.keys(incomingRefs)])).sort((left, right) => left.localeCompare(right));
  keys.forEach((key) => {
    const left = sanitizeText(baseRefs[key]);
    const right = sanitizeText(incomingRefs[key]);
    if (left && right && left !== right) {
      conflicts.push({
        field: key,
        baseValue: left,
        incomingValue: right
      });
    }
  });
  return conflicts;
}

export function summarizeCollaborationSystem(result) {
  const conflicts = Array.isArray(result?.collaboration?.conflicts) ? result.collaboration.conflicts : [];
  return `Collaboration system ${sanitizeText(result?.collaboration?.status) || "unavailable"} with ${conflicts.length} conflicts.`;
}

export function buildCollaborationSystem(options = {}) {
  const baseSnapshot = cloneJson(options.baseSnapshot || {});
  const incomingSnapshot = cloneJson(options.incomingSnapshot || {});
  const versioning = buildProjectVersioning({
    currentSchemaVersion: Number.isFinite(options.currentSchemaVersion) ? options.currentSchemaVersion : 1,
    projectDocument: incomingSnapshot,
    previousVersionSnapshot: {
      projectVersion: Number.isFinite(baseSnapshot.version) ? baseSnapshot.version : 1,
      packageVersion: Number.isFinite(options.basePackageVersion) ? options.basePackageVersion : 1
    },
    packageManifest: options.packageManifest || null
  });
  const conflicts = collectConflicts(baseSnapshot, incomingSnapshot);
  const approvalsRequired = conflicts.length > 0 || versioning.versioning.status === "migration-needed";
  const auditTrail = [
    createAudit("shared-review", "Collaboration system evaluated incoming snapshot against the shared baseline."),
    createAudit("version-check", `Versioning status ${versioning.versioning.status}.`),
    createAudit("conflict-check", `${conflicts.length} conflict${conflicts.length === 1 ? "" : "s"} detected.`)
  ];

  return {
    collaboration: {
      status: conflicts.length > 0 ? "conflict" : "ready",
      conflicts,
      approvalsRequired,
      auditTrail,
      versioning,
      reportText: [
        summarizeCollaborationSystem({ collaboration: { status: conflicts.length > 0 ? "conflict" : "ready", conflicts } }),
        `Approvals required: ${approvalsRequired}`,
        ...conflicts.map((conflict) => `${conflict.field}: ${conflict.baseValue} -> ${conflict.incomingValue}`),
        ...auditTrail.map((entry) => `[audit] ${entry.event}: ${entry.message}`)
      ].join("\n")
    }
  };
}
