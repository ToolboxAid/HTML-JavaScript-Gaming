/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';
import AssetLoaderSystem from '/src/engine/assets/AssetLoaderSystem.js';
import AssetOptimizer from '/src/engine/assets/AssetOptimizer.js';
import AssetRegistry from '/src/engine/assets/AssetRegistry.js';
import ImageAssetLoader from '/src/engine/assets/ImageAssetLoader.js';
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
