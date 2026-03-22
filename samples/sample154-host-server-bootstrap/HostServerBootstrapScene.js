/*
Toolbox Aid
David Quesenberry
03/22/2026
HostServerBootstrapScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { HostServerBootstrap } from '../../engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class HostServerBootstrapScene extends Scene {
  constructor() {
    super();
    this.bootstrap = new HostServerBootstrap();
    this.status = 'Start the authoritative host, then attach a client.';
  }

  startHost() {
    this.bootstrap.startHost({ sessionId: 'sample154', hostId: 'authority-1' });
    this.status = 'Authoritative host bootstrapped and ready.';
  }

  attachClient() {
    this.bootstrap.attachClient(`client-${this.bootstrap.attachedClients.length + 1}`);
    this.status = 'Client attached to the bootstrapped host.';
  }

  render(renderer) {
    const state = this.bootstrap.getState();
    drawFrame(renderer, theme, [
      'Engine Sample154',
      'Host bootstrap makes authority startup repeatable instead of ad hoc.',
      this.status,
    ]);
    renderer.drawRect(120, 230, 220, 140, '#1d4ed8');
    renderer.drawText(state.host ? 'HOST READY' : 'NO HOST', 230, 305, {
      color: '#ffffff',
      font: '24px monospace',
      textAlign: 'center',
    });
    state.attachedClients.forEach((clientId, index) => {
      renderer.drawRect(420 + index * 110, 260, 90, 80, '#0f766e');
      renderer.drawText(clientId, 465 + index * 110, 305, {
        color: '#ffffff',
        font: '13px monospace',
        textAlign: 'center',
      });
    });
    drawPanel(renderer, 620, 40, 260, 180, 'Bootstrap', [
      `Host: ${state.host?.hostId || 'none'}`,
      `Authority: ${state.host?.authorityOwner || 'none'}`,
      `Session: ${state.host?.sessionId || 'none'}`,
      `Clients: ${state.attachedClients.length}`,
    ]);
  }
}
