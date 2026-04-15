/*
Toolbox Aid
David Quesenberry
03/22/2026
HostServerBootstrap.js
*/
import LobbySessionManager from '../session/LobbySessionManager.js';

export default class HostServerBootstrap {
  constructor({ lobby = null } = {}) {
    this.lobby = lobby || new LobbySessionManager();
    this.host = null;
    this.attachedClients = [];
  }

  startHost({ sessionId = 'session-alpha', hostId = 'host', name = 'Authority Host' } = {}) {
    const session = this.lobby.createSession({ sessionId, hostId, name });
    this.host = {
      sessionId,
      hostId,
      ready: true,
      authorityOwner: hostId,
    };
    this.attachedClients = [];
    return {
      host: { ...this.host },
      session,
    };
  }

  attachClient(playerId) {
    if (!this.host) {
      throw new Error('Host must be started before attaching clients.');
    }

    this.lobby.joinSession(this.host.sessionId, playerId);
    this.attachedClients.push(playerId);
    return this.getState();
  }

  getState() {
    return {
      host: this.host ? { ...this.host } : null,
      attachedClients: [...this.attachedClients],
      session: this.host ? this.lobby.getSession(this.host.sessionId) : null,
    };
  }
}
