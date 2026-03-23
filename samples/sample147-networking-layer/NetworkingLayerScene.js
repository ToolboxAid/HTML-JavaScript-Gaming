/*
Toolbox Aid
David Quesenberry
03/22/2026
NetworkingLayerScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { NetworkingLayer } from '../../engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class NetworkingLayerScene extends Scene {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    [this.host, this.client] = NetworkingLayer.createLinkedPair({
      hostId: 'host',
      clientId: 'client',
      sessionId: 'sample147',
    });
    this.status = 'Host and client connected. Send a ping to exchange a visible message.';
    this.lastPacket = 'none';
  }

  sendPing() {
    this.client.send('ping', { text: 'Hello host' });
    this.status = 'Client queued a ping message.';
  }

  disconnectClient() {
    this.client.disconnect('user');
    this.status = 'Client disconnected.';
  }

  update(dtSeconds) {
    this.host.update(dtSeconds);
    this.client.update(dtSeconds);
    const packets = this.host.consumeReceived();
    if (packets.length > 0) {
      this.lastPacket = `${packets[packets.length - 1].type} from ${packets[packets.length - 1].from}`;
      this.host.send('pong', { ok: true });
    }
    const replies = this.client.consumeReceived();
    if (replies.length > 0) {
      this.lastPacket = `${replies[replies.length - 1].type} from ${replies[replies.length - 1].from}`;
      this.status = 'Host received ping and client received pong.';
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample147',
      'Connection lifecycle and message exchange are owned by the reusable networking layer.',
      this.status,
    ]);

    renderer.drawRect(140, 240, 180, 120, '#1d4ed8');
    renderer.drawRect(440, 240, 180, 120, '#0f766e');
    renderer.drawText('HOST', 230, 300, { color: '#ffffff', font: '24px monospace', textAlign: 'center' });
    renderer.drawText('CLIENT', 530, 300, { color: '#ffffff', font: '24px monospace', textAlign: 'center' });

    drawPanel(renderer, 660, 40, 250, 220, 'Network State', [
      `Host: ${this.host.getState().connectionState}`,
      `Client: ${this.client.getState().connectionState}`,
      `Host Msgs: ${this.host.getState().received}`,
      `Client Msgs: ${this.client.getState().received}`,
      `Last Packet: ${this.lastPacket}`,
    ]);
  }
}
