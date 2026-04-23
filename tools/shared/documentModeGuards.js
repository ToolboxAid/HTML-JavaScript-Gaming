function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

const VIEWER_PAYLOAD_STORAGE_KEY_PREFIX = "toolboxaid.viewerPayload.";

function stashViewerPayload(payload, sourceToolId = "") {
  if (typeof window === "undefined" || !payload || typeof payload !== "object") {
    return "";
  }
  const payloadId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const storageKey = `${VIEWER_PAYLOAD_STORAGE_KEY_PREFIX}${payloadId}`;
  const wrapped = {
    payload,
    sourceToolId: sanitizeText(sourceToolId).toLowerCase(),
    routedAt: new Date().toISOString()
  };
  const serialized = JSON.stringify(wrapped);
  try {
    window.sessionStorage.setItem(storageKey, serialized);
  } catch {
    try {
      window.localStorage.setItem(storageKey, serialized);
    } catch {
      return "";
    }
  }
  return payloadId;
}

function navigateToTool(toolId, options = {}) {
  if (typeof window === "undefined") {
    return false;
  }
  const normalizedToolId = sanitizeText(toolId).toLowerCase();
  if (!normalizedToolId) {
    return false;
  }
  const entry = TOOL_REGISTRY_BY_ID.get(normalizedToolId);
  if (!entry?.entryPoint) {
    return false;
  }
  const targetUrl = new URL(`../${entry.entryPoint}`, window.location.href);
  const inspectPayloadKey = sanitizeText(options.inspectPayloadKey);
  if (inspectPayloadKey) {
    targetUrl.searchParams.set("inspectPayloadKey", inspectPayloadKey);
  }
  window.location.assign(targetUrl.toString());
  return true;
}

const TOOL_REGISTRY_BY_ID = new Map([
  ["state-inspector", { displayName: "State Inspector", entryPoint: "State Inspector/index.html" }],
  ["palette-browser", { displayName: "Palette Browser / Manager", entryPoint: "Palette Browser/index.html" }],
  ["sprite-editor", { displayName: "Sprite Editor", entryPoint: "Sprite Editor/index.html" }],
  ["tile-map-editor", { displayName: "Tilemap Studio", entryPoint: "Tilemap Studio/index.html" }],
  ["parallax-editor", { displayName: "Parallax Scene Studio", entryPoint: "Parallax Scene Studio/index.html" }],
  ["vector-map-editor", { displayName: "Vector Map Editor", entryPoint: "Vector Map Editor/index.html" }],
  ["vector-asset-studio", { displayName: "Vector Asset Studio", entryPoint: "Vector Asset Studio/index.html" }]
]);

function inferToolIdFromDocument(rawDocument) {
  if (!rawDocument || typeof rawDocument !== "object") {
    return "";
  }
  const explicit = getDocumentToolId(rawDocument);
  if (explicit) {
    return explicit;
  }
  const schema = sanitizeText(rawDocument.schema).toLowerCase();
  const format = sanitizeText(rawDocument.format).toLowerCase();
  if (schema === "toolbox.tilemap/1") {
    return "tile-map-editor";
  }
  if (schema === "toolbox.parallax/1") {
    return "parallax-editor";
  }
  if (format === "toolboxaid.sprite-editor.project") {
    return "sprite-editor";
  }
  if (
    Array.isArray(rawDocument.entries)
    && typeof rawDocument.name === "string"
    && !Array.isArray(rawDocument.frames)
    && !Array.isArray(rawDocument.layers)
  ) {
    return "palette-browser";
  }
  if (
    Array.isArray(rawDocument.objects)
    && Number.isFinite(Number(rawDocument.width))
    && Number.isFinite(Number(rawDocument.height))
  ) {
    return "vector-map-editor";
  }
  return "";
}

