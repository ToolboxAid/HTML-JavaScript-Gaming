/*
Toolbox Aid
David Quesenberry
03/22/2026
ChatPresenceLayer.js
*/
import LobbySessionManager from './LobbySessionManager.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default class ChatPresenceLayer {
  constructor({ lobby = null } = {}) {
    this.lobby = lobby || new LobbySessionManager();
    this.messages = new Map();
  }

  ensureSession(sessionId, hostId = 'host') {
    if (!this.lobby.getSession(sessionId)) {
      this.lobby.createSession({ sessionId, hostId });
    }
  }

  connect(sessionId, playerId) {
    this.ensureSession(sessionId);
    this.lobby.joinSession(sessionId, playerId);
    this.lobby.setPresence(sessionId, playerId, 'online');
    if (!this.messages.has(sessionId)) {
      this.messages.set(sessionId, []);
    }
  }

  setPresence(sessionId, playerId, status) {
    this.lobby.setPresence(sessionId, playerId, status);
  }

  sendMessage(sessionId, playerId, text) {
    if (!this.messages.has(sessionId)) {
      this.messages.set(sessionId, []);
    }
    this.messages.get(sessionId).push({
      playerId,
      text,
      timestamp: new Date().toISOString(),
    });
  }

  getState(sessionId) {
    return {
      session: this.lobby.getSession(sessionId),
      messages: clone(this.messages.get(sessionId) || []),
    };
  }
}
