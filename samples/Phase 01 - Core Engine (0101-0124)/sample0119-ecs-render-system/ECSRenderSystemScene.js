/*
Toolbox Aid
David Quesenberry
03/21/2026
ECSRenderSystemScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { World } from '../../../engine/ecs/index.js';
import { drawSceneFrame } from '../../../engine/debug/index.js';
import { renderRectEntities } from '../../../engine/systems/index.js';

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
      'Engine Sample 0119',
      'Demonstrates an ECS render system driven by queried renderable entities',
      'Each entity is drawn through one shared render pass',
      'Labels help show how rendering data can stay independent from scene wiring',
      'This sample isolates rendering as its own engine-style system',
    ]);

    renderRectEntities(renderer, this.world, { label: true, labelOffsetY: 74 });
  }
}
