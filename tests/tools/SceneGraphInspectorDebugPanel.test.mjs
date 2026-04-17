/*
Toolbox Aid
David Quesenberry
04/16/2026
SceneGraphInspectorDebugPanel.test.mjs
*/
import assert from "node:assert/strict";
import {
  createStandard3dPanels,
  PANEL_3D_SCENE_GRAPH_INSPECTOR,
  create3dSceneGraphInspectorPanel,
  createStandard3dProviders,
  PROVIDER_3D_SCENE_GRAPH_INSPECTOR,
  createSceneGraphInspectorProvider
} from "../../src/engine/debug/standard/threeD/index.js";

export async function run() {
  const provider = createSceneGraphInspectorProvider({
    sceneGraphInspector: () => ({
      nodes: [
        { nodeId: "player", parentId: "worldRoot", depth: 1, childCount: 2, active: true, order: 2 },
        { nodeId: "worldRoot", depth: 0, childCount: 3, active: true, order: 0 },
        { nodeId: "uiRoot", depth: 0, childCount: 1, active: true, order: 1 },
        { nodeId: "pauseMenu", parentId: "uiRoot", depth: 1, childCount: 0, active: false, order: 3 }
      ]
    })
  });

  const snapshot = provider.getSnapshot({});
  assert.equal(snapshot.nodeCount, 4);
  assert.equal(snapshot.rootCount, 2);
  assert.equal(snapshot.maxDepth, 1);
  assert.deepEqual(
    snapshot.nodeRows.map((row) => row.nodeId),
    ["worldRoot", "uiRoot", "player", "pauseMenu"]
  );

  const panel = create3dSceneGraphInspectorPanel(provider, { enabled: true });
  const render = panel.render({}, {});
  assert.equal(render.id, PANEL_3D_SCENE_GRAPH_INSPECTOR);
  assert.equal(render.title, "3D Scene Graph Inspector");
  assert.deepEqual(render.lines, [
    "nodeCount=4",
    "rootCount=2",
    "maxDepth=1",
    "node.1=worldRoot|parent=none|children=3|active=true",
    "node.2=uiRoot|parent=none|children=1|active=true",
    "node.3=. player|parent=worldRoot|children=2|active=true",
    "node.4=. pauseMenu|parent=uiRoot|children=0|active=false"
  ]);

  const fallbackProvider = createSceneGraphInspectorProvider({
    sceneGraphInspector: () => ({})
  });
  const fallbackPanel = create3dSceneGraphInspectorPanel(fallbackProvider, { enabled: true });
  const fallbackRender = fallbackPanel.render({}, {});
  assert.deepEqual(fallbackRender.lines, [
    "nodeCount=0",
    "rootCount=0",
    "maxDepth=0",
    "nodes=none"
  ]);

  const { providerMap } = createStandard3dProviders();
  assert.equal(providerMap.has(PROVIDER_3D_SCENE_GRAPH_INSPECTOR), true);
  const registeredPanels = createStandard3dPanels({ providerMap, enabled: false });
  const panelIds = registeredPanels.map((entry) => entry.id);
  assert.equal(panelIds.includes(PANEL_3D_SCENE_GRAPH_INSPECTOR), true);
}
