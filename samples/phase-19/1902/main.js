/*
Toolbox Aid
David Quesenberry
04/28/2026
main.js
*/

const WORKSPACE_PATH = "/tools/Workspace%20Manager/index.html";

function buildWorkspaceHref() {
  const params = new URLSearchParams({
    tool: "world-vector-studio-v2",
    sampleId: "1902",
    sampleTitle: "Workspace All Tools Integration",
    samplePresetPath: "/samples/phase-19/1902/sample.1902.workspace-all-tools.json"
  });
  return WORKSPACE_PATH + "?" + params.toString();
}

function applyLaunchLink() {
  const link = document.getElementById("workspaceLaunchLink");
  if (link instanceof HTMLAnchorElement) {
    link.href = buildWorkspaceHref();
  }
}

function shouldAutoLaunch() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("stay") === "1") {
    return false;
  }
  return true;
}

function launchWorkspace() {
  if (!shouldAutoLaunch()) {
    return;
  }
  window.location.assign(buildWorkspaceHref());
}

applyLaunchLink();
launchWorkspace();
