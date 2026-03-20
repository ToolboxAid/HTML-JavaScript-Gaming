import Scene from '../../../engine/v2/scenes/Scene.js';
import { isColliding } from '../../../engine/v2/collision/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { drawPanel, drawSceneFrame } from '../../../engine/v2/debug/index.js';
import { LevelLoader } from '../../../engine/v2/level/index.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { clamp } from '../../../engine/v2/utils/math.js';
import { worldData } from './worldData.js';

const theme = new Theme(ThemeTokens);

export default class DataDrivenWorldScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = worldData.worldBounds;
    this.hitSolid = false;
    this.loadFromData();
  }

  loadFromData() {
    LevelLoader.applyEntityDefinitions(this.world, worldData.entities, {
      mapRenderableColor: (color) => (color === 'actorFill' ? theme.getColor('actorFill') : color),
    });
  }

  update(dt, engine) {
    const playerId = this.world.getEntitiesWith('inputControlled', 'transform', 'size', 'speed')[0];
    const transform = this.world.getComponent(playerId, 'transform');
    const size = this.world.getComponent(playerId, 'size');
    const speed = this.world.getComponent(playerId, 'speed').value;

    const previousX = transform.x;
    const previousY = transform.y;

    if (engine.input.isDown('ArrowLeft')) transform.x -= speed * dt;
    if (engine.input.isDown('ArrowRight')) transform.x += speed * dt;
    if (engine.input.isDown('ArrowUp')) transform.y -= speed * dt;
    if (engine.input.isDown('ArrowDown')) transform.y += speed * dt;

    const minX = this.worldBounds.x;
    const minY = this.worldBounds.y;
    const maxX = this.worldBounds.x + this.worldBounds.width - size.width;
    const maxY = this.worldBounds.y + this.worldBounds.height - size.height;

    transform.x = clamp(transform.x, minX, maxX);
    transform.y = clamp(transform.y, minY, maxY);

    this.hitSolid = false;

    for (const solidId of this.world.getEntitiesWith('solid', 'transform', 'size')) {
      const solidTransform = this.world.getComponent(solidId, 'transform');
      const solidSize = this.world.getComponent(solidId, 'size');

      if (isColliding(
        { x: transform.x, y: transform.y, width: size.width, height: size.height },
        { x: solidTransform.x, y: solidTransform.y, width: solidSize.width, height: solidSize.height }
      )) {
        transform.x = previousX;
        transform.y = previousY;
        this.hitSolid = true;
        break;
      }
    }
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample24',
      'Demonstrates a data-driven world loaded from config definitions',
      'Use Arrow keys to move the player entity through configured geometry',
      `Collision state: ${this.hitSolid ? 'blocked' : 'clear'}`,
      'This sample replaces constructor hard-coding with declarative setup data',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    this.world.getEntitiesWith('transform', 'size', 'renderable').forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const renderable = this.world.getComponent(entityId, 'renderable');

      renderer.drawRect(transform.x, transform.y, size.width, size.height, renderable.color);
      renderer.strokeRect(transform.x, transform.y, size.width, size.height, '#ffffff', 1);
      renderer.drawText(renderable.label, transform.x + 4, transform.y - 8, {
        color: '#ffffff',
        font: '14px monospace',
      });
    });

    drawPanel(renderer, 635, 28, 285, 126, 'World Data', [
      `Configured entities: ${worldData.entities.length}`,
      `Live entities: ${this.world.countEntities()}`,
      'Source: worldData.js',
      'Pattern: declarative setup',
    ]);
  }
}
