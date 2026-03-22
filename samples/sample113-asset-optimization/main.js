/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { AssetLoaderSystem, AssetOptimizer, AssetRegistry, ImageAssetLoader } from '../../engine/assets/index.js';
import AssetOptimizationScene from './AssetOptimizationScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const optimizer = new AssetOptimizer();
const registry = new AssetRegistry();
registry.registerMany([
  { id: 'heroA', type: 'image', path: 'shared.png', source: () => ({ width: 32, height: 32 }) },
  { id: 'heroB', type: 'image', path: 'shared.png', source: () => ({ width: 32, height: 32 }) },
]);
const loaderSystem = new AssetLoaderSystem({
  registry,
  imageLoader: new ImageAssetLoader(),
  optimizer,
});
await loaderSystem.loadAll();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540, fixedStepMs: 1000 / 60 });
engine.setScene(new AssetOptimizationScene(loaderSystem, optimizer));
engine.start();
