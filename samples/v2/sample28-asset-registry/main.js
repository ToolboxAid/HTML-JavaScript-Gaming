import Engine from '../../../engine/v2/core/Engine.js';
import { InputService } from '../../../engine/v2/input/index.js';
import AssetRegistryScene from './AssetRegistryScene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const input = new InputService();
const canvas = document.getElementById('game');

const engine = new Engine({
  canvas,
  width: 960,
  height: 540,
  fixedStepMs: 1000 / 60,
  input,
});

engine.setScene(new AssetRegistryScene());
engine.start();
