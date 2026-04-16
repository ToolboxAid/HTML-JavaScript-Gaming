/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase19FoundationScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class Phase19FoundationScene extends Scene {
  constructor({ runtimeLayer = null } = {}) {
    super();
    this.elapsed = 0;
    this.runtimeLayer = runtimeLayer;
    this.lastHeartbeatTick = 0;
    this.lastHeartbeatTime = 0;
    this.lastRuntimeTransition = 'idle';
    this.unsubscribeHeartbeat = null;
    this.unsubscribeRuntimeState = null;
  }

  enter(engine) {
    if (!this.runtimeLayer) return;
    this.unsubscribeRuntimeState = this.runtimeLayer.onStateChange(({ previous, next }) => {
      this.lastRuntimeTransition = `${previous} -> ${next}`;
    });
    const channel = this.runtimeLayer.getService('phase19.channel');
    if (channel && typeof channel.subscribe === 'function') {
      this.unsubscribeHeartbeat = channel.subscribe('phase19.heartbeat', (payload) => {
        this.lastHeartbeatTick = Number(payload?.tick) || 0;
        this.lastHeartbeatTime = Number(payload?.t) || 0;
      });
    }
    this.runtimeLayer.start({ engine, scene: this });
  }

  update(dtSeconds) {
    this.elapsed += dtSeconds;
    this.runtimeLayer?.update(dtSeconds, { scene: this });
  }

  exit() {
    if (typeof this.unsubscribeHeartbeat === 'function') {
      this.unsubscribeHeartbeat();
      this.unsubscribeHeartbeat = null;
    }
    if (typeof this.unsubscribeRuntimeState === 'function') {
      this.unsubscribeRuntimeState();
      this.unsubscribeRuntimeState = null;
    }
    this.runtimeLayer?.stop({ scene: this });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1901 - Phase 19 Core Services',
      'Minimal Phase 19 core-services skeleton wired into foundation sample.',
      'No feature implementation in this core-services slice.',
    ]);

    renderer.drawRect(120, 212, 720, 200, '#0f172a');
    renderer.strokeRect(120, 212, 720, 200, '#d8d5ff', 2);

    const pulse = 0.5 + Math.sin(this.elapsed * 2.0) * 0.5;
    const alpha = (0.2 + pulse * 0.6).toFixed(2);
    renderer.drawRect(150, 302, 24, 24, `rgba(56, 189, 248, ${alpha})`);
    renderer.drawText('Phase 19 foundation scaffold active', 190, 318, {
      color: '#bae6fd',
      font: '16px monospace',
    });

    const runtimeSnapshot = this.runtimeLayer?.getSnapshot?.() || {
      state: 'idle',
      tickCount: 0,
      serviceIds: [],
    };
    const channelSnapshot = this.runtimeLayer?.getService?.('phase19.channel')?.getSnapshot?.() || {
      publishedCount: 0,
      lastChannel: 'none',
    };
    drawPanel(renderer, 620, 34, 300, 160, 'Phase 19 Bootstrap', [
      'Status: initialized (runtime layer)',
      'Folder: samples/phase-19',
      'Entry sample: 1901',
      `Runtime: ${runtimeSnapshot.state} | tick ${runtimeSnapshot.tickCount}`,
      `Transition: ${this.lastRuntimeTransition}`,
      `Services: ${runtimeSnapshot.serviceIds.length}`,
      `Published: ${channelSnapshot.publishedCount} (${channelSnapshot.lastChannel})`,
      `Heartbeat tick: ${this.lastHeartbeatTick} @ ${this.lastHeartbeatTime.toFixed(2)}s`,
    ]);
  }
}
