/*
Toolbox Aid
David Quesenberry
03/22/2026
NetworkDebugOverlayScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { drawFrame } from '../../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawNetworkDebugOverlay, NetworkingLayer, NetworkConditionSimulator } from '../../../engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class NetworkDebugOverlayScene extends Scene {
  constructor() {
    super();
    [this.host, this.client] = NetworkingLayer.createLinkedPair({
      sessionId: 'sample151',
      clientSimulator: new NetworkConditionSimulator({ baseLatencyMs: 45, jitterMs: 10 }),
    });
    this.status = 'Use Send Message to update the overlay metrics.';
  }

  send() {
    this.client.send('debug-ping', { ok: true });
    this.status = 'Client sent a message through a simulated network condition.';
  }

  update(dtSeconds) {
    this.host.update(dtSeconds);
    this.client.update(dtSeconds);
    if (this.host.consumeReceived().length > 0) {
      this.host.send('debug-pong', { ok: true });
    }
    this.client.consumeReceived();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample151',
      'The optional overlay surfaces network diagnostics without pushing debug UI into game scenes.',
      this.status,
    ]);
    renderer.drawRect(110, 240, 400, 160, '#0f172a');
    renderer.drawText('Networked gameplay area', 310, 325, {
      color: '#e2e8f0',
      font: '22px monospace',
      textAlign: 'center',
    });
    drawNetworkDebugOverlay(renderer, this.client, { title: 'Client Overlay' });
  }
}
