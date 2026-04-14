/*
Toolbox Aid
David Quesenberry
03/21/2026
PrefabSystemScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import {
  createPlayerPrefab,
  createEnemyPrefab,
  createPickupPrefab,
  createProjectilePrefab,
} from '/src/engine/prefabs/index.js';
import { renderSpriteReadyEntities } from '/src/engine/rendering/index.js';

const theme = new Theme(ThemeTokens);

export default class PrefabSystemScene extends Scene {
  constructor() {
    super();
    this.entities = [
      createPlayerPrefab({ x: 120, y: 280, label: 'player' }),
      createEnemyPrefab({ x: 320, y: 275, minX: 300, maxX: 520, label: 'enemy' }),
      createPickupPrefab({ x: 560, y: 300, label: 'pickup' }),
      createProjectilePrefab({ x: 700, y: 316, label: 'projectile', velocityX: 0 }),
    ];
  }

  update() {}

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 0216',
      'Demonstrates prefab-based creation for repeated gameplay objects',
      'Players, enemies, pickups, and projectiles come from shared factory functions',
      'This reduces scene duplication and prepares the engine for content scaling',
      'Labels identify which prefab produced each entity',
    ]);

    renderSpriteReadyEntities(renderer, this.entities, { label: true, labelOffsetY: 78 });

    drawPanel(renderer, 620, 184, 300, 126, 'Prefabs', [
      'Player prefab',
      'Enemy prefab',
      'Pickup prefab',
      'Projectile prefab',
    ]);
  }
}
