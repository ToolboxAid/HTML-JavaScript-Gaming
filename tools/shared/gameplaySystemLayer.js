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

function inferBindingRole(asset) {
  const type = sanitizeText(asset?.type);
  if (type === "sprite") {
    return "entity-visual";
  }
  if (type === "tilemap") {
    return "world-layout";
  }
  if (type === "tileset" || type === "palette" || type === "image" || type === "parallaxLayer") {
    return "supporting-content";
  }
  return "data";
}

export function summarizeGameplaySystemLayer(result) {
  const bindings = Array.isArray(result?.gameplay?.bindings) ? result.gameplay.bindings : [];
  if (result?.gameplay?.status !== "ready") {
    return "Gameplay system layer unavailable.";
  }
  return `Gameplay system layer ready with ${bindings.length} content bindings.`;
}

export function buildGameplaySystemLayer(options = {}) {
  const bootstrap = options.runtimeResult?.bootstrap || null;
  const manifest = bootstrap?.packageManifest?.package || options.packageManifest?.package || null;
  if (!manifest || !Array.isArray(manifest.assets) || manifest.assets.length === 0) {
    return {
      gameplay: {
        status: "blocked",
        bindings: [],
        reports: [createReport("error", "GAMEPLAY_INPUT_MISSING", "Gameplay system layer requires packaged/runtime content input.")]
      }
    };
  }

  const bindings = manifest.assets
    .slice()
    .sort((left, right) => sanitizeText(left?.id).localeCompare(sanitizeText(right?.id)))
    .map((asset) => ({
      assetId: sanitizeText(asset.id),
      assetType: sanitizeText(asset.type),
      role: inferBindingRole(asset),
      startup: (bootstrap?.startupAssetIds || []).includes(sanitizeText(asset.id))
    }));

  const systems = [
    { id: "content-binding", role: "maps packaged content to gameplay bindings" },
    { id: "state-orchestration", role: "coordinates gameplay state from startup bindings" }
  ];

  return {
    gameplay: {
      status: "ready",
      bindings,
      systems,
      reports: [
        createReport("info", "GAMEPLAY_BINDINGS_READY", `Prepared ${bindings.length} deterministic gameplay bindings from packaged content.`)
      ],
      reportText: [
        summarizeGameplaySystemLayer({ gameplay: { status: "ready", bindings } }),
        `Systems: ${systems.map((system) => `${system.id}(${system.role})`).join(", ")}`,
        ...bindings.map((binding) => `${binding.assetId} -> ${binding.role}${binding.startup ? " [startup]" : ""}`)
      ].join("\n")
    }
  };
}
