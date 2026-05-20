/*
Toolbox Aid
David Quesenberry
03/22/2026
LobbySessionManager.js
*/

import { deepClone } from '../../../shared/json/clone.js';
export default class LobbySessionManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession({ sessionId, hostId, name = sessionId } = {}) {
    const session = {
      sessionId,
      hostId,
      name,
      players: [{ playerId: hostId, status: 'host' }],
    };
    this.sessions.set(sessionId, session);
    return deepClone(session);
  }

  joinSession(sessionId, playerId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    if (!session.players.find((player) => player.playerId === playerId)) {
      session.players.push({ playerId, status: 'online' });
    }
    return deepClone(session);
  }

  leaveSession(sessionId, playerId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    session.players = session.players.filter((player) => player.playerId !== playerId);
    return deepClone(session);
  }

  setPresence(sessionId, playerId, status) {
    const session = this.sessions.get(sessionId);
    const player = session?.players.find((entry) => entry.playerId === playerId);
    if (!player) {
      return null;
    }

    player.status = status;
    return deepClone(session);
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? deepClone(session) : null;
  }
}
