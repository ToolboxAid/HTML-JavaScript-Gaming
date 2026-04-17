/*
Toolbox Aid
David Quesenberry
04/16/2026
CollisionOverlaysDebugPanel.test.mjs
*/
import assert from "node:assert/strict";
import {
  createStandard3dPanels,
  PANEL_3D_COLLISION_OVERLAYS,
  create3dCollisionOverlaysPanel,
  createStandard3dProviders,
  PROVIDER_3D_COLLISION_OVERLAYS,
  createCollisionOverlaysProvider
} from "../../src/engine/debug/standard/threeD/index.js";

export async function run() {
  const provider = createCollisionOverlaysProvider({
    collisionOverlays: () => ({
      overlays: [
        { overlayId: "contact-pairs", kind: "contacts", state: "active", enabled: true, order: 2 },
        { overlayId: "aabb", kind: "bounds", state: "active", enabled: true, order: 1 },
        "triggers",
        { overlayId: "sleeping", kind: "bounds", state: "inactive", enabled: false, order: 4 }
      ]
    })
  });

  const snapshot = provider.getSnapshot({});
  assert.equal(snapshot.overlayCount, 4);
  assert.equal(snapshot.activeCount, 3);
  assert.deepEqual(
    snapshot.overlayRows.map((row) => row.overlayId),
    ["aabb", "contact-pairs", "triggers", "sleeping"]
  );
  assert.deepEqual(
    snapshot.overlayRows.map((row) => row.state),
    ["active", "active", "active", "inactive"]
  );

  const panel = create3dCollisionOverlaysPanel(provider, { enabled: true });
  const render = panel.render({}, {});
  assert.equal(render.id, PANEL_3D_COLLISION_OVERLAYS);
  assert.equal(render.title, "3D Collision Overlays");
  assert.deepEqual(render.lines, [
    "overlayCount=4",
    "activeCount=3",
    "overlay.1=aabb|bounds|active|enabled=true",
    "overlay.2=contact-pairs|contacts|active|enabled=true",
    "overlay.3=triggers|bounds|active|enabled=true",
    "overlay.4=sleeping|bounds|inactive|enabled=false"
  ]);

  const fallbackProvider = createCollisionOverlaysProvider({
    collisionOverlays: () => ({})
  });
  const fallbackPanel = create3dCollisionOverlaysPanel(fallbackProvider, { enabled: true });
  const fallbackRender = fallbackPanel.render({}, {});
  assert.deepEqual(fallbackRender.lines, [
    "overlayCount=0",
    "activeCount=0",
    "overlays=none"
  ]);

  const { providerMap } = createStandard3dProviders();
  assert.equal(providerMap.has(PROVIDER_3D_COLLISION_OVERLAYS), true);
  const registeredPanels = createStandard3dPanels({ providerMap, enabled: false });
  const panelIds = registeredPanels.map((entry) => entry.id);
  assert.equal(panelIds.includes(PANEL_3D_COLLISION_OVERLAYS), true);
}
