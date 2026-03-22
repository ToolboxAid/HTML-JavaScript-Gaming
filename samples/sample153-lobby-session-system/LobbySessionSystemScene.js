/*
Toolbox Aid
David Quesenberry
03/22/2026
LobbySessionSystemScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { LobbySessionManager } from '../../engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class LobbySessionSystemScene extends Scene {
  constructor() {
    super();
    this.lobby = new LobbySessionManager();
    this.sessionId = 'session-153';
    this.status = 'Create a session, then join or leave a player.';
  }

  create() {
    this.lobby.createSession({ sessionId: this.sessionId, hostId: 'host-1', name: 'Demo Lobby' });
    this.status = 'Created a reusable lobby session.';
  }

  join() {
    this.lobby.joinSession(this.sessionId, 'player-2');
    this.lobby.setPresence(this.sessionId, 'player-2', 'ready');
    this.status = 'Player-2 joined and marked ready.';
  }

  leave() {
    this.lobby.leaveSession(this.sessionId, 'player-2');
    this.status = 'Player-2 left the session.';
  }

  render(renderer) {
    const session = this.lobby.getSession(this.sessionId);
    drawFrame(renderer, theme, [
      'Engine Sample153',
      'Session orchestration stays in a lobby layer instead of leaking into gameplay scenes.',
      this.status,
    ]);
    renderer.drawRect(100, 220, 460, 200, '#0f172a');
    (session?.players || []).forEach((player, index) => {
      renderer.drawRect(130, 255 + index * 50, 28, 28, player.status === 'ready' ? '#22c55e' : '#38bdf8');
      renderer.drawText(`${player.playerId} (${player.status})`, 180, 275 + index * 50, {
        color: '#e2e8f0',
        font: '16px monospace',
      });
    });
    drawPanel(renderer, 620, 40, 260, 180, 'Lobby State', [
      `Session: ${session?.sessionId || 'none'}`,
      `Host: ${session?.hostId || 'none'}`,
      `Players: ${session?.players.length || 0}`,
      `Name: ${session?.name || 'n/a'}`,
    ]);
  }
}
