/*
Toolbox Aid
David Quesenberry
03/22/2026
NetworkingLayer.js
*/
import LoopbackTransport from './LoopbackTransport.js';
import NetworkConditionSimulator from './NetworkConditionSimulator.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default class NetworkingLayer {
  constructor({
    playerId = 'player',
    sessionId = 'session',
    timeoutSeconds = 5,
    transport = null,
    simulator = null,
  } = {}) {
    this.playerId = playerId;
    this.sessionId = sessionId;
    this.timeoutSeconds = timeoutSeconds;
    this.transport = transport;
    this.simulator = simulator || new NetworkConditionSimulator();
    this.connectionState = 'disconnected';
    this.received = [];
    this.lastReceivedAge = 0;
    this.lastMessageType = 'none';
    this.pingMs = 0;
    this.messageCounts = {
      sent: 0,
      received: 0,
      dropped: 0,
    };
  }

  attachTransport(transport) {
    this.transport = transport;
  }

  connect() {
    if (!this.transport) {
      throw new Error('NetworkingLayer requires a transport before connecting.');
    }

    this.connectionState = 'connected';
    this.lastReceivedAge = 0;
  }

  disconnect(reason = 'manual') {
    this.connectionState = 'disconnected';
    this.transport?.disconnect();
    this.lastMessageType = `disconnect:${reason}`;
  }

  send(type, payload = {}) {
    if (this.connectionState !== 'connected' || !this.transport) {
      return false;
    }

    const packet = {
      from: this.playerId,
      sessionId: this.sessionId,
      type,
      payload: clone(payload),
      createdAt: Date.now(),
    };

    const accepted = this.simulator.transmit(packet, (deliveredPacket) => {
      this.transport.send(deliveredPacket);
    });

    this.messageCounts.sent += 1;
    if (!accepted) {
      this.messageCounts.dropped += 1;
    }

    return accepted;
  }

  update(dtSeconds) {
    this.lastReceivedAge += dtSeconds;
    this.simulator.update(dtSeconds);

    if (this.connectionState === 'connected' && this.lastReceivedAge > this.timeoutSeconds) {
      this.connectionState = 'timed-out';
    }

    const packets = this.transport?.drainInbox() || [];
    packets.forEach((packet) => {
      this.received.push(packet);
      this.messageCounts.received += 1;
      this.lastReceivedAge = 0;
      this.lastMessageType = packet.type;
      this.pingMs = Math.round((packet.simulatedDelayMs ?? 0) * 2);
      this.connectionState = 'connected';
    });
  }

  consumeReceived() {
    const packets = [...this.received];
    this.received.length = 0;
    return packets;
  }

  getState() {
    return {
      playerId: this.playerId,
      sessionId: this.sessionId,
      connectionState: this.connectionState,
      pingMs: this.pingMs,
      lastMessageType: this.lastMessageType,
      pendingMessages: this.received.length,
      sent: this.messageCounts.sent,
      received: this.messageCounts.received,
      dropped: this.messageCounts.dropped,
      simulator: this.simulator.getStats(),
    };
  }

  static createLinkedPair({
    hostId = 'host',
    clientId = 'client',
    sessionId = 'session',
    hostSimulator = null,
    clientSimulator = null,
  } = {}) {
    const [hostTransport, clientTransport] = LoopbackTransport.createLinkedPair(hostId, clientId);
    const host = new NetworkingLayer({
      playerId: hostId,
      sessionId,
      transport: hostTransport,
      simulator: hostSimulator || new NetworkConditionSimulator(),
    });
    const client = new NetworkingLayer({
      playerId: clientId,
      sessionId,
      transport: clientTransport,
      simulator: clientSimulator || new NetworkConditionSimulator(),
    });
    host.connect();
    client.connect();
    return [host, client];
  }
}
