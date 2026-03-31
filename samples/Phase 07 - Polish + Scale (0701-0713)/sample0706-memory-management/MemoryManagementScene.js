/*
Toolbox Aid
David Quesenberry
03/22/2026
MemoryManagementScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { DisposableStore, ObjectPool } from '../../../engine/memory/index.js';

const theme = new Theme(ThemeTokens);

export default class MemoryManagementScene extends Scene {
  constructor() {
    super();
    this.pool = new ObjectPool(
      () => ({ x: 0, y: 0, active: true }),
      (item) => { item.active = false; item.x = 0; item.y = 0; },
    );
    this.disposables = new DisposableStore();
    this.active = [];
    this.time = 0;
  }

  enter(engine) {
    this.disposables.add(engine.events.on('spawn_pool_item', ({ x, y }) => {
      const item = this.pool.acquire();
      item.active = true;
      item.x = x;
      item.y = y;
      this.active.push(item);
    }));
  }

  update(dt, engine) {
    this.time += dt;
    if (this.time >= 0.4) {
      this.time = 0;
      engine.events.emit('spawn_pool_item', {
        x: 120 + this.active.length * 44,
        y: 280,
      });
    }

    if (this.active.length > 6) {
      const released = this.active.shift();
      this.pool.release(released);
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample114',
      'Pooling and disposable cleanup stay engine-owned for safer long-running lifecycle behavior.',
      'Objects are reused instead of endlessly allocated.',
    ]);
    this.active.forEach((item) => {
      renderer.drawRect(item.x, item.y, 24, 24, '#34d399');
    });
    drawPanel(renderer, 620, 34, 300, 126, 'Memory Management', [
      `Active: ${this.active.length}`,
      `Pooled: ${this.pool.stats().pooled}`,
      `In use: ${this.pool.stats().inUse}`,
      'Dispose/pool patterns are reusable.',
    ]);
  }

  exit() {
    this.disposables.disposeAll();
  }
}
