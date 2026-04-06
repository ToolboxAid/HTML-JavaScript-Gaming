/*
Toolbox Aid
David Quesenberry
03/22/2026
ChatPresenceLayerScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { ChatPresenceLayer } from '../../../engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class ChatPresenceLayerScene extends Scene {
  constructor() {
    super();
    this.chat = new ChatPresenceLayer();
    this.sessionId = 'sample157';
    this.chat.connect(this.sessionId, 'host');
    this.status = 'Connect a guest and send lightweight chat messages.';
  }

  connectGuest() {
    this.chat.connect(this.sessionId, 'guest');
    this.status = 'Guest connected and is now visible in presence state.';
  }

  setAway() {
    this.chat.setPresence(this.sessionId, 'guest', 'away');
    this.status = 'Guest presence switched to away.';
  }

  sendChat() {
    this.chat.sendMessage(this.sessionId, 'guest', 'Ready to play.');
    this.status = 'Guest sent a chat message.';
  }

  render(renderer) {
    const state = this.chat.getState(this.sessionId);
    drawFrame(renderer, theme, [
      'Engine Sample 1314',
      'Presence and chat stay decoupled from gameplay logic in a reusable social layer.',
      this.status,
    ]);
    renderer.drawRect(90, 220, 420, 210, '#0f172a');
    (state.session?.players || []).forEach((player, index) => {
      renderer.drawRect(120, 250 + index * 44, 20, 20, player.status === 'away' ? '#f59e0b' : '#22c55e');
      renderer.drawText(`${player.playerId}: ${player.status}`, 160, 265 + index * 44, {
        color: '#e2e8f0',
        font: '15px monospace',
      });
    });
    drawPanel(renderer, 580, 40, 310, 220, 'Chat Transcript', [
      ...(state.messages.slice(-6).map((entry) => `${entry.playerId}: ${entry.text}`)),
      state.messages.length === 0 ? 'No messages yet.' : `Messages: ${state.messages.length}`,
    ]);
  }
}
