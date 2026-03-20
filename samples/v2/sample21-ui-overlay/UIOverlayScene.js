import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World, drawSceneFrame, drawPanel } from './ecs.js';

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
    const playerId = this.world.getEntitiesWith('transform', 'size', 'speed', 'inputControlled')[0];
    if (!playerId) return;

    const transform = this.world.getComponent(playerId, 'transform');
    const size = this.world.getComponent(playerId, 'size');
    const speed = this.world.getComponent(playerId, 'speed').value;

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
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample21',
      'Demonstrates a world layer plus a separate UI overlay layer',
      'Use Arrow keys to move the player entity across the world space',
      'The HUD and debug panel stay screen-fixed instead of world-positioned',
      'This sample starts the engine maturity phase with readable overlays',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);

    this.world.getEntitiesWith('transform', 'size', 'renderable').forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const renderable = this.world.getComponent(entityId, 'renderable');

      renderer.drawRect(transform.x, transform.y, size.width, size.height, renderable.color);
      renderer.strokeRect(transform.x, transform.y, size.width, size.height, '#ffffff', 1);
    });

    drawPanel(renderer, 650, 26, 270, 108, 'HUD', [
      `Score: ${this.score}`,
      `Health: ${this.health}%`,
      `Objective: ${this.objective}`,
    ]);

    if (this.debugEnabled) {
      const playerId = this.world.getEntitiesWith('inputControlled')[0];
      const transform = this.world.getComponent(playerId, 'transform');
      drawPanel(renderer, 650, 146, 270, 108, 'Debug Overlay', [
        `Player x: ${transform.x.toFixed(1)}`,
        `Player y: ${transform.y.toFixed(1)}`,
        `Entities: ${this.world.countEntities()}`,
      ]);
    }
  }
}
