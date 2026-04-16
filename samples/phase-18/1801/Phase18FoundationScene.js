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
  constructor({ phase18Flow = null } = {}) {
    super();
    this.elapsed = 0;
    this.phase18Flow = phase18Flow;
    this.lastHeartbeatTick = 0;
    this.lastHeartbeatTime = 0;
    this.lastRuntimeTransition = 'idle';
    this.unsubscribeRuntimeState = null;
  }

  enter(engine) {
    if (!this.phase18Flow) return;
    this.unsubscribeRuntimeState = this.phase18Flow.onStateChange(({ previous, next }) => {
      this.lastRuntimeTransition = `${previous} -> ${next}`;
    });
    this.phase18Flow.start({ engine, scene: this });
  }

  update(dtSeconds) {
    this.elapsed += dtSeconds;
    this.phase18Flow?.update(dtSeconds, { scene: this });
    const snapshot = this.phase18Flow?.getSnapshot?.();
    if (snapshot?.flow) {
      this.lastHeartbeatTick = Number(snapshot.flow.lastHeartbeatTick) || 0;
      this.lastHeartbeatTime = Number(snapshot.flow.lastHeartbeatSeconds) || 0;
    }
  }

  exit() {
    if (typeof this.unsubscribeRuntimeState === 'function') {
      this.unsubscribeRuntimeState();
      this.unsubscribeRuntimeState = null;
    }
    this.phase18Flow?.stop({ scene: this });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1801 - Phase 18 Foundation',
      'Minimal Phase 18 runtime-layer scaffolding integrated with core services.',
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

    const phase18Snapshot = this.phase18Flow?.getSnapshot?.() || {
      runtime: {
        state: 'idle',
        tickCount: 0,
        serviceIds: [],
      },
      flow: {
        runtimeStateEvents: 0,
      },
    };
    const runtimeSnapshot = phase18Snapshot.runtime || {
      state: 'idle',
      tickCount: 0,
      serviceIds: [],
    };
    const flowSnapshot = phase18Snapshot.flow || { runtimeStateEvents: 0 };
    drawPanel(renderer, 620, 34, 300, 160, 'Phase 18 Bootstrap', [
      'Status: initialized',
      'Folder: samples/phase-18',
      'Entry sample: 1801',
      `Runtime: ${runtimeSnapshot.state} | tick ${runtimeSnapshot.tickCount}`,
      `Transition: ${this.lastRuntimeTransition}`,
      `Flow events: ${flowSnapshot.runtimeStateEvents}`,
      `Services: ${runtimeSnapshot.serviceIds.length}`,
      `Heartbeat tick: ${this.lastHeartbeatTick} @ ${this.lastHeartbeatTime.toFixed(2)}s`,
    ]);
  }
}
