/*
Toolbox Aid
David Quesenberry
04/15/2026
HandshakeSimulator.js
*/
import LoopbackTransport from './LoopbackTransport.js';
import {
  createSessionLifecycle,
  getSessionLifecycleContract,
  SESSION_STATES,
} from './SessionLifecycleContract.js';
import { createTransportBoundary, getTransportContract } from './TransportContract.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export const HANDSHAKE_MESSAGE_TYPES = Object.freeze({
  HELLO: 'session.handshake.hello',
  ACCEPT: 'session.handshake.accept',
  CONFIRM: 'session.handshake.confirm',
  BYE: 'session.handshake.bye',
});

function createHandshakePacket({
  type,
  sessionId,
  from,
  to,
  payload = {},
}) {
  return {
    type,
    sessionId,
    from,
    to,
    payload: clone(payload),
    createdAt: Date.now(),
  };
}

export function getHandshakeContract() {
  return {
    messages: { ...HANDSHAKE_MESSAGE_TYPES },
    flow: [
      HANDSHAKE_MESSAGE_TYPES.HELLO,
      HANDSHAKE_MESSAGE_TYPES.ACCEPT,
      HANDSHAKE_MESSAGE_TYPES.CONFIRM,
    ],
    transport: getTransportContract(),
    sessionLifecycle: getSessionLifecycleContract(),
  };
}

export default class HandshakeSimulator {
  constructor({
    sessionId = 'session',
    hostId = 'host',
    clientId = 'client',
    hostTransport = null,
    clientTransport = null,
  } = {}) {
    const transports = hostTransport && clientTransport
      ? [hostTransport, clientTransport]
      : LoopbackTransport.createLinkedPair(hostId, clientId);

    this.sessionId = sessionId;
    this.hostId = hostId;
    this.clientId = clientId;
    this.hostTransport = createTransportBoundary(transports[0], { name: 'hostTransport' });
    this.clientTransport = createTransportBoundary(transports[1], { name: 'clientTransport' });
    this.hostSession = createSessionLifecycle({
      sessionId,
      peerId: hostId,
      role: 'host',
    });
    this.clientSession = createSessionLifecycle({
      sessionId,
      peerId: clientId,
      role: 'client',
    });
    this.handshakeToken = null;
    this.handshakeComplete = false;
    this.eventLog = [];
  }

  log(event, details = {}) {
    this.eventLog.push({
      event,
      details: clone(details),
      step: this.eventLog.length,
    });
  }

  begin({ token = `${this.sessionId}:${this.clientId}` } = {}) {
    this.handshakeToken = token;
    this.hostSession.transition(SESSION_STATES.CONNECTING, 'host-connect');
    this.clientSession.transition(SESSION_STATES.CONNECTING, 'client-connect');
    this.hostSession.transition(SESSION_STATES.HANDSHAKING, 'host-ready-for-hello');
    this.clientSession.transition(SESSION_STATES.HANDSHAKING, 'client-sending-hello');

    const accepted = this.clientTransport.send(createHandshakePacket({
      type: HANDSHAKE_MESSAGE_TYPES.HELLO,
      sessionId: this.sessionId,
      from: this.clientId,
      to: this.hostId,
      payload: { token: this.handshakeToken },
    }));

    if (!accepted) {
      this.hostSession.transition(SESSION_STATES.FAILED, 'hello-send-failed');
      this.clientSession.transition(SESSION_STATES.FAILED, 'hello-send-failed');
      this.log('handshake.failed', { reason: 'hello-send-failed' });
      return false;
    }

    this.log('handshake.begin', {
      sessionId: this.sessionId,
      hostId: this.hostId,
      clientId: this.clientId,
      token: this.handshakeToken,
    });
    return true;
  }

