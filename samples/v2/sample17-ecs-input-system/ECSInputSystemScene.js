import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World, drawSceneFrame } from './ecs.js';

const theme = new Theme(ThemeTokens);

export default class ECSInputSystemScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };

    const player = this.world.createEntity();
    this.world.addComponent(player, 'transform', { x: 220, y: 250 });
    this.world.addComponent(player, 'size', { width: 48, height: 48 });
    this.world.addComponent(player, 'speed', { value: 250 });
    this.world.addComponent(player, 'inputControlled', { enabled: true });
    this.world.addComponent(player, 'renderable', { color: theme.getColor('actorFill') });

    const marker = this.world.createEntity();
    this.world.addComponent(marker, 'transform', { x: 620, y: 250 });
    this.world.addComponent(marker, 'size', { width: 60, height: 60 });
    this.world.addComponent(marker, 'renderable', { color: '#8888ff' });
  }

  update(dt, engine) {
    const controlledEntities = this.world.getEntitiesWith('transform', 'size', 'speed', 'inputControlled');

    controlledEntities.forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const speed = this.world.getComponent(entityId, 'speed').value;

      if (engine.input.isDown('ArrowLeft')) transform.x -= speed * dt;
      if (engine.input.isDown('ArrowRight')) transform.x += speed * dt;
      if (engine.input.isDown('ArrowUp')) transform.y -= speed * dt;
      if (engine.input.isDown('ArrowDown')) transform.y += speed * dt;

      const minX = this.worldBounds.x;
      const minY = this.worldBounds.y;
      const maxX = this.worldBounds.x + this.worldBounds.width - size.width;
      const maxY = this.worldBounds.y + this.worldBounds.height - size.height;

      transform.x = Math.max(minX, Math.min(transform.x, maxX));
      transform.y = Math.max(minY, Math.min(transform.y, maxY));
    });
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample17',
      'Demonstrates an ECS input system with inputControlled and speed components',
      'Use Arrow keys to move the player entity through the play area',
      'The scene queries component sets instead of hard-coding player fields',
      'This is the bridge from ECS structure into interactive control',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    this.world.getEntitiesWith('transform', 'size', 'renderable').forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const renderable = this.world.getComponent(entityId, 'renderable');

      renderer.drawRect(transform.x, transform.y, size.width, size.height, renderable.color);
      renderer.strokeRect(transform.x, transform.y, size.width, size.height, '#ffffff', 1);
    });
  }
}
