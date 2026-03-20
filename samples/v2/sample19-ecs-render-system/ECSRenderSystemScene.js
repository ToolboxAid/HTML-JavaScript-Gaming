import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { World } from '../../../engine/v2/ecs/index.js';
import { DebugPanel } from '../../../engine/v2/debug/index.js';
import { RenderSystem } from '../../../engine/v2/systems/index.js';

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
    DebugPanel.drawFrame(renderer, theme, [
      'Engine V2 Sample19',
      'Demonstrates an ECS render system driven by queried renderable entities',
      'Each entity is drawn through one shared render pass',
      'Labels help show how rendering data can stay independent from scene wiring',
      'This sample isolates rendering as its own engine-style system',
    ]);

    RenderSystem.drawRenderableEntities(renderer, this.world, { labelMode: 'below' });
  }
}
