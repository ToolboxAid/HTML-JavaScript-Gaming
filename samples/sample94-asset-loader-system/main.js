/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { AssetLoaderSystem, AssetRegistry, ImageAssetLoader } from '../../engine/assets/index.js';
import AssetLoaderSystemScene from './AssetLoaderSystemScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const registry = new AssetRegistry();
registry.registerMany([
  { id: 'heroSprite', type: 'image', source: () => ({ width: 32, height: 32 }) },
  { id: 'enemySprite', type: 'image', source: () => ({ width: 48, height: 48 }) },
  { id: 'levelData', type: 'data', source: { rooms: 4, checkpoints: 2 } },
]);

const loaderSystem = new AssetLoaderSystem({
  registry,
  imageLoader: new ImageAssetLoader(),
});

await loaderSystem.loadAll();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540, fixedStepMs: 1000 / 60 });
engine.setScene(new AssetLoaderSystemScene(loaderSystem));
engine.start();
