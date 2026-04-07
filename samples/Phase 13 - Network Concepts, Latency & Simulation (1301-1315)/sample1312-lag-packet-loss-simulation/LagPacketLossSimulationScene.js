/*
Toolbox Aid
David Quesenberry
03/22/2026
LagPacketLossSimulationScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { NetworkConditionSimulator, NetworkingLayer } from '../../../engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class LagPacketLossSimulationScene extends Scene {
  constructor() {
    super();
    this.hostSimulator = new NetworkConditionSimulator();
    [this.host, this.client] = NetworkingLayer.createLinkedPair({
      sessionId: 'sample156',
      clientSimulator: this.hostSimulator,
    });
    this.status = 'Choose a network condition and send a burst of packets.';
  }

  setMode(mode) {
    if (mode === 'clean') {
      this.hostSimulator.configure({ baseLatencyMs: 0, jitterMs: 0, lossRate: 0 });
    } else if (mode === 'medium') {
      this.hostSimulator.configure({ baseLatencyMs: 90, jitterMs: 30, lossRate: 0 });
    } else {
      this.hostSimulator.configure({ baseLatencyMs: 140, jitterMs: 60, lossRate: 0.35 });
    }
    this.status = `Applied ${mode} network profile.`;
  }

  sendBurst() {
    for (let index = 0; index < 6; index += 1) {
      this.client.send('burst', { id: index + 1 });
    }
    this.status = 'Client sent a six-packet burst.';
  }

  update(dtSeconds) {
    this.host.update(dtSeconds);
    this.client.update(dtSeconds);
    this.host.consumeReceived();
  }

  render(renderer) {
    const state = this.client.getState();
    drawFrame(renderer, theme, [
      'Engine Sample 01156',
      'Lag, jitter, and loss simulation stay reusable for multiplayer testing instead of being scene hacks.',
      this.status,
    ]);
    renderer.drawRect(120, 240, 320, 140, '#0f172a');
    renderer.drawRect(520, 240, 320, 140, '#111827');
    drawPanel(renderer, 620, 40, 270, 200, 'Simulated Link', [
      `Latency: ${state.simulator.baseLatencyMs}ms`,
      `Jitter: ${state.simulator.jitterMs}ms`,
      `Loss: ${Math.round(state.simulator.lossRate * 100)}%`,
      `Sent: ${state.sent}`,
      `Dropped: ${state.dropped}`,
      `Queued: ${state.simulator.queued}`,
    ]);
  }
}
