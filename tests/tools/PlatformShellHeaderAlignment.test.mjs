import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

export async function run() {
  const shellJsPath = path.join(REPO_ROOT, "tools", "shared", "platformShell.js");
  const shellCssPath = path.join(REPO_ROOT, "tools", "shared", "platformShell.css");
  const toolHostHtmlPath = path.join(REPO_ROOT, "tools", "Tool Host", "index.html");

  const shellJs = readFileSync(shellJsPath, "utf8");
  const shellCss = readFileSync(shellCssPath, "utf8");
  const toolHostHtml = readFileSync(toolHostHtmlPath, "utf8");

  assert.match(shellJs, /HEADER_EXPANDED_STORAGE_KEY = "toolboxaid\.toolsPlatform\.headerExpanded"/);
  assert.match(shellJs, /HEADER_EXPANDED_FALLBACK_TOOL = "tool-host"/);
  assert.match(shellJs, /class="tools-platform-frame__accordion"/);
  assert.match(shellJs, /class="tools-platform-frame__accordion-summary"/);
  assert.match(shellJs, /renderSharedActionLinks\(currentTool\?\.id \?\? ""\)/);
  assert.match(shellJs, /document\.body\.dataset\.toolTitle/);

  assert.match(shellCss, /\.tools-platform-frame__accordion-summary/);
  assert.match(shellCss, /\.tools-platform-frame__accordion-content/);
  assert.match(shellCss, /\.tools-platform-frame__summary-meta/);
  assert.match(shellCss, /\.tools-platform-frame__accordion-icon/);

  assert.match(toolHostHtml, /data-tool-title="Tool Host"/);
}
