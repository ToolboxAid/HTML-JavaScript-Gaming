import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { World } from '../../engine/ecs/index.js';
import {
  createTransform,
  createSize,
  createVelocity,
  createSpeed,
  createInputControlled,
  createCollider,
  createSolid,
  createRenderable,
} from '../../engine/components/index.js';
import { drawSceneFrame, drawValidationPanel, validateWorldEntities } from '../../engine/debug/index.js';
import {
  applyInputControl,
  moveEntities,
  blockCollidingEntities,
  renderRectEntities,
} from '../../engine/systems/index.js';

const theme = new Theme(ThemeTokens);

export default class ECSSceneWorldScene extends Scene {
  constructor() {
    super();

    this.world = new World({ dev: true });
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };
    this.hitSolid = false;
    this.validationIssues = [];

    const player = this.world.createEntity();
    this.world.addComponent(player, 'transform', createTransform(150, 240));
    this.world.addComponent(player, 'size', createSize(48, 48));
    this.world.addComponent(player, 'velocity', createVelocity(0, 0));
    this.world.addComponent(player, 'speed', createSpeed(250));
    this.world.addComponent(player, 'inputControlled', createInputControlled(true));
    this.world.addComponent(player, 'collider', createCollider(false));
    this.world.addComponent(player, 'renderable', createRenderable(theme.getColor('actorFill'), 'player'));

    const solidA = this.world.createEntity();
    this.world.addComponent(solidA, 'transform', createTransform(340, 170));
    this.world.addComponent(solidA, 'size', createSize(90, 170));
    this.world.addComponent(solidA, 'solid', createSolid(true));
    this.world.addComponent(solidA, 'renderable', createRenderable('#8888ff', 'solidA'));

    const solidB = this.world.createEntity();
    this.world.addComponent(solidB, 'transform', createTransform(540, 280));
    this.world.addComponent(solidB, 'size', createSize(160, 70));
    this.world.addComponent(solidB, 'solid', createSolid(true));
    this.world.addComponent(solidB, 'renderable', createRenderable('#66cc99', 'solidB'));

    this.validationIssues = validateWorldEntities(this.world, [
      { require: ['inputControlled'], alsoRequire: ['transform', 'size', 'velocity', 'speed'] },
      { require: ['solid'], alsoRequire: ['transform', 'size'] },
      { require: ['renderable'], alsoRequire: ['transform', 'size'] },
    ]);
  }

  update(dt, engine) {
    applyInputControl(this.world, engine.input);
    moveEntities(this.world, dt, this.worldBounds);
    this.hitSolid = blockCollidingEntities(this.world) > 0;
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample20',
      'Demonstrates a scene that delegates behavior to ECS-style systems',
      'Use Arrow keys to move the player entity through the world',
      `Collision state: ${this.hitSolid ? 'blocked' : 'clear'}`,
      'This sample shows how a scene can orchestrate systems instead of hand-wiring all logic',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    renderRectEntities(renderer, this.world, { label: true, labelOffsetY: -8 });

    if (this.validationIssues.length > 0) {
      drawValidationPanel(renderer, this.validationIssues);
    }
  }
}
