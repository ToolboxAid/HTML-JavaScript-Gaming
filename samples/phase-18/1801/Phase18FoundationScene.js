/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase18FoundationScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class Phase18FoundationScene extends Scene {
  constructor({ coreServices = null } = {}) {
    super();
    this.elapsed = 0;
    this.coreServices = coreServices;
    this.lastHeartbeatTick = 0;
    this.lastHeartbeatTime = 0;
    this.unsubscribeHeartbeat = null;
  }

  enter(engine) {
    if (!this.coreServices) return;
    const channel = this.coreServices.get('phase18.channel');
    if (channel && typeof channel.subscribe === 'function') {
      this.unsubscribeHeartbeat = channel.subscribe('phase18.heartbeat', (payload) => {
        this.lastHeartbeatTick = Number(payload?.tick) || 0;
        this.lastHeartbeatTime = Number(payload?.t) || 0;
      });
    }
    this.coreServices.start({ engine, scene: this });
  }

  update(dtSeconds) {
    this.elapsed += dtSeconds;
    this.coreServices?.update(dtSeconds, { scene: this });
  }

  exit() {
    if (typeof this.unsubscribeHeartbeat === 'function') {
      this.unsubscribeHeartbeat();
      this.unsubscribeHeartbeat = null;
    }
    this.coreServices?.stop({ scene: this });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1801 - Phase 18 Foundation',
      'Minimal Phase 18 structure bootstrap and launcher wiring.',
      'No feature implementation in this scaffold.',
    ]);

    renderer.drawRect(120, 212, 720, 200, '#0f172a');
    renderer.strokeRect(120, 212, 720, 200, '#d8d5ff', 2);

    const pulse = 0.5 + Math.sin(this.elapsed * 2.1) * 0.5;
    const alpha = (0.2 + pulse * 0.6).toFixed(2);
    renderer.drawRect(150, 302, 24, 24, `rgba(56, 189, 248, ${alpha})`);
    renderer.drawText('Foundation scaffold active', 190, 318, {
      color: '#bae6fd',
      font: '16px monospace',
    });

    drawPanel(renderer, 620, 34, 300, 160, 'Phase 18 Bootstrap', [
      'Status: initialized',
      'Folder: samples/phase-18',
      'Entry sample: 1801',
      `Services: ${this.coreServices?.listServiceIds().length ?? 0}`,
      `Heartbeat tick: ${this.lastHeartbeatTick} @ ${this.lastHeartbeatTime.toFixed(2)}s`,
    ]);
  }
}
