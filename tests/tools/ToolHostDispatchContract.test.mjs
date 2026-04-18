/*
Toolbox Aid
David Quesenberry
04/18/2026
ToolHostDispatchContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createToolHostManifest, getToolHostEntryById } from "../../tools/shared/toolHostManifest.js";
import { getVisibleActiveToolRegistry } from "../../tools/toolRegistry.js";

export async function run() {
  const activeTools = getVisibleActiveToolRegistry();
  const manifest = createToolHostManifest();

  assert.equal(manifest.version, 1, "Tool host manifest version must remain stable.");
  assert.equal(manifest.tools.length, activeTools.length, "Tool host manifest should mirror visible active tools.");

  for (const tool of activeTools) {
    const entry = getToolHostEntryById(manifest, tool.id);
    assert.ok(entry, `Missing host entry for tool id ${tool.id}`);
    assert.equal(entry.id, tool.id);
    assert.equal(entry.launchPath, `../${tool.entryPoint}`);
  }

  assert.equal(getToolHostEntryById(manifest, ""), null, "Empty tool id should not resolve.");
  assert.equal(getToolHostEntryById(manifest, "missing-tool"), null, "Unknown tool id should not resolve.");

  const hostMainSource = readFileSync(new URL("../../tools/Tool Host/main.js", import.meta.url), "utf8");
  assert.match(hostMainSource, /searchParams\.get\("tool"\)/, "Tool host should read tool dispatch from query params.");
  assert.match(
    hostMainSource,
    /manifest\.tools\[0\]\?\.id \|\| ""/,
    "Tool host should fall back to first manifest tool when query dispatch is invalid."
  );
  assert.match(
    hostMainSource,
    /writeQueryToolId\(toolId, source === "init"\)/,
    "Tool host should keep URL dispatch state in sync with mounted tool."
  );

  const toolsIndexRendererSource = readFileSync(new URL("../../tools/renderToolsIndex.js", import.meta.url), "utf8");
  assert.match(
    toolsIndexRendererSource,
    /Tool Host\/index\.html\?tool=/,
    "Tools index renderer should generate Tool Host dispatch links."
  );
}
