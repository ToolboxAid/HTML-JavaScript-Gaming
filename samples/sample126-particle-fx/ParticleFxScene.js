/*
Toolbox Aid
David Quesenberry
03/22/2026
ParticleFxScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { ParticleSystem } from '../../engine/fx/index.js';

const theme = new Theme(ThemeTokens);

export default class ParticleFxScene extends Scene {
  constructor() {
    super();
    this.effects = new ParticleSystem();
    this.status = 'Trigger an explosion to prove the particle lifecycle.';
    this.activeShape = 'square';
  }

  update(dtSeconds) {
    this.effects.update(dtSeconds);
  }

  explode(shape = this.activeShape) {
    this.activeShape = shape;
    this.effects.spawnExplosion({ x: 320, y: 300, count: 20, speed: 140, shape });
    this.status = `${shape} explosion spawned.`;
  }

  explodeRandomized(shape = this.activeShape) {
    this.activeShape = shape;
    const x = 180 + Math.random() * 260;
    const y = 250 + Math.random() * 90;
    const count = 12 + Math.floor(Math.random() * 18);
    const speed = 90 + Math.random() * 120;
    const colors = ['#f59e0b', '#ef4444', '#38bdf8', '#34d399', '#a78bfa'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    this.effects.spawnExplosion({ x, y, count, speed, color, randomize: true, shape });
    this.status = `Randomized ${shape} burst spawned at ${x.toFixed(0)}, ${y.toFixed(0)}.`;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample126',
      'Explosion particles are managed by an engine-owned effect system.',
      this.status,
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    renderer.drawRect(300, 280, 40, 40, '#94a3b8');
    this.effects.render(renderer);

    drawPanel(renderer, 620, 34, 300, 140, 'Particle FX', [
      `Particles: ${this.effects.getSnapshot().length}`,
      `Shape: ${this.activeShape}`,
      'Lifecycle, movement, and cleanup stay reusable.',
      'Choose a shape button, then compare centered vs random bursts.',
    ]);
  }
}
