import assert from "node:assert/strict";
import { buildRuntimeStreamingManifest, loadRuntimeStreamingChunks, summarizeRuntimeStreaming } from "../../tools/shared/runtimeStreaming.js";

export async function run() {
  const packageManifest = {
    package: {
      version: 1,
      projectId: "demo-project",
      roots: [{ id: "tilemap.overworld", type: "tilemap" }],
      assets: [
        { id: "palette.hero", type: "palette", path: "assets/palettes/hero.json" },
        { id: "tileset.overworld", type: "tileset", path: "assets/tilesets/overworld.json" },
        { id: "tilemap.overworld", type: "tilemap", path: "assets/tilemaps/overworld.json" },
        { id: "image.sky", type: "image", path: "assets/images/sky.png" }
      ],
      dependencies: [
        { from: "tilemap.overworld", to: "tileset.overworld", type: "usesTileset" },
        { from: "tileset.overworld", to: "palette.hero", type: "usesPalette" }
      ]
    }
  };

  const plan = buildRuntimeStreamingManifest({ packageManifest, chunkSize: 1 });
  assert.equal(plan.streaming.status, "ready");
  assert.deepEqual(plan.streaming.chunks[0].assetIds, ["palette.hero", "tileset.overworld", "tilemap.overworld"]);
  assert.equal(summarizeRuntimeStreaming(plan), "Runtime streaming ready with 2 chunks.");

  const loadOrder = [];
  const loadResult = await loadRuntimeStreamingChunks({
    streamingManifest: plan.streaming.packageManifest,
    chunkIds: ["boot", "chunk-001"],
    imageLoader: {
      load: async (id) => {
        loadOrder.push(id);
        return { id, loaded: true };
      }
    },
    loaders: {
      data: async (id) => {
        loadOrder.push(id);
        return { id, loaded: true };
      }
    }
  });
  assert.equal(loadResult.streaming.status, "ready");
  assert.deepEqual(loadOrder, ["palette.hero", "tileset.overworld", "tilemap.overworld", "image.sky"]);

  const badResult = await loadRuntimeStreamingChunks({
    streamingManifest: plan.streaming.packageManifest,
    chunkIds: ["missing-chunk"]
  });
  assert.equal(badResult.streaming.status, "failed");
  assert.equal(badResult.streaming.reports[0].code, "UNKNOWN_STREAM_CHUNK");
}
