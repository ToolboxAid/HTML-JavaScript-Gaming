import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import {
  createTransform,
  createSize,
  createVelocity,
  createSpeed,
  createInputControlled,
  createRenderable,
} from '../../../engine/v2/components/index.js';
import { drawSceneFrame, drawPanel } from '../../../engine/v2/debug/index.js';
import {
  applyInputControl,
  moveEntities,
  renderRectEntities,
} from '../../../engine/v2/systems/index.js';

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
    this.world.addComponent(player, 'transform', createTransform(170, 250));
    this.world.addComponent(player, 'size', createSize(48, 48));
    this.world.addComponent(player, 'velocity', createVelocity(0, 0));
    this.world.addComponent(player, 'speed', createSpeed(240));
    this.world.addComponent(player, 'inputControlled', createInputControlled(true));
    this.world.addComponent(player, 'renderable', createRenderable(theme.getColor('actorFill'), 'player'));

    const beacon = this.world.createEntity();
    this.world.addComponent(beacon, 'transform', createTransform(720, 260));
    this.world.addComponent(beacon, 'size', createSize(42, 42));
    this.world.addComponent(beacon, 'renderable', createRenderable('#ffd166', 'beacon'));
  }

  update(dt, engine) {
    applyInputControl(this.world, engine.input);
    moveEntities(this.world, dt, this.worldBounds);
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
    renderRectEntities(renderer, this.world);

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
