/*
Toolbox Aid
David Quesenberry
03/21/2026
WorldSerializationScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { clamp } from '../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { serializeWorldState, deserializeWorldState } from '../../engine/persistence/index.js';

const theme = new Theme(ThemeTokens);

export default class WorldSerializationScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.player = { x: 180, y: 290, width: 46, height: 46, speed: 260 };
    this.pickups = [
      { x: 420, y: 260, width: 24, height: 24, active: true },
      { x: 620, y: 320, width: 24, height: 24, active: true },
    ];
    this.lastSave = 'none';
    this.lastLoad = 'none';
    this.savedText = '';
    this.lastK = false

    this.lastL = false;
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, this.bounds.x, this.bounds.x + this.bounds.width - this.player.width);
    this.player.y = clamp(this.player.y, this.bounds.y, this.bounds.y + this.bounds.height - this.player.height);

    const savePressed = engine.input.isDown('KeyK');
    const loadPressed = engine.input.isDown('KeyL');

    if (savePressed && !this.lastK) {
      this.savedText = serializeWorldState({
        player: this.player,
        pickups: this.pickups,
      });
      this.lastSave = 'saved snapshot';
    }

    if (loadPressed && !this.lastL && this.savedText) {
      const snapshot = deserializeWorldState(this.savedText);
      this.player = snapshot.player;
      this.pickups = snapshot.pickups;
      this.lastLoad = 'loaded snapshot';
    }

    this.lastK = savePressed;
    this.lastL = loadPressed;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample47',
      'Demonstrates serialization and deserialization of a world snapshot',
      'Use Arrow keys to move, KeyK to save, KeyL to load',
      `Saved: ${this.lastSave} | Loaded: ${this.lastLoad}`,
      'This sample defines the engine boundary for JSON world snapshots',
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    this.pickups.forEach((pickup) => {
      renderer.drawRect(pickup.x, pickup.y, pickup.width, pickup.height, '#ffd166');
      renderer.strokeRect(pickup.x, pickup.y, pickup.width, pickup.height, '#ffffff', 1);
    });

    drawPanel(renderer, 620, 184, 300, 126, 'World Snapshot', [
      'Save: KeyK',
      'Load: KeyL',
      `Text length: ${this.savedText.length}`,
      'JSON snapshot of world state',
    ]);
  }
}
