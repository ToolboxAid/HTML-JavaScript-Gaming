/*
Toolbox Aid
David Quesenberry
03/21/2026
ECSInputSystemScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { World } from '../../../src/engine/ecs/index.js';
import {
  createTransform,
  createSize,
  createVelocity,
  createSpeed,
  createInputControlled,
  createRenderable,
} from '../../../src/engine/components/index.js';
import { drawSceneFrame } from '../../../src/engine/debug/index.js';
import { applyInputControl, moveEntities, clampEntitiesToBounds, renderRectEntities } from '../../../src/engine/systems/index.js';

const theme = new Theme(ThemeTokens);

export default class ECSInputSystemScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };

    const player = this.world.createEntity();
    this.world.addComponent(player, 'transform', createTransform(220, 250));
    this.world.addComponent(player, 'size', createSize(48, 48));
    this.world.addComponent(player, 'velocity', createVelocity(0, 0));
    this.world.addComponent(player, 'speed', createSpeed(250));
    this.world.addComponent(player, 'inputControlled', createInputControlled(true));
    this.world.addComponent(player, 'renderable', createRenderable(theme.getColor('actorFill')));

    const marker = this.world.createEntity();
    this.world.addComponent(marker, 'transform', createTransform(620, 250));
    this.world.addComponent(marker, 'size', createSize(60, 60));
    this.world.addComponent(marker, 'renderable', createRenderable('#8888ff'));
  }

  update(dt, engine) {
    applyInputControl(this.world, engine.input);
    moveEntities(this.world, dt, this.worldBounds);
    clampEntitiesToBounds(this.world, this.worldBounds, ['transform', 'size', 'inputControlled']);
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine Sample 0117',
      'Demonstrates an ECS input system with inputControlled and speed components',
      'Use Arrow keys to move the player entity through the play area',
      'The scene queries component sets instead of hard-coding player fields',
      'This is the bridge from ECS structure into interactive control',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    renderRectEntities(renderer, this.world);
  }
}
