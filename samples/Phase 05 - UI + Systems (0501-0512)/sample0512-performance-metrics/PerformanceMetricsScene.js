/*
Toolbox Aid
David Quesenberry
03/22/2026
PerformanceMetricsScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPerformanceMetricsPanel } from '/src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class PerformanceMetricsScene extends Scene {
  constructor() {
    super();
    this.bars = Array.from({ length: 36 }, (_, index) => ({
      x: 80 + index * 22,
      y: 250,
      width: 14,
      height: 120 + (index % 6) * 18,
      phase: index * 0.17,
    }));
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  render(renderer, engine) {
    drawFrame(renderer, theme, [
      'Engine sample 0512',
      'Runtime timing and update counts come from engine-owned metrics instrumentation.',
      'The panel is optional and can be reused in later samples without scene-owned profiling code.',
    ]);

    this.bars.forEach((bar, index) => {
      const pulse = (Math.sin(this.time * 2.6 + bar.phase) + 1) * 0.5;
      const height = 50 + pulse * bar.height;
      renderer.drawRect(bar.x, 430 - height, bar.width, height, index % 2 === 0 ? '#60a5fa' : '#34d399');
    });

    drawPerformanceMetricsPanel(renderer, engine.metrics, {
      x: 620,
      y: 34,
      width: 300,
      height: 146,
      title: 'Runtime Metrics',
    });
  }
}
