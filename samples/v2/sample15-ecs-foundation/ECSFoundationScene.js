import Scene from '../../../engine/v2/scenes/Scene.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { drawSceneFrame } from '../../../engine/v2/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class ECSFoundationScene extends Scene {
  constructor() {
    super();

    this.world = new World();

    const player = this.world.createEntity();
    this.world.addComponent(player, 'transform', { x: 220, y: 240 });
    this.world.addComponent(player, 'size', { width: 56, height: 56 });
    this.world.addComponent(player, 'renderable', { color: theme.getColor('actorFill'), label: 'player' });

    const wall = this.world.createEntity();
    this.world.addComponent(wall, 'transform', { x: 520, y: 220 });
    this.world.addComponent(wall, 'size', { width: 160, height: 96 });
    this.world.addComponent(wall, 'renderable', { color: '#8888ff', label: 'wall' });
  }

  update() {}

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample15',
      'Demonstrates ECS world creation with entity ids and component maps',
      'This sample renders entities by querying transform, size, and renderable components',
      'The scene is static on purpose so the ECS structure stays easy to inspect',
      'This becomes the base for later movement, input, collision, and render systems',
    ]);

    const entities = this.world.getEntitiesWith('transform', 'size', 'renderable');

    entities.forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const renderable = this.world.getComponent(entityId, 'renderable');

      renderer.drawRect(transform.x, transform.y, size.width, size.height, renderable.color);
      renderer.strokeRect(transform.x, transform.y, size.width, size.height, '#ffffff', 1);
      renderer.drawText(renderable.label, transform.x + 8, transform.y + 26, {
        color: '#ffffff',
        font: '14px monospace',
      });
    });
  }
}
