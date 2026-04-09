/*
Toolbox Aid
David Quesenberry
03/22/2026
AssetLoaderSystem.test.mjs
*/
import assert from 'node:assert/strict';
import AssetRegistry from '/src/engine/assets/AssetRegistry.js';
import ImageAssetLoader from '/src/engine/assets/ImageAssetLoader.js';
import AssetLoaderSystem from '/src/engine/assets/AssetLoaderSystem.js';

export async function run() {
  const registry = new AssetRegistry();
  registry.registerMany([
    { id: 'hero', type: 'image', source: () => ({ width: 32, height: 32 }) },
    { id: 'settings', type: 'data', source: { volume: 0.8 } },
  ]);

  const loader = new AssetLoaderSystem({
    registry,
    imageLoader: new ImageAssetLoader(),
  });

  const results = await loader.loadAll();
  assert.equal(results.length, 2);
  assert.equal(loader.status, 'ready');
  assert.equal(loader.get('hero').asset.width, 32);
  assert.equal(loader.get('settings').asset.volume, 0.8);
}
