
# BUILD_PR_LEVEL_11_175_SVG_EARLY_EXIT_WORKSPACE_ENTRY

## Purpose
Force SVG Asset Studio to bypass platformShell entirely in hosted mode via early-exit execution control.

## Root Cause (FINAL)
SVG entry never switches execution path.
platformShell initializes first and owns badge rendering.

## Fix
Take ownership at entry point BEFORE platformShell loads.

## Implementation

File:
toolbox/SVG Asset Studio/main.js

### Add at TOP of file (before any shell init)

const params = new URLSearchParams(window.location.search);

const isHosted =
  params.get("hosted") === "1" &&
  params.get("hostToolId") === "svg-asset-studio" &&
  params.get("hostContextId");

if (isHosted) {
  console.log("[SVG_HOSTED_WORKSPACE_ENTRY]");

  import("../shared/workspaceShell.js").then((mod) => {
    if (mod && typeof mod.initWorkspaceShell === "function") {
      mod.initWorkspaceShell();
    }
  });

  // CRITICAL: STOP ALL FURTHER EXECUTION
  throw new Error("SVG_HOSTED_EARLY_EXIT");
}

## Rules
- MUST be at very top
- MUST prevent platformShell init
- MUST not fallback
- MUST not continue execution

## Acceptance
Console MUST show:
[SVG_HOSTED_WORKSPACE_ENTRY]
[WORKSPACE_SHELL_STATE]

Console MUST NOT show:
platformShell renderToolAssetBadge svg-asset-studio

UI:
Asset label shows correct SVG sourceName
