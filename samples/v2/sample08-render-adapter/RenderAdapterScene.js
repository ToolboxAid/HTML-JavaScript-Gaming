import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { Entity, Transform, Velocity, Bounds } from '../../../engine/v2/entity/index.js';

const theme = new Theme(ThemeTokens);

export default class RenderAdapterScene extends Scene {
  constructor() {
    super();
    this.playArea = { x: 40, y: 160, width: 880, height: 330 };
    this.entity = new Entity({
      transform: new Transform(160, 260),
      velocity: new Velocity(160, 120),
      bounds: new Bounds(48, 48),
    });
    this.textStartX = 40;
    this.textStartY = 48;
    this.textLineHeight = 24;
  }

  update(dt) {
    const nextX = this.entity.transform.x + this.entity.velocity.x * dt;
    const nextY = this.entity.transform.y + this.entity.velocity.y * dt;
    const maxX = this.playArea.x + this.playArea.width - this.entity.bounds.width;
    const maxY = this.playArea.y + this.playArea.height - this.entity.bounds.height;

    this.entity.transform.x = nextX;
    this.entity.transform.y = nextY;

    if (this.entity.transform.x <= this.playArea.x || this.entity.transform.x >= maxX) {
      this.entity.transform.x = Math.max(this.playArea.x, Math.min(maxX, this.entity.transform.x));
      this.entity.velocity.x *= -1;
    }

    if (this.entity.transform.y <= this.playArea.y || this.entity.transform.y >= maxY) {
      this.entity.transform.y = Math.max(this.playArea.y, Math.min(maxY, this.entity.transform.y));
      this.entity.velocity.y *= -1;
    }
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();
    renderer.clear(theme.getColor('canvasBackground'));
    renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);
    renderer.strokeRect(this.playArea.x, this.playArea.y, this.playArea.width, this.playArea.height, '#d8d5ff', 3);

    renderer.drawRect(
      this.entity.transform.x,
      this.entity.transform.y,
      this.entity.bounds.width,
      this.entity.bounds.height,
      theme.getColor('actorFill')
    );

    const lines = [
      'Engine V2 Sample08',
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
