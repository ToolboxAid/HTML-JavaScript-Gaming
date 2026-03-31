/*
Toolbox Aid
David Quesenberry
03/21/2026
RenderAdapterScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { Entity, Transform, Velocity, Bounds } from '../../../engine/entity/index.js';

const theme = new Theme(ThemeTokens);

export default class RenderAdapterScene extends Scene {
  constructor() {
    super();
    this.playArea = { x: 40, y: 160, width: 880, height: 330 };
    this.entity = new Entity({
      transform: new Transform({ x: 160, y: 260 }),
      velocity: new Velocity(160, 120),
      bounds: new Bounds({ width: 48, height: 48 }),
    });
    this.textStartX = 40;
    this.textStartY = 48;
    this.textLineHeight = 24;
  }

  update(dt) {
    this.entity.integrate(dt);
    const position = this.entity.transform.position;
    const halfWidth = this.entity.bounds.width / 2;
    const halfHeight = this.entity.bounds.height / 2;
    const minX = this.playArea.x + halfWidth;
    const maxX = this.playArea.x + this.playArea.width - halfWidth;
    const minY = this.playArea.y + halfHeight;
    const maxY = this.playArea.y + this.playArea.height - halfHeight;

    if (position.x <= minX || position.x >= maxX) {
      position.x = Math.max(minX, Math.min(maxX, position.x));
      this.entity.velocity.x *= -1;
    }

    if (position.y <= minY || position.y >= maxY) {
      position.y = Math.max(minY, Math.min(maxY, position.y));
      this.entity.velocity.y *= -1;
    }
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();
    const position = this.entity.transform.position;
    renderer.clear(theme.getColor('canvasBackground'));
    renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);
    renderer.strokeRect(this.playArea.x, this.playArea.y, this.playArea.width, this.playArea.height, '#d8d5ff', 3);

    renderer.drawRect(
      position.x - this.entity.bounds.width / 2,
      position.y - this.entity.bounds.height / 2,
      this.entity.bounds.width,
      this.entity.bounds.height,
      theme.getColor('actorFill')
    );

    const lines = [
      'Engine Sample08',
      'Demonstrates the render adapter abstraction',
      'Rendering is performed through a renderer, not direct canvas calls',
      'Observe that scene behavior stays the same while drawing stays decoupled',
      'This sample keeps canvas implementation details outside the scene API',
    ];

    lines.forEach((line, index) => {
      renderer.drawText(line, this.textStartX, this.textStartY + this.textLineHeight * index, {
        color: '#dddddd',
        font: '16px monospace',
      });
    });
  }
}