  processHostInbox() {
    const packets = this.hostTransport.drainInbox();
    packets.forEach((packet) => {
      if (packet.type === HANDSHAKE_MESSAGE_TYPES.HELLO) {
        this.log('handshake.hello.received', { from: packet.from });
        this.hostTransport.send(createHandshakePacket({
          type: HANDSHAKE_MESSAGE_TYPES.ACCEPT,
          sessionId: this.sessionId,
          from: this.hostId,
          to: this.clientId,
          payload: { acceptedToken: packet.payload?.token ?? null },
        }));
      } else if (packet.type === HANDSHAKE_MESSAGE_TYPES.CONFIRM) {
        this.hostSession.transition(SESSION_STATES.ACTIVE, 'client-confirmed');
        this.handshakeComplete = this.clientSession.getState() === SESSION_STATES.ACTIVE
          && this.hostSession.getState() === SESSION_STATES.ACTIVE;
        this.log('handshake.confirm.received', { from: packet.from });
      } else if (packet.type === HANDSHAKE_MESSAGE_TYPES.BYE) {
        this.hostSession.transition(SESSION_STATES.DISCONNECTED, 'client-disconnect');
        this.log('session.disconnected.host', { reason: packet.payload?.reason ?? 'remote' });
      }
    });
    return packets.length;
  }

  processClientInbox() {
    const packets = this.clientTransport.drainInbox();
    packets.forEach((packet) => {
      if (packet.type === HANDSHAKE_MESSAGE_TYPES.ACCEPT) {
        this.log('handshake.accept.received', { from: packet.from });
        this.clientSession.transition(SESSION_STATES.ACTIVE, 'host-accepted');
        this.clientTransport.send(createHandshakePacket({
          type: HANDSHAKE_MESSAGE_TYPES.CONFIRM,
          sessionId: this.sessionId,
          from: this.clientId,
          to: this.hostId,
          payload: { token: packet.payload?.acceptedToken ?? null },
        }));
      } else if (packet.type === HANDSHAKE_MESSAGE_TYPES.BYE) {
        this.clientSession.transition(SESSION_STATES.DISCONNECTED, 'host-disconnect');
        this.log('session.disconnected.client', { reason: packet.payload?.reason ?? 'remote' });
      }
    });
    return packets.length;
  }

  update({ maxPumpIterations = 8 } = {}) {
    let iteration = 0;
    while (iteration < maxPumpIterations) {
      const hostProcessed = this.processHostInbox();
      const clientProcessed = this.processClientInbox();
      if (!hostProcessed && !clientProcessed) {
        break;
      }
      iteration += 1;
    }

    return this.getState();
  }

  disconnect(reason = 'manual') {
    const hostState = this.hostSession.getState();
    const clientState = this.clientSession.getState();
    if (hostState === SESSION_STATES.ACTIVE) {
      this.hostSession.transition(SESSION_STATES.DISCONNECTING, 'host-disconnecting');
      this.hostTransport.send(createHandshakePacket({
        type: HANDSHAKE_MESSAGE_TYPES.BYE,
        sessionId: this.sessionId,
        from: this.hostId,
        to: this.clientId,
        payload: { reason },
      }));
      this.hostSession.transition(SESSION_STATES.DISCONNECTED, reason);
    }

    if (clientState === SESSION_STATES.ACTIVE) {
      this.clientSession.transition(SESSION_STATES.DISCONNECTING, 'client-disconnecting');
      this.clientSession.transition(SESSION_STATES.DISCONNECTED, reason);
    }

    this.hostTransport.disconnect();
    this.clientTransport.disconnect();
    this.handshakeComplete = false;
    this.log('session.disconnect', { reason });
    this.update();
    return this.getState();
  }

  getState() {
    return {
      sessionId: this.sessionId,
      host: this.hostSession.getSnapshot(),
      client: this.clientSession.getSnapshot(),
      handshakeComplete: this.handshakeComplete,
      transportConnected: {
        host: this.hostTransport.isConnected(),
        client: this.clientTransport.isConnected(),
      },
      events: this.eventLog.map((entry) => ({ ...entry })),
    };
  }
}

