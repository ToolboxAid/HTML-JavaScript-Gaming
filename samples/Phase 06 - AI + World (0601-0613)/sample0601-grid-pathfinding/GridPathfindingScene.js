/*
Toolbox Aid
David Quesenberry
03/22/2026
GridPathfindingScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { advancePatrolRoute, findGridPath } from '../../../engine/ai/index.js';

const theme = new Theme(ThemeTokens);

export default class GridPathfindingScene extends Scene {
  constructor() {
    super();
    this.cellSize = 56;
    this.origin = { x: 120, y: 150 };
    this.grid = [
      [0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0, 0],
      [0, 1, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0],
    ];
    this.start = { x: 0, y: 0 };
    this.goal = { x: 5, y: 5 };
    this.path = findGridPath(this.grid, this.start, this.goal);
    this.route = this.path.map((node) => ({
      x: this.origin.x + node.x * this.cellSize + 12,
      y: this.origin.y + node.y * this.cellSize + 12,
    }));
    this.agent = { x: this.route[0]?.x ?? 0, y: this.route[0]?.y ?? 0, width: 32, height: 32, speed: 120 };
  }

  update(dt) {
    advancePatrolRoute(this.agent, this.route, dt, { speed: this.agent.speed, tolerance: 3, loop: true });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0601',
      'Grid A* pathfinding computes a reusable route across blocked cells.',
      'The agent is following the engine-produced path result.',
    ]);

    this.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        const px = this.origin.x + x * this.cellSize;
        const py = this.origin.y + y * this.cellSize;
        renderer.drawRect(px, py, this.cellSize - 2, this.cellSize - 2, cell === 1 ? '#334155' : '#1e293b');
        renderer.strokeRect(px, py, this.cellSize - 2, this.cellSize - 2, '#64748b', 1);
      });
    });

    this.route.forEach((point, index) => {
      renderer.drawRect(point.x + 8, point.y + 8, 16, 16, index === 0 ? '#34d399' : '#60a5fa');
    });

    renderer.drawRect(
      this.origin.x + this.goal.x * this.cellSize + 12,
      this.origin.y + this.goal.y * this.cellSize + 12,
      32,
      32,
      '#fbbf24',
    );
    renderer.drawRect(this.agent.x, this.agent.y, this.agent.width, this.agent.height, '#f97316');

    drawPanel(renderer, 620, 34, 300, 126, 'Grid A*', [
      `Path nodes: ${this.path.length}`,
      `Start: ${this.start.x},${this.start.y}`,
      `Goal: ${this.goal.x},${this.goal.y}`,
      'Dark cells are blocked.',
    ]);
  }
}
