/*
Toolbox Aid
David Quesenberry
03/21/2026
SaveLoadStateScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { clamp } from '../../../src/engine/utils/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { StorageService } from '../../../src/engine/persistence/index.js';

const theme = new Theme(ThemeTokens);
const STORAGE_KEY = 'engine-v2-Sample 0205-state';

export default class SaveLoadStateScene extends Scene {
  constructor() {
    super();

    this.storage = new StorageService();
    this.worldBounds = { x: 60, y: 170, width: 840, height: 300 };
    this.player = { x: 180, y: 260, width: 46, height: 46, speed: 250 };
    this.lastSaveState = 'none';
    this.lastLoadState = 'none';
    this.lastSavePressed = false;
    this.lastLoadPressed = false;
  }

  update(dt, engine) {
    const move = this.player.speed * dt;

    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, this.worldBounds.x, this.worldBounds.x + this.worldBounds.width - this.player.width);
    this.player.y = clamp(this.player.y, this.worldBounds.y, this.worldBounds.y + this.worldBounds.height - this.player.height);

    const savePressed = engine.input.isDown('KeyK');
    const loadPressed = engine.input.isDown('KeyL');

    if (savePressed && !this.lastSavePressed) {
      this.saveState();
    }

    if (loadPressed && !this.lastLoadPressed) {
      this.loadState();
    }

    this.lastSavePressed = savePressed;
    this.lastLoadPressed = loadPressed;
  }

  saveState() {
    const state = {
      x: this.player.x,
      y: this.player.y,
    };

    this.storage.saveJson(STORAGE_KEY, state);
    this.lastSaveState = `saved (${state.x.toFixed(0)}, ${state.y.toFixed(0)})`;
  }

  loadState() {
    const state = this.storage.loadJson(STORAGE_KEY, null);

    if (!state) {
      this.lastLoadState = 'no saved state';
      return;
    }

    this.player.x = state.x;
    this.player.y = state.y;
    this.lastLoadState = `loaded (${state.x.toFixed(0)}, ${state.y.toFixed(0)})`;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 0205',
      'Demonstrates basic save and load state using browser localStorage',
      'Use Arrow keys to move, KeyK to save, and KeyL to load',
      'The scene persists player position so state can survive scene resets or refreshes',
      'This is the first persistence-oriented sample in the series',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    drawPanel(renderer, 610, 180, 290, 132, 'Persistence Status', [
      `Last save: ${this.lastSaveState}`,
      `Last load: ${this.lastLoadState}`,
      'Save key: KeyK',
      'Load key: KeyL',
    ]);
  }
}
