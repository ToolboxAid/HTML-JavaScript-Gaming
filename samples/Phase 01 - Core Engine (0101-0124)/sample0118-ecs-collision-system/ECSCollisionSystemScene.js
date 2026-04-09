/*
Toolbox Aid
David Quesenberry
03/21/2026
ECSCollisionSystemScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { World } from '/src/engine/ecs/index.js';
import {
  createTransform,
  createSize,
  createVelocity,
  createSpeed,
  createInputControlled,
  createCollider,
  createSolid,
  createRenderable,
} from '/src/engine/components/index.js';
import { drawSceneFrame } from '/src/engine/debug/index.js';
import {
  applyInputControl,
  moveEntities,
  blockCollidingEntities,
  renderRectEntities,
} from '/src/engine/systems/index.js';

const theme = new Theme(ThemeTokens);

export default class ECSCollisionSystemScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };
    this.hitSolid = false;

    const player = this.world.createEntity();
    this.world.addComponent(player, 'transform', createTransform(130, 250));
    this.world.addComponent(player, 'size', createSize(48, 48));
    this.world.addComponent(player, 'velocity', createVelocity(0, 0));
    this.world.addComponent(player, 'speed', createSpeed(240));
    this.world.addComponent(player, 'inputControlled', createInputControlled(true));
    this.world.addComponent(player, 'collider', createCollider(false));
    this.world.addComponent(player, 'renderable', createRenderable(theme.getColor('actorFill')));

    const solidA = this.world.createEntity();
    this.world.addComponent(solidA, 'transform', createTransform(330, 190));
    this.world.addComponent(solidA, 'size', createSize(80, 180));
    this.world.addComponent(solidA, 'solid', createSolid(true));
    this.world.addComponent(solidA, 'renderable', createRenderable('#8888ff'));

    const solidB = this.world.createEntity();
    this.world.addComponent(solidB, 'transform', createTransform(500, 250));
    this.world.addComponent(solidB, 'size', createSize(180, 70));
    this.world.addComponent(solidB, 'solid', createSolid(true));
    this.world.addComponent(solidB, 'renderable', createRenderable('#8888ff'));
  }

  update(dt, engine) {
    applyInputControl(this.world, engine.input);
    moveEntities(this.world, dt, this.worldBounds);
    this.hitSolid = blockCollidingEntities(this.world) > 0;
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine Sample 0118',
      'Demonstrates an ECS collision system using collider and solid components',
      'Use Arrow keys to move the player entity around the play area',
      `Collision state: ${this.hitSolid ? 'blocked by solid' : 'clear'}`,
      'This is the first ECS sample where movement and collision work together',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    renderRectEntities(renderer, this.world);
  }
}
