/*
Toolbox Aid
David Quesenberry
04/05/2026
overlayCommandPack.js
*/

import {
  requireAtLeastArgs,
  requireNoArgs,
  standardDetails,
  toLinePair
} from "./packUtils.js";

import { sanitizeText } from "../../../src/engine/debug/inspectors/shared/inspectorUtils.js";

function createFailedResult(title, lines, code, details = {}) {
  return {
    status: "failed",
    title,
    lines: Array.isArray(lines) ? lines : [],
    details: standardDetails(details),
    code
  };
}

function createReadyResult(title, lines, code, details = {}) {
  return {
    status: "ready",
    title,
    lines: Array.isArray(lines) ? lines : [],
    details: standardDetails(details),
    code
  };
}

function getRuntimeAndRegistry(context) {
  const runtime = context?.consoleRuntime;
  if (!runtime || typeof runtime.getState !== "function") {
    return {
      status: "failed",
      error: createFailedResult(
        "Overlay Operator",
        ["Console runtime is unavailable."],
        "MISSING_COMMAND_CONTEXT"
      )
    };
  }

  const registry = runtime.panelRegistry;
  if (!registry || typeof registry.getOrderedPanels !== "function" || typeof registry.setPanelEnabled !== "function") {
    return {
      status: "failed",
      error: createFailedResult(
        "Overlay Operator",
        ["Overlay panel registry is unavailable."],
        "MISSING_OVERLAY_REGISTRY"
      )
    };
  }

  return {
    status: "ready",
    runtime,
    registry
  };
}

function getPanels(registry, includeDisabled = true) {
  const panels = registry.getOrderedPanels(includeDisabled);
  return Array.isArray(panels) ? panels : [];
}

function buildPanelSnapshot(registry) {
  const panels = getPanels(registry, true);
  return {
    version: "1",
    updatedAt: Date.now(),
    panels: panels.map((panel) => ({
      id: sanitizeText(panel?.id),
      enabled: Boolean(panel?.enabled)
    }))
  };
}

function persistOverlayState(context, registry) {
  if (typeof context?.persistOverlayPanelState !== "function") {
    return "PERSISTENCE_NOT_CONFIGURED";
  }
  try {
    context.persistOverlayPanelState(buildPanelSnapshot(registry));
    return "PERSISTENCE_UPDATED";
  } catch (_error) {
    return "PERSISTENCE_UPDATE_FAILED";
  }
}

function findPanel(registry, panelId) {
  const id = sanitizeText(panelId);
  if (!id) {
    return null;
  }
  const panels = getPanels(registry, true);
  return panels.find((panel) => panel.id === id) || null;
}

function formatPanelLine(panel, index) {
  return `${index + 1}. id=${panel.id} enabled=${Boolean(panel.enabled)} order=${panel.priority}`;
}

function formatPanelOrderLine(panel, index) {
  return `${index + 1}. order=${panel.priority} id=${panel.id} enabled=${Boolean(panel.enabled)}`;
}

function buildMissingPanelError(registry, panelId) {
  const requested = sanitizeText(panelId);
  const availableIds = getPanels(registry, true).map((panel) => panel.id);
  const lines = [
    `panelId=${requested || "n/a"}`,
    "Panel not found."
  ];
  if (availableIds.length > 0) {
    lines.push(`available=${availableIds.join(", ")}`);
  } else {
    lines.push("available=none");
  }
  return createFailedResult(
    "Overlay Panel",
    lines,
    "OVERLAY_PANEL_NOT_FOUND",
    {
      panelId: requested,
      availableIds
    }
  );
}

function setPanelState(registry, panelId, enabled) {
  const result = registry.setPanelEnabled(panelId, enabled === true);
  const normalizedStatus = sanitizeText(result?.status);
  if (normalizedStatus !== "ready") {
    return createFailedResult(
      "Overlay Panel",
      [
        toLinePair("panelId", panelId),
        toLinePair("enabled", enabled === true),
        "Panel state update failed."
      ],
      "OVERLAY_PANEL_SET_FAILED",
      {
        panelId,
        enabled: enabled === true,
        result
      }
    );
  }
  return null;
}

function togglePanelState(registry, panel) {
  const nextEnabled = !Boolean(panel.enabled);
  return {
    nextEnabled,
    failure: setPanelState(registry, panel.id, nextEnabled)
  };
}

