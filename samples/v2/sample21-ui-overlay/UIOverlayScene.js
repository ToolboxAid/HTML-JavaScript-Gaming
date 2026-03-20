import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { DebugPanel } from '../../../engine/v2/debug/index.js';
import { InputControlSystem, RenderSystem } from '../../../engine/v2/systems/index.js';

const theme = new Theme(ThemeTokens);

export default class UIOverlayScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };
    this.score = 1250;
    this.health = 84;
    this.objective = 'Reach the beacon';
    this.debugEnabled = true;

    const player = this.world.createEntity();
    this.world.addComponent(player, 'transform', { x: 170, y: 250 });
    this.world.addComponent(player, 'size', { width: 48, height: 48 });
    this.world.addComponent(player, 'speed', { value: 240 });
    this.world.addComponent(player, 'inputControlled', { enabled: true });
    this.world.addComponent(player, 'renderable', { color: theme.getColor('actorFill'), label: 'player' });

    const beacon = this.world.createEntity();
    this.world.addComponent(beacon, 'transform', { x: 720, y: 260 });
    this.world.addComponent(beacon, 'size', { width: 42, height: 42 });
    this.world.addComponent(beacon, 'renderable', { color: '#ffd166', label: 'beacon' });
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
      'Engine V2 Sample21',
      'Demonstrates a world layer plus a separate UI overlay layer',
      'Use Arrow keys to move the player entity across the world space',
      'The HUD and debug panel stay screen-fixed instead of world-positioned',
      'This sample starts the engine maturity phase with readable overlays',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    RenderSystem.drawRenderableEntities(renderer, this.world);

    DebugPanel.drawPanel(renderer, 650, 26, 270, 108, 'HUD', [
      `Score: ${this.score}`,
      `Health: ${this.health}%`,
      `Objective: ${this.objective}`,
    ]);

    if (this.debugEnabled) {
      const playerId = this.world.getEntitiesWith('inputControlled')[0];
      const transform = this.world.getComponent(playerId, 'transform');
      DebugPanel.drawPanel(renderer, 650, 146, 270, 108, 'Debug Overlay', [
        `Player x: ${transform.x.toFixed(1)}`,
        `Player y: ${transform.y.toFixed(1)}`,
        `Entities: ${this.world.countEntities()}`,
      ]);
    }
  }
}
