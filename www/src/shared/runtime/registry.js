export function getRuntimeAndRegistry(context) {
  const runtime = context?.consoleRuntime;
  const panelRegistry = runtime?.panelRegistry;
  if (!runtime || typeof runtime.getState !== "function") {
    return {
      status: "failed",
      code: "MISSING_COMMAND_CONTEXT",
      message: "Console runtime is unavailable.",
      runtime: null,
      panelRegistry: null
    };
  }

  if (!panelRegistry || typeof panelRegistry.getOrderedPanels !== "function" || typeof panelRegistry.setPanelEnabled !== "function") {
    return {
      status: "failed",
      code: "MISSING_OVERLAY_REGISTRY",
      message: "Overlay panel registry is unavailable.",
      runtime,
      panelRegistry: null
    };
  }

  return {
    status: "ready",
    runtime,
    panelRegistry,
    code: "OK",
    message: "ready"
  };
}
