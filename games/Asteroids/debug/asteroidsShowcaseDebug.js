/*
Toolbox Aid
David Quesenberry
04/05/2026
asteroidsShowcaseDebug.js
*/

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatNumber(value, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function toSessionLines(snapshot) {
  const session = asObject(snapshot?.assets?.asteroidsShowcase?.session);
  return [
    `mode=${sanitizeText(session.mode) || "unknown"}`,
    `wave=${formatNumber(session.wave, 0)}`,
    `activePlayer=${formatNumber(session.activePlayer, 0)}`,
    `score=${formatNumber(session.score, 0)}`,
    `highScore=${formatNumber(session.highScore, 0)}`,
    `lives=${formatNumber(session.lives, 0)}`,
    `paused=${Boolean(session.isPaused)}`,
    `status=${sanitizeText(session.status) || "n/a"}`
  ];
}

function toEntityLines(snapshot) {
  const entities = asObject(snapshot?.assets?.asteroidsShowcase?.entities);
  const ship = asObject(entities.ship);
  const ufo = asObject(entities.ufo);
  return [
    `shipActive=${Boolean(ship.active)}`,
    `shipPos=(${Math.round(formatNumber(ship.x, 0))}, ${Math.round(formatNumber(ship.y, 0))})`,
    `shipVel=(${formatNumber(ship.vx, 0).toFixed(1)}, ${formatNumber(ship.vy, 0).toFixed(1)})`,
    `asteroids=${formatNumber(entities.asteroidCount, 0)}`,
    `bullets=${formatNumber(entities.bulletCount, 0)}`,
    `ufoBullets=${formatNumber(entities.ufoBulletCount, 0)}`,
    `ufoActive=${Boolean(ufo.active)}`,
    `ufoType=${sanitizeText(ufo.type) || "none"}`
  ];
}

function toEventLine(entry) {
  const event = asObject(entry);
  const frame = formatNumber(event.frame, 0);
  const type = sanitizeText(event.type) || "EVENT";
  const summary = sanitizeText(event.summary);
  return summary ? `f${frame} ${type} ${summary}` : `f${frame} ${type}`;
}

function toEventLines(snapshot, maxLines = 8) {
  const events = asArray(snapshot?.validation?.asteroidsRecentEvents);
  if (events.length === 0) {
    return ["No Asteroids showcase events recorded."];
  }

  return events
    .slice(-maxLines)
    .reverse()
    .map((entry) => toEventLine(entry));
}

function getPanelRegistry(context) {
  const runtime = context?.consoleRuntime;
  const registry = runtime?.panelRegistry;
  if (!registry || typeof registry.getOrderedPanels !== "function" || typeof registry.setPanelEnabled !== "function") {
    return null;
  }
  return registry;
}

function setPanelEnabled(registry, panelId, enabled) {
  const response = registry.setPanelEnabled(panelId, enabled === true);
  return sanitizeText(response?.status) === "ready";
}

function applyPreset(context, presetId) {
  const registry = getPanelRegistry(context);
  if (!registry) {
    return {
      status: "failed",
      title: "Asteroids Showcase Preset",
      lines: ["Overlay panel registry unavailable."],
      code: "MISSING_OVERLAY_REGISTRY"
    };
  }

  const panels = asArray(registry.getOrderedPanels(true));
  const showcasePanelIds = new Set([
    "asteroids-showcase-session",
    "asteroids-showcase-entities",
    "asteroids-showcase-events"
  ]);

  let enabledCount = 0;
  let updatedCount = 0;

  panels.forEach((panel) => {
    const panelId = sanitizeText(panel?.id);
    if (!panelId) {
      return;
    }

    let shouldEnable = false;
    if (presetId === "events") {
      shouldEnable = panelId === "asteroids-showcase-events"
        || panelId === "runtime-summary"
        || panelId === "validation-warnings";
    } else {
      shouldEnable = showcasePanelIds.has(panelId)
        || panelId === "runtime-summary"
        || panelId === "entity-counts"
        || panelId === "input-summary";
    }

    if (setPanelEnabled(registry, panelId, shouldEnable)) {
      updatedCount += 1;
      if (shouldEnable) {
        enabledCount += 1;
      }
    }
  });

  if (context?.consoleRuntime && typeof context.consoleRuntime.showOverlay === "function") {
    context.consoleRuntime.showOverlay();
  }

  return {
    status: "ready",
    title: "Asteroids Showcase Preset",
    lines: [
      `preset=${presetId === "events" ? "events" : "default"}`,
      `updatedPanels=${updatedCount}`,
      `enabledPanels=${enabledCount}`
    ],
    code: presetId === "events" ? "ASTEROIDS_SHOWCASE_PRESET_EVENTS" : "ASTEROIDS_SHOWCASE_PRESET_DEFAULT"
  };
}

function createEventsCommandResult(context) {
  const events = asArray(context?.validation?.asteroidsRecentEvents);
  const lines = events.length > 0
    ? events.slice(-10).reverse().map((entry) => toEventLine(entry))
    : ["No Asteroids showcase events recorded."];

  return {
    status: "ready",
    title: "Asteroids Showcase Events",
    lines,
    code: "ASTEROIDS_SHOWCASE_EVENTS"
  };
}

export function createAsteroidsShowcaseDebugPlugin() {
  return {
    pluginId: "asteroids.showcase",
    title: "Asteroids Showcase Debug",
    featureFlag: "asteroidsShowcaseDebug",
    autoActivate: true,
    capabilities: [
      { capabilityId: "debug.overlay.panel", version: "1.0.0", required: true },
      { capabilityId: "debug.command-pack", version: "1.0.0", required: true },
      { capabilityId: "debug.diagnostics.snapshot", version: "1.0.0", required: true }
    ],
    getPanels() {
      return [
        {
          id: "asteroids-showcase-session",
          title: "Asteroids Session",
          enabled: true,
          priority: 1120,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "asteroids-showcase-session",
              title: "Asteroids Session",
              lines: toSessionLines(snapshot)
            };
          }
        },
        {
          id: "asteroids-showcase-entities",
          title: "Asteroids Entities",
          enabled: true,
          priority: 1121,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "asteroids-showcase-entities",
              title: "Asteroids Entities",
              lines: toEntityLines(snapshot)
            };
          }
        },
        {
          id: "asteroids-showcase-events",
          title: "Asteroids Events",
          enabled: true,
          priority: 1122,
          source: "validation",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "asteroids-showcase-events",
              title: "Asteroids Events",
              lines: toEventLines(snapshot, 8)
            };
          }
        }
      ];
    },
    getCommandPacks() {
      return [
        {
          packId: "asteroidsshowcase",
          label: "Asteroids Showcase",
          description: "Commands for Asteroids showcase overlay presets and event visibility.",
          commands: [
            {
              name: "asteroidsshowcase.help",
              summary: "Show Asteroids showcase command usage.",
              usage: "asteroidsshowcase.help",
              handler() {
                return {
                  status: "ready",
                  title: "Asteroids Showcase Help",
                  lines: [
                    "asteroidsshowcase.help",
                    "asteroidsshowcase.preset.default",
                    "asteroidsshowcase.preset.events",
                    "asteroidsshowcase.events"
                  ],
                  code: "ASTEROIDS_SHOWCASE_HELP"
                };
              }
            },
            {
              name: "asteroidsshowcase.preset.default",
              summary: "Enable the default Asteroids showcase panel preset.",
              usage: "asteroidsshowcase.preset.default",
              handler(context) {
                return applyPreset(context, "default");
              }
            },
            {
              name: "asteroidsshowcase.preset.events",
              summary: "Enable an events-focused Asteroids showcase panel preset.",
              usage: "asteroidsshowcase.preset.events",
              handler(context) {
                return applyPreset(context, "events");
              }
            },
            {
              name: "asteroidsshowcase.events",
              summary: "Print recent Asteroids showcase gameplay events.",
              usage: "asteroidsshowcase.events",
              handler(context) {
                return createEventsCommandResult(context);
              }
            }
          ]
        }
      ];
    }
  };
}
