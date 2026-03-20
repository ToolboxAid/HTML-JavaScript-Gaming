import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { DebugPanel } from '../../../engine/v2/debug/index.js';
import { RenderSystem } from '../../../engine/v2/systems/index.js';

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
    DebugPanel.drawFrame(renderer, theme, [
      'Engine V2 Sample15',
      'Demonstrates ECS world creation with entity ids and component maps',
      'This sample renders entities by querying transform, size, and renderable components',
      'The scene is static on purpose so the ECS structure stays easy to inspect',
      'This becomes the base for later movement, input, collision, and render systems',
    ]);

    RenderSystem.drawRenderableEntities(renderer, this.world, { labelMode: 'inside', textOffsetY: 26 });
  }
}
