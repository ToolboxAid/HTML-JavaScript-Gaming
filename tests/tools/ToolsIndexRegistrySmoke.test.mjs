import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getVisibleActiveToolRegistry } from "../../tools/toolRegistry.js";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

export async function run() {
  const visibleTools = getVisibleActiveToolRegistry();
  assert.ok(visibleTools.length > 0, "Visible active tool registry must not be empty.");

  visibleTools.forEach((tool) => {
    assert.ok(tool.id, "Tool id is required.");
    assert.ok(tool.folderName, `Tool folderName is required: ${tool.id}`);
    assert.ok(tool.entryPoint, `Tool entryPoint is required: ${tool.id}`);

    const folderPath = path.join(REPO_ROOT, "tools", tool.folderName);
    const entryPointPath = path.join(REPO_ROOT, "tools", tool.entryPoint);
    assert.equal(statSync(folderPath).isDirectory(), true, `Missing tool directory: ${tool.folderName}`);
    assert.equal(statSync(entryPointPath).isFile(), true, `Missing tool entry point: ${tool.entryPoint}`);
  });

  const toolsIndexHtml = readFileSync(path.join(REPO_ROOT, "tools", "index.html"), "utf8");
  assert.match(toolsIndexHtml, /data-active-tools-grid/);
  assert.match(toolsIndexHtml, /<script type="module" src="\.\/renderToolsIndex\.js"><\/script>/);
  assert.match(toolsIndexHtml, /<script type="module" src="\.\/shared\/platformShell\.js"><\/script>/);

  const renderToolsIndexJs = readFileSync(path.join(REPO_ROOT, "tools", "renderToolsIndex.js"), "utf8");
  assert.match(renderToolsIndexJs, /from "\.\/toolRegistry\.js"/);
  assert.match(renderToolsIndexJs, /\.filter\(\(entry\) => entry\.active === true\)/);
  assert.match(renderToolsIndexJs, /\.filter\(\(entry\) => entry\.visibleInToolsList === true\)/);
  assert.match(renderToolsIndexJs, /Tool Host\/index\.html\?tool=/);
}
