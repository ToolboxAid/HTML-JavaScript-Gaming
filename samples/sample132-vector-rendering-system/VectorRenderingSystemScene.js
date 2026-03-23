/*
Toolbox Aid
David Quesenberry
03/22/2026
VectorRenderingSystemScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { transformPoints, drawVectorShape } from '../../engine/vector/index.js';

const theme = new Theme(ThemeTokens);

const shipShape = [
  { x: 0, y: -20 },
  { x: 14, y: 16 },
  { x: 0, y: 8 },
  { x: -14, y: 16 },
];

export default class VectorRenderingSystemScene extends Scene {
  constructor() {
    super();
    this.position = { x: 260, y: 300 };
    this.rotation = 0;
  }

  update(dtSeconds) {
    this.rotation += dtSeconds * 1.6;
    this.position.x = 260 + Math.sin(this.rotation * 0.8) * 100;
  }

  render(renderer) {
    const points = transformPoints(shipShape, {
      x: this.position.x,
      y: this.position.y,
      rotation: this.rotation,
      scale: 2.4,
    });

    drawFrame(renderer, theme, [
      'Engine Sample132',
      'Vector shapes render through engine-owned transform and drawing paths.',
      'The ship moves and rotates using transformed line geometry.',
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    drawVectorShape(renderer, points, { strokeColor: '#38bdf8', lineWidth: 3 });
    renderer.drawLine(this.position.x, this.position.y, this.position.x + 80, this.position.y, '#64748b', 1);

    drawPanel(renderer, 620, 34, 300, 150, 'Vector Rendering', [
      `X: ${this.position.x.toFixed(0)}`,
      `Rotation: ${this.rotation.toFixed(2)}`,
      `Points: ${points.length}`,
      'Transforms and polygon strokes stay engine-owned.',
    ]);
  }
}