export function createOverlayCommandPack() {
  return {
    packId: "overlay",
    label: "Overlay",
    description: "Operator commands for overlay panel visibility and ordering.",
    commands: [
      {
        name: "overlay.help",
        summary: "Show overlay operator command usage.",
        usage: "overlay.help",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler() {
          return createReadyResult(
            "Overlay Help",
            [
              "overlay.help",
              "overlay.list",
              "overlay.status",
              "overlay.show <panelId>",
              "overlay.hide <panelId>",
              "overlay.toggle <panelId>",
              "overlay.showAll",
              "overlay.hideAll",
              "overlay.order"
            ],
            "OVERLAY_HELP"
          );
        }
      },
      {
        name: "overlay.list",
        summary: "List overlay panels with deterministic order and state.",
        usage: "overlay.list",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const runtimeContext = getRuntimeAndRegistry(context);
          if (runtimeContext.status !== "ready") {
            return runtimeContext.error;
          }

          const allPanels = getPanels(runtimeContext.registry, true);
          const lines = allPanels.length > 0
            ? allPanels.map((panel, index) => formatPanelLine(panel, index))
            : ["No overlay panels are registered."];

          return createReadyResult(
            "Overlay List",
            [
              toLinePair("panelCount", allPanels.length),
              ...lines
            ],
            "OVERLAY_LIST",
            {
              panelCount: allPanels.length
            }
          );
        }
      },
      {
        name: "overlay.status",
        summary: "Show overlay visibility and panel state counts.",
        usage: "overlay.status",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const runtimeContext = getRuntimeAndRegistry(context);
          if (runtimeContext.status !== "ready") {
            return runtimeContext.error;
          }

          const allPanels = getPanels(runtimeContext.registry, true);
          const enabledPanels = allPanels.filter((panel) => panel.enabled === true);
          const runtimeState = runtimeContext.runtime.getState();
          return createReadyResult(
            "Overlay Status",
            [
              toLinePair("overlayVisible", Boolean(runtimeState.overlayVisible)),
              toLinePair("panelCount", allPanels.length),
              toLinePair("enabledCount", enabledPanels.length),
              toLinePair("disabledCount", allPanels.length - enabledPanels.length)
            ],
            "OVERLAY_STATUS",
            {
              state: runtimeState,
              panelCount: allPanels.length,
              enabledCount: enabledPanels.length
            }
          );
        }
      },
      {
        name: "overlay.show",
        summary: "Enable one overlay panel by id.",
        usage: "overlay.show <panelId>",
        validate({ args, commandName }) {
          return requireAtLeastArgs(1, { args, commandName });
        },
        handler(context, args) {
          const runtimeContext = getRuntimeAndRegistry(context);
          if (runtimeContext.status !== "ready") {
            return runtimeContext.error;
          }

          const panelId = sanitizeText(args?.[0]);
          const panel = findPanel(runtimeContext.registry, panelId);
          if (!panel) {
            return buildMissingPanelError(runtimeContext.registry, panelId);
          }

          const failure = setPanelState(runtimeContext.registry, panelId, true);
          if (failure) {
            return failure;
          }

          runtimeContext.runtime.showOverlay();
          const nextPanel = findPanel(runtimeContext.registry, panelId);
          const runtimeState = runtimeContext.runtime.getState();
          const persistence = persistOverlayState(context, runtimeContext.registry);
          return createReadyResult(
            "Overlay Show",
            [
              toLinePair("panelId", panelId),
              toLinePair("enabled", Boolean(nextPanel?.enabled)),
              toLinePair("overlayVisible", Boolean(runtimeState.overlayVisible)),
              toLinePair("persistence", persistence)
            ],
            "OVERLAY_SHOW",
            {
              panelId,
              enabled: Boolean(nextPanel?.enabled),
              overlayVisible: Boolean(runtimeState.overlayVisible),
              persistence
            }
          );
        }
      },
      {
        name: "overlay.hide",
        summary: "Disable one overlay panel by id.",
        usage: "overlay.hide <panelId>",
        validate({ args, commandName }) {
          return requireAtLeastArgs(1, { args, commandName });
        },
        handler(context, args) {
          const runtimeContext = getRuntimeAndRegistry(context);
          if (runtimeContext.status !== "ready") {
            return runtimeContext.error;
          }

          const panelId = sanitizeText(args?.[0]);
          const panel = findPanel(runtimeContext.registry, panelId);
          if (!panel) {
            return buildMissingPanelError(runtimeContext.registry, panelId);
          }

          const failure = setPanelState(runtimeContext.registry, panelId, false);
          if (failure) {
            return failure;
          }

          const nextPanel = findPanel(runtimeContext.registry, panelId);
          const runtimeState = runtimeContext.runtime.getState();
          const persistence = persistOverlayState(context, runtimeContext.registry);
          return createReadyResult(
            "Overlay Hide",
            [
              toLinePair("panelId", panelId),
              toLinePair("enabled", Boolean(nextPanel?.enabled)),
              toLinePair("overlayVisible", Boolean(runtimeState.overlayVisible)),
              toLinePair("persistence", persistence)
            ],
            "OVERLAY_HIDE",
            {
              panelId,
              enabled: Boolean(nextPanel?.enabled),
              overlayVisible: Boolean(runtimeState.overlayVisible),
              persistence
            }
          );
        }
      },
      {
        name: "overlay.toggle",
        summary: "Toggle one overlay panel by id.",
        usage: "overlay.toggle <panelId>",
        validate({ args, commandName }) {
          return requireAtLeastArgs(1, { args, commandName });
        },
        handler(context, args) {
          const runtimeContext = getRuntimeAndRegistry(context);
          if (runtimeContext.status !== "ready") {
            return runtimeContext.error;
          }

          const panelId = sanitizeText(args?.[0]);
          const panel = findPanel(runtimeContext.registry, panelId);
          if (!panel) {
            return buildMissingPanelError(runtimeContext.registry, panelId);
          }

          const toggle = togglePanelState(runtimeContext.registry, panel);
          if (toggle.failure) {
            return toggle.failure;
          }

          const nextPanel = findPanel(runtimeContext.registry, panelId);
          const persistence = persistOverlayState(context, runtimeContext.registry);
          return createReadyResult(
            "Overlay Toggle",
            [
              toLinePair("panelId", panelId),
              toLinePair("enabled", Boolean(nextPanel?.enabled)),
              toLinePair("persistence", persistence)
            ],
            "OVERLAY_TOGGLE",
            {
              panelId,
              enabled: Boolean(nextPanel?.enabled),
              persistence
            }
          );
        }
      },
      {
        name: "overlay.showAll",
        summary: "Enable all overlay panels and show the overlay.",
        usage: "overlay.showAll",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const runtimeContext = getRuntimeAndRegistry(context);
          if (runtimeContext.status !== "ready") {
            return runtimeContext.error;
          }

          const allPanels = getPanels(runtimeContext.registry, true);
          let changedCount = 0;
          for (let index = 0; index < allPanels.length; index += 1) {
            const panel = allPanels[index];
            const wasEnabled = panel.enabled === true;
            const failure = setPanelState(runtimeContext.registry, panel.id, true);
            if (failure) {
              return failure;
            }
            if (!wasEnabled) {
              changedCount += 1;
            }
          }

          runtimeContext.runtime.showOverlay();
          const runtimeState = runtimeContext.runtime.getState();
          const persistence = persistOverlayState(context, runtimeContext.registry);
          return createReadyResult(
            "Overlay ShowAll",
            [
              toLinePair("panelCount", allPanels.length),
              toLinePair("changedCount", changedCount),
              toLinePair("overlayVisible", Boolean(runtimeState.overlayVisible)),
              toLinePair("persistence", persistence)
            ],
            "OVERLAY_SHOW_ALL",
            {
              panelCount: allPanels.length,
              changedCount,
              overlayVisible: Boolean(runtimeState.overlayVisible),
              persistence
            }
          );
        }
      },
      {
        name: "overlay.hideAll",
        summary: "Disable all overlay panels.",
        usage: "overlay.hideAll",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const runtimeContext = getRuntimeAndRegistry(context);
          if (runtimeContext.status !== "ready") {
            return runtimeContext.error;
          }

          const allPanels = getPanels(runtimeContext.registry, true);
          let changedCount = 0;
          for (let index = 0; index < allPanels.length; index += 1) {
            const panel = allPanels[index];
            const wasEnabled = panel.enabled === true;
            const failure = setPanelState(runtimeContext.registry, panel.id, false);
            if (failure) {
              return failure;
            }
            if (wasEnabled) {
              changedCount += 1;
            }
          }

          const runtimeState = runtimeContext.runtime.getState();
          const persistence = persistOverlayState(context, runtimeContext.registry);
          return createReadyResult(
            "Overlay HideAll",
            [
              toLinePair("panelCount", allPanels.length),
              toLinePair("changedCount", changedCount),
              toLinePair("overlayVisible", Boolean(runtimeState.overlayVisible)),
              toLinePair("persistence", persistence)
            ],
            "OVERLAY_HIDE_ALL",
            {
              panelCount: allPanels.length,
              changedCount,
              overlayVisible: Boolean(runtimeState.overlayVisible),
              persistence
            }
          );
        }
      },
      {
        name: "overlay.order",
        summary: "List deterministic panel ordering details.",
        usage: "overlay.order",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const runtimeContext = getRuntimeAndRegistry(context);
          if (runtimeContext.status !== "ready") {
            return runtimeContext.error;
          }

          const allPanels = getPanels(runtimeContext.registry, true);
          const lines = allPanels.length > 0
            ? allPanels.map((panel, index) => formatPanelOrderLine(panel, index))
            : ["No overlay panels are registered."];

          return createReadyResult(
            "Overlay Order",
            [
              toLinePair("panelCount", allPanels.length),
              ...lines
            ],
            "OVERLAY_ORDER",
            {
              panelCount: allPanels.length
            }
          );
        }
      }
    ]
  };
}
