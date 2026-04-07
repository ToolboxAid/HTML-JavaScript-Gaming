/*
Toolbox Aid
David Quesenberry
03/22/2026
LobbySessionManager.js
*/
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

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
    return clone(session);
  }

  joinSession(sessionId, playerId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    if (!session.players.find((player) => player.playerId === playerId)) {
      session.players.push({ playerId, status: 'online' });
    }
    return clone(session);
  }

  leaveSession(sessionId, playerId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    session.players = session.players.filter((player) => player.playerId !== playerId);
    return clone(session);
  }

  setPresence(sessionId, playerId, status) {
    const session = this.sessions.get(sessionId);
    const player = session?.players.find((entry) => entry.playerId === playerId);
    if (!player) {
      return null;
    }

    player.status = status;
    return clone(session);
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? clone(session) : null;
  }
}
