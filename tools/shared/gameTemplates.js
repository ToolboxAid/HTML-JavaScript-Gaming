import { buildGameplaySystemLayer } from "./gameplaySystemLayer.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

const TEMPLATE_RULES = Object.freeze({
  arcade: ["entity-visual", "world-layout"],
  platformer: ["world-layout", "supporting-content"],
  showcase: ["entity-visual", "supporting-content"]
});

export function summarizeGameTemplates(result) {
  const templates = Array.isArray(result?.templates?.templates) ? result.templates.templates : [];
  if (result?.templates?.status !== "ready") {
    return "Game templates unavailable.";
  }
  return `Game templates ready with ${templates.length} templates.`;
}

export function buildGameTemplates(options = {}) {
  const gameplay = options.gameplayResult?.gameplay || buildGameplaySystemLayer(options).gameplay;
  if (gameplay.status !== "ready") {
    return {
      templates: {
        status: "blocked",
        templates: [],
        reports: [createReport("error", "GAME_TEMPLATES_BLOCKED", "Game templates require ready gameplay bindings.")]
      }
    };
  }

  const roles = gameplay.bindings.map((binding) => sanitizeText(binding.role));
  const templates = Object.keys(TEMPLATE_RULES)
    .sort((left, right) => left.localeCompare(right))
    .map((templateId) => ({
      templateId,
      compatible: TEMPLATE_RULES[templateId].every((role) => roles.includes(role)),
      requiredRoles: TEMPLATE_RULES[templateId].slice()
    }));

  return {
    templates: {
      status: "ready",
      templates,
      reports: [
        createReport("info", "GAME_TEMPLATES_READY", `Prepared ${templates.length} deterministic template evaluations.`)
      ],
      reportText: [
        summarizeGameTemplates({ templates: { status: "ready", templates } }),
        ...templates.map((template) => `${template.templateId}: ${template.compatible ? "compatible" : "incomplete"} (${template.requiredRoles.join(", ")})`)
      ].join("\n")
    }
  };
}
