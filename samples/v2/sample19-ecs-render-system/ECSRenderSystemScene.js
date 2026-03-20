import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World, drawSceneFrame } from './ecs.js';

const theme = new Theme(ThemeTokens);

export default class ECSRenderSystemScene extends Scene {
  constructor() {
    super();

    this.world = new World();

    const colors = [theme.getColor('actorFill'), '#8888ff', '#66cc99', '#ffaa66', '#cc66aa'];
    const labels = ['player', 'solid', 'pickup', 'effect', 'marker'];

    colors.forEach((color, index) => {
      const entity = this.world.createEntity();
      this.world.addComponent(entity, 'transform', { x: 160 + index * 130, y: 260 - (index % 2) * 60 });
      this.world.addComponent(entity, 'size', { width: 56, height: 56 });
      this.world.addComponent(entity, 'renderable', { color, label: labels[index] });
    });
  }

  update() {}

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    drawSceneFrame(renderer, theme, width, height, [
      'Engine V2 Sample19',
      'Demonstrates an ECS render system driven by queried renderable entities',
      'Each entity is drawn through one shared render pass',
      'Labels help show how rendering data can stay independent from scene wiring',
      'This sample isolates rendering as its own engine-style system',
    ]);

    this.world.getEntitiesWith('transform', 'size', 'renderable').forEach((entityId) => {
      const transform = this.world.getComponent(entityId, 'transform');
      const size = this.world.getComponent(entityId, 'size');
      const renderable = this.world.getComponent(entityId, 'renderable');

      renderer.drawRect(transform.x, transform.y, size.width, size.height, renderable.color);
      renderer.strokeRect(transform.x, transform.y, size.width, size.height, '#ffffff', 1);
      renderer.drawText(renderable.label, transform.x + 6, transform.y + size.height + 18, {
        color: '#ffffff',
        font: '14px monospace',
      });
    });
  }
}
