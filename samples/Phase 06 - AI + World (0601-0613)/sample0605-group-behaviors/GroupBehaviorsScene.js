/*
Toolbox Aid
David Quesenberry
03/22/2026
GroupBehaviorsScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { stepGroupBehavior } from '../../../engine/ai/index.js';

const theme = new Theme(ThemeTokens);

export default class GroupBehaviorsScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 820, height: 280 };
    this.group = Array.from({ length: 7 }, (_, index) => ({
      x: 180 + index * 28,
      y: 260 + (index % 3) * 28,
      width: 24,
      height: 24,
      velocityX: 0,
      velocityY: 0,
    }));
  }

  update(dt) {
    const snapshot = this.group.map((agent) => ({ ...agent }));
    this.group.forEach((agent) => {
      stepGroupBehavior(agent, snapshot, dt, this.bounds, { maxSpeed: 70, neighborRadius: 110 });
    });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0605',
      'Reusable group steering creates coordinated movement tendencies across multiple agents.',
      'The group stays coherent without scene-to-scene wiring between members.',
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 2);
    this.group.forEach((agent, index) => {
      renderer.drawRect(agent.x, agent.y, agent.width, agent.height, index === 0 ? '#fbbf24' : '#60a5fa');
    });

    drawPanel(renderer, 620, 34, 300, 126, 'Group Behaviors', [
      `Agents: ${this.group.length}`,
      `Lead x: ${this.group[0].x.toFixed(1)}`,
      `Lead y: ${this.group[0].y.toFixed(1)}`,
      'Alignment, cohesion, separation',
    ]);
  }
}
