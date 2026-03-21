/*
Toolbox Aid
David Quesenberry
03/21/2026
LevelLoaderScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { clamp } from '../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { isColliding } from '../../engine/collision/index.js';
import { LevelLoader } from '../../engine/level/index.js';
import { levelData } from './levelData.js';

const theme = new Theme(ThemeTokens);

export default class LevelLoaderScene extends Scene {
  constructor() {
    super();

    const loader = new LevelLoader();
    const loadedLevel = loader.loadSceneData(levelData);

    this.worldBounds = loadedLevel.worldBounds;
    this.player = { ...loadedLevel.player };
    this.solids = loadedLevel.solids.map((solid) => ({ ...solid }));
    this.markers = loadedLevel.markers.map((marker) => ({ ...marker }));
    this.hitSolid = false;
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    const previousX = this.player.x;
    const previousY = this.player.y;

    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, this.worldBounds.x, this.worldBounds.x + this.worldBounds.width - this.player.width);
    this.player.y = clamp(this.player.y, this.worldBounds.y, this.worldBounds.y + this.worldBounds.height - this.player.height);

    this.hitSolid = false;
    for (const solid of this.solids) {
      if (isColliding(this.player, solid)) {
        this.player.x = previousX;
        this.player.y = previousY;
        this.hitSolid = true;
        break;
      }
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample30',
      'Demonstrates loading level content from structured level data',
      'Use Arrow keys to move through geometry defined outside the scene class',
      `Collision state: ${this.hitSolid ? 'blocked' : 'clear'}`,
      'This sample strengthens the separation between engine behavior and game content',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    this.solids.forEach((solid) => {
      renderer.drawRect(solid.x, solid.y, solid.width, solid.height, '#8888ff');
      renderer.strokeRect(solid.x, solid.y, solid.width, solid.height, '#ffffff', 1);
    });

    this.markers.forEach((marker) => {
      renderer.drawRect(marker.x, marker.y, marker.width, marker.height, '#ffd166');
      renderer.strokeRect(marker.x, marker.y, marker.width, marker.height, '#ffffff', 1);
      renderer.drawText(marker.label, marker.x - 8, marker.y - 8, {
        color: '#ffffff',
        font: '14px monospace',
      });
    });

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    drawPanel(renderer, 620, 180, 280, 132, 'Level Data', [
      `Solids: ${this.solids.length}`,
      `Markers: ${this.markers.length}`,
      'Source: levelData.js',
      'Pattern: external scene content',
    ]);
  }
}
