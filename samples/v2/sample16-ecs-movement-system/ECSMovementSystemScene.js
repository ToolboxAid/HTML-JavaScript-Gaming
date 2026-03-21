import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { createTransform, createSize, createVelocity, createRenderable } from '../../../engine/v2/components/index.js';
import { drawSceneFrame } from '../../../engine/v2/debug/index.js';
import { moveEntities, bounceEntitiesHorizontallyInBounds, renderRectEntities } from '../../../engine/v2/systems/index.js';

const theme = new Theme(ThemeTokens);

export default class ECSMovementSystemScene extends Scene {
  constructor() {
    super();

    this.world = new World();
    this.worldBounds = { x: 80, y: 170, width: 800, height: 280 };

    const moverA = this.world.createEntity();
    this.world.addComponent(moverA, 'transform', createTransform(140, 220));
    this.world.addComponent(moverA, 'size', createSize(44, 44));
    this.world.addComponent(moverA, 'velocity', createVelocity(160, 0));
    this.world.addComponent(moverA, 'renderable', createRenderable(theme.getColor('actorFill')));

    const moverB = this.world.createEntity();
    this.world.addComponent(moverB, 'transform', createTransform(700, 320));
    this.world.addComponent(moverB, 'size', createSize(52, 52));
    this.world.addComponent(moverB, 'velocity', createVelocity(-120, 0));
    this.world.addComponent(moverB, 'renderable', createRenderable('#8888ff'));
  }

  update(dt) {
    moveEntities(this.world, dt);
    bounceEntitiesHorizontallyInBounds(this.world, this.worldBounds);
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample16',
      'Demonstrates an ECS movement system using transform and velocity components',
      'Each moving entity is updated through the same shared system logic',
      'Horizontal bounds reflection keeps the sample visually predictable',
      'This pattern sets up later input and collision systems',
    ]);

    renderer.strokeRect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height, '#d8d5ff', 3);
    renderRectEntities(renderer, this.world);
  }
}
