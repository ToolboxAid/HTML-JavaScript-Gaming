import { getActiveToolRegistry } from "../toolRegistry.js";

const TOOL_HOST_MANIFEST_SCHEMA = "tools.tool-host-manifest/1";

function toHostLaunchPath(entryPoint) {
  return `../${entryPoint}`;
}

function createToolHostEntry(tool) {
  return {
    id: tool.id,
    displayName: tool.displayName,
    description: tool.description,
    entryPoint: tool.entryPoint,
    launchPath: toHostLaunchPath(tool.entryPoint)
  };
}

export function createToolHostManifest() {
  const tools = getActiveToolRegistry()
    .filter((tool) => tool.visibleInToolsList === true)
    .map((tool) => createToolHostEntry(tool));

  return {
    schema: TOOL_HOST_MANIFEST_SCHEMA,
    version: 1,
    tools
  };
}

export function getToolHostEntryById(manifest, toolId) {
  if (!manifest || !Array.isArray(manifest.tools)) {
    return null;
  }
  const id = typeof toolId === "string" ? toolId.trim() : "";
  if (!id) {
    return null;
  }
  return manifest.tools.find((entry) => entry.id === id) || null;
}
