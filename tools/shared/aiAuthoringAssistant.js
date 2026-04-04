import { buildProjectAssetRemediation, getPrimaryRemediationAction } from "./projectAssetRemediation.js";
import { buildDebugVisualizationLayer } from "./debugVisualizationLayer.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createSuggestion(kind, label, rationale, payload = {}) {
  return {
    kind: sanitizeText(kind),
    label: sanitizeText(label),
    rationale: sanitizeText(rationale),
    payload
  };
}

function createTrace(event, message) {
  return {
    event: sanitizeText(event),
    message: sanitizeText(message)
  };
}

export function summarizeAiAuthoringAssistant(result) {
  const suggestions = Array.isArray(result?.aiAuthoring?.suggestions) ? result.aiAuthoring.suggestions : [];
  if (suggestions.length === 0) {
    return "AI authoring assistant has no suggestions.";
  }
  return `AI authoring assistant prepared ${suggestions.length} auditable suggestions.`;
}

export function buildAiAuthoringAssistant(options = {}) {
  const validationResult = options.validationResult || null;
  const remediationResult = options.remediationResult || buildProjectAssetRemediation({
    validationResult,
    registry: options.registry
  });
  const debugVisualizationResult = options.debugVisualizationResult || buildDebugVisualizationLayer({
    assetDependencyGraph: validationResult?.assetDependencyGraph,
    validationResult,
    remediationResult,
    packageResult: options.packageResult,
    runtimeResult: options.runtimeResult
  });
  const suggestions = [];
  const traces = [
    createTrace("assistant-start", "AI authoring assistant evaluated accepted platform state."),
    createTrace("validation-status", `Validation status is ${sanitizeText(validationResult?.validation?.status) || "unknown"}.`)
  ];

  const navigateSuggestion = getPrimaryRemediationAction(remediationResult, "navigate");
  if (navigateSuggestion) {
    suggestions.push(createSuggestion(
      "inspect",
      navigateSuggestion.label || "Inspect issue",
      navigateSuggestion.message || "Inspect the current issue before changing project state.",
      {
        actionType: navigateSuggestion.actionType,
        sourceId: navigateSuggestion.sourceId,
        confirmed: false
      }
    ));
  }

  const fixSuggestion = getPrimaryRemediationAction(remediationResult, "confirmable-fix");
  if (fixSuggestion) {
    suggestions.push(createSuggestion(
      "confirmable-action",
      fixSuggestion.label || "Apply suggested fix",
      `Safe confirmation boundary required. ${fixSuggestion.message || "Review and confirm before changing project state."}`,
      {
        actionId: fixSuggestion.actionId,
        sourceId: fixSuggestion.sourceId,
        requiresConfirmation: true
      }
    ));
  }

  if ((validationResult?.validation?.status || "unknown") === "valid") {
    suggestions.push(createSuggestion(
      "workflow",
      "Package and validate runtime flow",
      "Project is currently valid, so packaging and runtime verification are safe next steps under accepted boundaries.",
      {
        workflow: "package-runtime-check",
        requiresConfirmation: false
      }
    ));
  }

  suggestions.push(createSuggestion(
    "debug",
    "Review debug visualization",
    "Use the debug visualization layer to inspect graph, validation, remediation, packaging, and runtime state before committing authoring changes.",
    {
      sections: debugVisualizationResult?.debugVisualization?.sections?.map((section) => section.title) || []
    }
  ));

  suggestions.sort((left, right) => {
    const byKind = left.kind.localeCompare(right.kind);
    if (byKind !== 0) {
      return byKind;
    }
    return left.label.localeCompare(right.label);
  });

  return {
    aiAuthoring: {
      status: "ready",
      suggestions,
      traces,
      reportText: [
        summarizeAiAuthoringAssistant({ aiAuthoring: { suggestions } }),
        ...suggestions.map((suggestion) => `[${suggestion.kind}] ${suggestion.label}: ${suggestion.rationale}`),
        ...traces.map((trace) => `[trace] ${trace.event}: ${trace.message}`)
      ].join("\n")
    }
  };
}