export function isWorkspaceManagerContext() {
  if (typeof window === "undefined") {
    return false;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const currentPath = window.location.pathname || "";
  const isHostedWorkspaceView = searchParams.get("hosted") === "1"
    || searchParams.has("hostToolId")
    || searchParams.has("hostContextId");
  const isWorkspaceManagerReferrer = /\/tools\/Workspace(?:%20| )Manager\//i.test(document.referrer || "");
  const isWorkspaceManagerParent = (() => {
    try {
      return window.top !== window
        && /\/tools\/Workspace(?:%20| )Manager\//i.test(window.top.location.pathname || "");
    } catch {
      return false;
    }
  })();
  return isHostedWorkspaceView
    || isWorkspaceManagerReferrer
    || isWorkspaceManagerParent
    || /\/tools\/Workspace%20Manager\//i.test(currentPath)
    || /\/tools\/Workspace Manager\//i.test(currentPath);
}

export function getDocumentMode(rawDocument) {
  if (!rawDocument || typeof rawDocument !== "object") {
    return "";
  }
  const directMode = sanitizeText(rawDocument.mode || rawDocument.contextMode || rawDocument.documentMode);
  if (directMode) {
    return directMode.toLowerCase();
  }
  const metadataMode = sanitizeText(rawDocument?.metadata?.mode || rawDocument?.metadata?.contextMode);
  return metadataMode.toLowerCase();
}

export function getDocumentToolId(rawDocument) {
  if (!rawDocument || typeof rawDocument !== "object") {
    return "";
  }
  const directToolId = sanitizeText(rawDocument.toolId || rawDocument.sourceToolId);
  if (directToolId) {
    return directToolId.toLowerCase();
  }
  const metadataToolId = sanitizeText(rawDocument?.metadata?.toolId || rawDocument?.metadata?.sourceToolId);
  return metadataToolId.toLowerCase();
}

export function detectWorkspaceDocument(rawDocument) {
  if (!rawDocument || typeof rawDocument !== "object") {
    return false;
  }
  const documentKind = sanitizeText(rawDocument.documentKind);
  const schema = sanitizeText(rawDocument.schema).toLowerCase();
  return documentKind === "workspace-manifest" || schema === "html-js-gaming.project";
}

export function assertStandaloneToolDocument(rawDocument, options = {}) {
  const expectedLabel = sanitizeText(options.expectedLabel) || "tool document";
  const requiredToolId = sanitizeText(options.requiredToolId).toLowerCase();
  const acceptedSchemas = Array.isArray(options.acceptedSchemas)
    ? options.acceptedSchemas.map((value) => sanitizeText(value).toLowerCase()).filter(Boolean)
    : [];
  const acceptedFormats = Array.isArray(options.acceptedFormats)
    ? options.acceptedFormats.map((value) => sanitizeText(value).toLowerCase()).filter(Boolean)
    : [];

  if (!rawDocument || typeof rawDocument !== "object") {
    return { ok: false, reason: "Document must be a JSON object." };
  }

  if (detectWorkspaceDocument(rawDocument)) {
    return {
      ok: false,
      reason: "This file is a Workspace document. Open it from Workspace Manager instead."
    };
  }

  const mode = getDocumentMode(rawDocument);
  if (mode && mode !== "tool") {
    return {
      ok: false,
      reason: `This file is marked for ${mode} mode. Load a ${expectedLabel} saved in tool mode.`
    };
  }

  if (requiredToolId) {
    const explicitToolId = getDocumentToolId(rawDocument);
    const inferredToolId = inferToolIdFromDocument(rawDocument);
    if (explicitToolId && explicitToolId !== requiredToolId) {
      return {
        ok: false,
        reason: `This file belongs to ${explicitToolId}. Load it in that tool instead of ${requiredToolId}.`,
        reasonCode: "tool-id-mismatch",
        detectedToolId: explicitToolId,
        expectedToolId: requiredToolId
      };
    }
    if (!explicitToolId) {
      return {
        ok: false,
        reason: `This file is missing toolId metadata for ${requiredToolId}. Re-save it from the correct tool and load again.`,
        reasonCode: "missing-tool-id",
        detectedToolId: inferredToolId || "",
        expectedToolId: requiredToolId
      };
    }
  }

  const schema = sanitizeText(rawDocument.schema).toLowerCase();
  const format = sanitizeText(rawDocument.format).toLowerCase();
  if (acceptedSchemas.length > 0 || acceptedFormats.length > 0) {
    const schemaOk = acceptedSchemas.length === 0 || acceptedSchemas.includes(schema);
    const formatOk = acceptedFormats.length === 0 || acceptedFormats.includes(format);
    if (!schemaOk && !formatOk) {
      return {
        ok: false,
        reason: `Unsupported document type for ${expectedLabel}.`
      };
    }
  }

  return { ok: true, reason: "" };
}

export function addToolModeMetadata(rawDocument, options = {}) {
  const sourceToolId = sanitizeText(options.toolId || options.sourceToolId);
  if (!rawDocument || typeof rawDocument !== "object") {
    return rawDocument;
  }
  const output = { ...rawDocument };
  output.mode = "tool";
  if (sourceToolId) {
    output.toolId = sourceToolId;
    output.sourceToolId = sourceToolId;
  }
  const metadata = output.metadata && typeof output.metadata === "object"
    ? { ...output.metadata }
    : {};
  metadata.mode = "tool";
  if (sourceToolId) {
    metadata.toolId = sourceToolId;
    metadata.sourceToolId = sourceToolId;
  }
  output.metadata = metadata;
  return output;
}

export function offerImportMismatchOptions(guardResult, options = {}) {
  if (typeof window === "undefined") {
    return false;
  }
  if (!guardResult || guardResult.ok === true) {
    return false;
  }
  const reasonCode = sanitizeText(guardResult.reasonCode).toLowerCase();
  if (reasonCode !== "tool-id-mismatch" && reasonCode !== "missing-tool-id") {
    return false;
  }

  const detectedToolId = sanitizeText(guardResult.detectedToolId).toLowerCase();
  const correctToolId = reasonCode === "missing-tool-id" ? "" : detectedToolId;
  const correctEntry = TOOL_REGISTRY_BY_ID.get(correctToolId);

  const lines = [
    sanitizeText(guardResult.reason) || "Import blocked due to tool mismatch.",
    "",
    "Choose an option:",
    "1) OK"
  ];
  if (correctEntry) {
    lines.push(`2) Open with correct tool (${correctEntry.displayName})`);
  }

  const response = window.prompt(lines.join("\n"), "1");
  const choice = sanitizeText(response);
  if (choice === "2" && correctEntry) {
    return navigateToTool(correctToolId);
  }
  return false;
}
