/*
Toolbox Aid
David Quesenberry
04/17/2026
DebugObservabilityMaturity.test.mjs
*/
import assert from "node:assert/strict";
import { drawPerformanceMetricsPanel } from "../../src/engine/debug/PerformanceMetricsPanel.js";
import { create3dCollisionOverlaysPanel, createCollisionOverlaysProvider } from "../../src/engine/debug/standard/threeD/index.js";
import { createAdvancedInspectorDebugPluginDefinition } from "../../src/engine/debug/inspectors/index.js";
import { createNetworkObservabilityPanels } from "../../src/engine/debug/network/index.js";
import { drawActionInputDebugOverlay } from "../../src/engine/input/ActionInputDebugOverlay.js";

function createRendererProbe() {
  const texts = [];
  return {
    texts,
    drawRect() {},
    strokeRect() {},
    drawText(text) {
      texts.push(String(text));
    }
  };
}

export async function run() {
  const renderingRenderer = createRendererProbe();
  drawPerformanceMetricsPanel(
    renderingRenderer,
    {
      getSnapshot: () => ({
        fps: 59.7,
        frameMs: 16.73,
        updateMs: 5.3,
        renderMs: 4.21,
        fixedUpdates: 1
      })
    },
    { x: 0, y: 0 }
  );
  assert.equal(renderingRenderer.texts.some((line) => line.includes("Render ms: 4.21")), true);

  const inputRenderer = createRendererProbe();
  drawActionInputDebugOverlay(
    inputRenderer,
    {
      getActionDebugSnapshot: () => [
        {
          action: "move",
          down: true,
          pressed: true,
          buffered: false,
          queued: true,
          windowOpen: true,
          cooldown: false
        }
      ],
      getQueuedActions: () => [{ action: "move", priority: 2 }],
      getActionChainProgress: () => 2,
      isActionChainComplete: () => false
    },
    {
      x: 0,
      y: 0,
      chains: ["movement"]
    }
  );
  assert.equal(inputRenderer.texts.some((line) => line.includes("move: D1 P1 B0 Q1 W1 C0")), true);
  assert.equal(inputRenderer.texts.some((line) => line.includes("Queue: move:2")), true);

  const collisionProvider = createCollisionOverlaysProvider({
    collisionOverlays: () => ({
      overlays: [
        { overlayId: "broadphase", kind: "bounds", state: "active", enabled: true }
      ]
    })
  });
  const collisionSnapshot = collisionProvider.getSnapshot({});
  assert.equal(collisionSnapshot.overlayCount, 1);
  assert.equal(collisionSnapshot.activeCount, 1);

  const collisionPanel = create3dCollisionOverlaysPanel(collisionProvider, { enabled: true });
  const collisionRender = collisionPanel.render({}, {});
  assert.equal(collisionRender.lines.includes("overlay.1=broadphase|bounds|active|enabled=true"), true);

  const inspectorPlugin = createAdvancedInspectorDebugPluginDefinition({
    panelsEnabled: true
  });
  const inspectorProviders = inspectorPlugin.getProviders();
  assert.equal(
    inspectorProviders.some((provider) => provider.providerId === "inspector.stateDiff.snapshot"),
    true
  );
  assert.equal(
    inspectorProviders.some((provider) => provider.providerId === "inspector.timeline.snapshot"),
    true
  );

  const inspectorContext = {
    inspectors: {
      state: {
        current: {
          mode: "play",
          replayFrame: 12
        }
      },
      timelineMarkers: [
        {
          markerId: "replay-12",
          frameIndex: 12,
          category: "replay",
          label: "Replay frame 12"
        }
      ],
      eventStream: [
        {
          eventId: "input-pressed",
          category: "input",
          message: "move pressed"
        }
      ]
    }
  };

  const inspectorPanels = inspectorPlugin.getPanels();
  const stateDiffPanel = inspectorPanels.find((panel) => panel.id === "inspector-state-diff");
  const timelinePanel = inspectorPanels.find((panel) => panel.id === "inspector-timeline");
  const stateDiffRender = stateDiffPanel.render(stateDiffPanel, inspectorContext);
  const timelineRender = timelinePanel.render(timelinePanel, inspectorContext);
  assert.equal(stateDiffRender.lines.some((line) => line.includes("added:mode")), true);
  assert.equal(timelineRender.lines.some((line) => line.includes("category=replay")), true);

  const networkPanels = createNetworkObservabilityPanels();
  const latencyRender = networkPanels[0].render(networkPanels[0], {
    assets: {
      network: {
        latency: {
          status: "degraded",
          rttMs: 85,
          jitterMs: 11
        },
        replication: {
          hostTick: 300,
          highestBacklog: 5
        }
      }
    }
  });
  assert.equal(latencyRender.lines.some((line) => line.includes("rttMs=85")), true);
}
