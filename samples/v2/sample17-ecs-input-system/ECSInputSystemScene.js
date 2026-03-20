import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { DebugPanel } from '../../../engine/v2/debug/index.js';
import { InputControlSystem, RenderSystem } from '../../../engine/v2/systems/index.js';

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
    InputControlSystem.applyDirectMovement({
      world: this.world,
      input: engine.input,
      dt,
      worldBounds: this.worldBounds,
    });
  }

  render(renderer) {
    DebugPanel.drawFrame(renderer, theme, [
      'Engine V2 Sample17',
      'Demonstrates an ECS input system with inputControlled and speed components',
      'Use Arrow keys to move the player entity through the play area',
      'The scene queries component sets instead of hard-coding player fields',
      'This is the bridge from ECS structure into interactive control',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    RenderSystem.drawRenderableEntities(renderer, this.world);
  }
}
