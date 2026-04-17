/*
Toolbox Aid
David Quesenberry
04/16/2026
TransformInspectorDebugPanel.test.mjs
*/
import assert from "node:assert/strict";
import {
  createStandard3dPanels,
  PANEL_3D_TRANSFORM_INSPECTOR,
  create3dTransformInspectorPanel,
  createStandard3dProviders,
  PROVIDER_3D_TRANSFORM_INSPECTOR,
  createTransformInspectorProvider
} from "../../src/engine/debug/standard/threeD/index.js";

export async function run() {
  const provider = createTransformInspectorProvider({
    transformInspector: () => ({
      selectedIds: ["hero", "cameraRig"],
      nodes: [
        {
          nodeId: "cameraRig",
          order: 1,
          position: { x: 4, y: 8.125, z: -2 },
          rotation: { x: 0.25, y: 1.5, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dirty: false,
          frozen: true
        },
        {
          nodeId: "hero",
          order: 0,
          position: { x: 1.25, y: 2, z: 3.5 },
          rotation: { x: 0, y: 0.5, z: 0 },
          scale: { x: 1, y: 1.2, z: 1 },
          dirty: true,
          frozen: false
        }
      ],
      activeNodeId: "hero"
    })
  });

  const snapshot = provider.getSnapshot({});
  assert.equal(snapshot.nodeCount, 2);
  assert.equal(snapshot.selectedCount, 2);
  assert.equal(snapshot.dirtyCount, 1);
  assert.equal(snapshot.frozenCount, 1);
  assert.equal(snapshot.activeNodeId, "hero");
  assert.deepEqual(
    snapshot.nodeRows.map((row) => row.nodeId),
    ["hero", "cameraRig"]
  );

  const panel = create3dTransformInspectorPanel(provider, { enabled: true });
  const render = panel.render({}, {});
  assert.equal(render.id, PANEL_3D_TRANSFORM_INSPECTOR);
  assert.equal(render.title, "3D Transform Inspector");
  assert.deepEqual(render.lines, [
    "nodeCount=2",
    "selectedCount=2",
    "dirtyCount=1",
    "frozenCount=1",
    "activeNodeId=hero",
    "selectedIds=hero,cameraRig",
    "node.1=hero|pos=1.25,2.00,3.50|rot=0.00,0.50,0.00|scale=1.00,1.20,1.00|dirty=true|frozen=false",
    "node.2=cameraRig|pos=4.00,8.13,-2.00|rot=0.25,1.50,0.00|scale=1.00,1.00,1.00|dirty=false|frozen=true"
  ]);

  const fallbackProvider = createTransformInspectorProvider({
    transformInspector: () => ({})
  });
  const fallbackPanel = create3dTransformInspectorPanel(fallbackProvider, { enabled: true });
  const fallbackRender = fallbackPanel.render({}, {});
  assert.deepEqual(fallbackRender.lines, [
    "nodeCount=0",
    "selectedCount=0",
    "dirtyCount=0",
    "frozenCount=0",
    "activeNodeId=none",
    "selectedIds=none",
    "nodes=none"
  ]);

  const { providerMap } = createStandard3dProviders();
  assert.equal(providerMap.has(PROVIDER_3D_TRANSFORM_INSPECTOR), true);
  const registeredPanels = createStandard3dPanels({ providerMap, enabled: false });
  const panelIds = registeredPanels.map((entry) => entry.id);
  assert.equal(panelIds.includes(PANEL_3D_TRANSFORM_INSPECTOR), true);
}
