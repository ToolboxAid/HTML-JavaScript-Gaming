import assert from "node:assert/strict";
import { buildPluginArchitecture, summarizePluginArchitecture } from "../../tools/shared/pluginArchitecture.js";

export async function run() {
  const hostPackageManifest = {
    package: {
      version: 1,
      projectId: "demo-project",
      roots: [{ id: "sprite.hero", type: "sprite" }],
      assets: [
        { id: "palette.hero", type: "palette", path: "assets/palettes/hero.json" },
        { id: "sprite.hero", type: "sprite", path: "assets/sprites/hero.json" }
      ],
      dependencies: [
        { from: "sprite.hero", to: "palette.hero", type: "usesPalette" }
      ]
    }
  };

  const pluginPlan = buildPluginArchitecture({
    hostPackageManifest,
    pluginManifests: [
      {
        plugin: {
          id: "weatherpack",
          version: 1,
          roots: [{ id: "weatherpack.layer", type: "parallaxLayer" }],
          assets: [
            { id: "weatherpack.layer", type: "parallaxLayer", path: "plugins/weatherpack/layer.json" }
          ],
          dependencies: [
            { from: "weatherpack.layer", to: "sprite.hero", type: "extendsRuntime" }
          ]
        }
      }
    ]
  });

  assert.equal(pluginPlan.plugins.status, "ready");
  assert.equal(pluginPlan.plugins.acceptedPlugins.length, 1);
  assert.equal(summarizePluginArchitecture(pluginPlan), "Plugin architecture ready with 1 accepted plugins.");
  assert.equal(pluginPlan.plugins.mergedPackageManifest.package.assets.at(-1).id, "weatherpack.layer");

  const conflictPlan = buildPluginArchitecture({
    hostPackageManifest,
    pluginManifests: [
      {
        plugin: {
          id: "badpack",
          version: 1,
          assets: [
            { id: "sprite.hero", type: "sprite", path: "plugins/badpack/sprite.json" }
          ],
          dependencies: []
        }
      }
    ]
  });
  assert.equal(conflictPlan.plugins.status, "failed");
  assert.equal(conflictPlan.plugins.reports[0].code, "PLUGIN_PLAN_FAILED");
}
