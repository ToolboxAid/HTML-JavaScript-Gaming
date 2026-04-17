/*
Toolbox Aid
David Quesenberry
04/16/2026
RenderPipelineStagesDebugPanel.test.mjs
*/
import assert from "node:assert/strict";
import {
  createStandard3dPanels,
  PANEL_3D_RENDER_PIPELINE_STAGES,
  create3dRenderPipelineStagesPanel,
  createStandard3dProviders,
  PROVIDER_3D_RENDER_PIPELINE_STAGES,
  createRenderPipelineStagesProvider
} from "../../src/engine/debug/standard/threeD/index.js";

export async function run() {
  const provider = createRenderPipelineStagesProvider({
    renderPipelineStages: () => ({
      stages: [
        { stageId: "lighting", order: 3, status: "enabled", enabled: true },
        { stageId: "geometry", order: 1, status: "enabled", enabled: true },
        { stageId: "postfx", order: 5, status: "disabled", enabled: false },
        "ui"
      ]
    })
  });

  const snapshot = provider.getSnapshot({});
  assert.equal(snapshot.stageCount, 4);
  assert.equal(snapshot.activeCount, 3);
  assert.deepEqual(
    snapshot.stageRows.map((row) => row.stageId),
    ["geometry", "lighting", "ui", "postfx"]
  );
  assert.deepEqual(
    snapshot.stageRows.map((row) => row.status),
    ["enabled", "enabled", "enabled", "disabled"]
  );

  const panel = create3dRenderPipelineStagesPanel(provider, { enabled: true });
  const render = panel.render({}, {});
  assert.equal(render.id, PANEL_3D_RENDER_PIPELINE_STAGES);
  assert.equal(render.title, "3D Render Pipeline Stages");
  assert.deepEqual(render.lines, [
    "stageCount=4",
    "activeCount=3",
    "stage.1=geometry|enabled|enabled=true",
    "stage.2=lighting|enabled|enabled=true",
    "stage.3=ui|enabled|enabled=true",
    "stage.4=postfx|disabled|enabled=false"
  ]);

  const fallbackProvider = createRenderPipelineStagesProvider({
    renderPipelineStages: () => ({})
  });
  const fallbackPanel = create3dRenderPipelineStagesPanel(fallbackProvider, { enabled: true });
  const fallbackRender = fallbackPanel.render({}, {});
  assert.deepEqual(fallbackRender.lines, [
    "stageCount=0",
    "activeCount=0",
    "stages=none"
  ]);

  const { providerMap } = createStandard3dProviders();
  assert.equal(providerMap.has(PROVIDER_3D_RENDER_PIPELINE_STAGES), true);
  const registeredPanels = createStandard3dPanels({ providerMap, enabled: false });
  const panelIds = registeredPanels.map((entry) => entry.id);
  assert.equal(panelIds.includes(PANEL_3D_RENDER_PIPELINE_STAGES), true);
}
