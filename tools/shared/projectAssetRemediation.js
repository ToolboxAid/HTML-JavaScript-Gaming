import { sanitizeAssetRegistry } from "./projectAssetRegistry.js";

const ACTION_TYPE_ORDER = Object.freeze({
  navigate: 0,
  inspect: 1,
  "confirmable-fix": 2,
  suggest: 3
});

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toRegistryIds(registry, section) {
  const entries = Array.isArray(registry?.[section]) ? registry[section] : [];
  return entries
    .map((entry) => sanitizeText(entry?.id))
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
}

function createAction(finding, actionId, actionType, label, message, payload = {}) {
  return {
    findingCode: sanitizeText(finding?.code),
    actionId: sanitizeText(actionId),
    actionType: sanitizeText(actionType) || "inspect",
    blocking: finding?.blocking === true,
    sourceType: sanitizeText(finding?.sourceType),
    sourceId: sanitizeText(finding?.sourceId),
    label: sanitizeText(label),
    message: sanitizeText(message),
    payload
  };
}

function addInspectAndNavigate(actions, finding, navigateLabel = "Jump to problem") {
  actions.push(
    createAction(
      finding,
      "inspect-finding",
      "inspect",
      "Inspect issue",
      finding?.message || "Inspect the current validation finding."
    )
  );
  actions.push(
    createAction(
      finding,
      "jump-to-problem",
      "navigate",
      navigateLabel,
      `Navigate to ${sanitizeText(finding?.sourceType) || "the relevant editor area"} for this issue.`
    )
  );
}

function addSingleCandidateRelink(actions, finding, candidateSection, referenceField, label) {
  const registry = sanitizeAssetRegistry(finding?.payload?.registry);
  const candidateIds = toRegistryIds(registry, candidateSection);
  if (candidateIds.length !== 1) {
    return;
  }
  actions.push(
    createAction(
      finding,
      "relink-single-candidate",
      "confirmable-fix",
      label,
      `Relink ${referenceField} to ${candidateIds[0]}.`,
      {
        fixKind: "relink-reference",
        referenceField,
        candidateId: candidateIds[0],
        candidateSection
      }
    )
  );
}

function mapFindingToActions(finding, registry) {
  const actions = [];
  const enrichedFinding = {
    ...finding,
    payload: { registry }
  };

  switch (finding?.code) {
    case "UNRESOLVED_PALETTE_LINK":
      addInspectAndNavigate(actions, enrichedFinding, "Jump to palette problem");
      addSingleCandidateRelink(actions, enrichedFinding, "palettes", "paletteId", "Relink palette");
      break;
    case "UNRESOLVED_TILESET_LINK":
      addInspectAndNavigate(actions, enrichedFinding, "Jump to tileset problem");
      addSingleCandidateRelink(actions, enrichedFinding, "tilesets", "tilesetId", "Relink tileset");
      break;
    case "UNRESOLVED_IMAGE_LINK":
      addInspectAndNavigate(actions, enrichedFinding, "Jump to image problem");
      addSingleCandidateRelink(actions, enrichedFinding, "parallaxSources", "parallaxSourceId", "Relink parallax source");
      break;
    case "MISSING_ASSET_ID":
      addInspectAndNavigate(actions, enrichedFinding);
      actions.push(
        createAction(
          enrichedFinding,
          "refresh-owned-registry-entry",
          "confirmable-fix",
          "Refresh owned registry entries",
          "Regenerate the current editor-owned registry entries from the active document.",
          {
            fixKind: "refresh-owned-registry-entry"
          }
        )
      );
      break;
    case "INVALID_GRAPH_TARGET":
      addInspectAndNavigate(actions, enrichedFinding, "Jump to dependency problem");
      break;
    case "DUPLICATE_REGISTRY_ID":
      addInspectAndNavigate(actions, enrichedFinding, "Jump to duplicate ID problem");
      actions.push(
        createAction(
          enrichedFinding,
          "inspect-duplicate-resolution",
          "suggest",
          "Inspect duplicate ID resolution",
          "Review duplicate asset ownership before making a manual, confirmed ID change."
        )
      );
      break;
    case "STALE_GRAPH_SNAPSHOT":
      addInspectAndNavigate(actions, enrichedFinding, "Jump to graph snapshot problem");
      actions.push(
        createAction(
          enrichedFinding,
          "refresh-graph-snapshot",
          "confirmable-fix",
          "Refresh graph snapshot",
          "Replace the stale graph snapshot with the current deterministic graph rebuilt from the registry.",
          {
            fixKind: "refresh-graph-snapshot"
          }
        )
      );
      break;
    case "ORPHANED_GRAPH_NODE":
      addInspectAndNavigate(actions, enrichedFinding, "Jump to orphaned asset");
      actions.push(
        createAction(
          enrichedFinding,
          "inspect-orphan-cleanup",
          "suggest",
          "Inspect orphaned asset",
          "Review whether this orphaned asset should be relinked or removed manually."
        )
      );
      break;
    case "ILLEGAL_CIRCULAR_DEPENDENCY":
      addInspectAndNavigate(actions, enrichedFinding, "Jump to circular dependency");
      break;
    default:
      addInspectAndNavigate(actions, enrichedFinding);
      break;
  }

  return actions;
}

function sortActions(actions) {
  return actions.sort((left, right) => {
    const byBlocking = Number(right.blocking) - Number(left.blocking);
    if (byBlocking !== 0) {
      return byBlocking;
    }
    const bySourceType = left.sourceType.localeCompare(right.sourceType);
    if (bySourceType !== 0) {
      return bySourceType;
    }
    const bySourceId = left.sourceId.localeCompare(right.sourceId);
    if (bySourceId !== 0) {
      return bySourceId;
    }
    const byActionType = (ACTION_TYPE_ORDER[left.actionType] ?? 99) - (ACTION_TYPE_ORDER[right.actionType] ?? 99);
    if (byActionType !== 0) {
      return byActionType;
    }
    const byLabel = left.label.localeCompare(right.label);
    if (byLabel !== 0) {
      return byLabel;
    }
    return left.message.localeCompare(right.message);
  });
}

export function summarizeProjectAssetRemediation(result) {
  const actions = Array.isArray(result?.remediation?.actions) ? result.remediation.actions : [];
  if (actions.length === 0) {
    return "No remediation actions available.";
  }
  const confirmableCount = actions.filter((action) => action.actionType === "confirmable-fix").length;
  return `${actions.length} remediation action${actions.length === 1 ? "" : "s"} available, ${confirmableCount} confirmable fix${confirmableCount === 1 ? "" : "es"}.`;
}

export function getPrimaryRemediationAction(result, actionType = "") {
  const actions = Array.isArray(result?.remediation?.actions) ? result.remediation.actions : [];
  if (!actionType) {
    return actions[0] || null;
  }
  return actions.find((action) => action.actionType === actionType) || null;
}

export function buildProjectAssetRemediation(options = {}) {
  const validation = options.validationResult?.validation || { status: "valid", findings: [] };
  const registry = sanitizeAssetRegistry(options.registry);
  const findings = Array.isArray(validation.findings) ? validation.findings : [];
  const actions = [];

  findings.forEach((finding) => {
    actions.push(...mapFindingToActions(finding, registry));
  });

  const orderedActions = sortActions(actions);
  return {
    remediation: {
      status: orderedActions.length > 0 ? "available" : "unavailable",
      actions: orderedActions
    }
  };
}
