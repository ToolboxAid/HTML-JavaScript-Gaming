/*
Toolbox Aid
David Quesenberry
04/06/2026
FakeHostClientNetworkModel.js
*/
import FakeLoopbackNetworkModel from "../../1316/game/FakeLoopbackNetworkModel.js";
import { clamp } from "/src/engine/utils/math.js";
import { asPositiveNumber } from "../../../../src/shared/utils/numberUtils.js";

const MAX_TRACE_EVENTS = 120;

function toConnectionState(peers) {
  const source = Array.isArray(peers) ? peers : [];
  if (source.length === 0) {
    return "offline";
  }

  const connectedCount = source.filter((peer) => peer.connectionState === "connected").length;
  if (connectedCount === source.length) {
    return "healthy";
  }
  if (connectedCount === 0) {
    return "offline";
  }
  return "degraded";
}

export default class FakeHostClientNetworkModel {
  constructor(options = {}) {
    this.sessionId = typeof options.sessionId === "string" && options.sessionId.trim()
      ? options.sessionId.trim()
      : "network-sample-b-host-client";

    this.elapsedSeconds = 0;
    this.traceEvents = [];

    this.peerStates = this.createPeerStates();
    this.ownershipRows = [
      { entityId: "world-clock", ownerPeerId: "host-1", authority: "authoritative" },
      { entityId: "asteroid-field", ownerPeerId: "host-1", authority: "authoritative" },
      { entityId: "ship-alpha", ownerPeerId: "client-a", authority: "client-predicted" },
      { entityId: "ship-bravo", ownerPeerId: "client-b", authority: "client-predicted" },
      { entityId: "scoreboard", ownerPeerId: "host-1", authority: "authoritative" }
    ];

    this.pushTrace("SESSION_START", {
      sessionId: this.sessionId,
      peerCount: this.peerStates.length
    });
  }

  createPeerStates() {
    const descriptors = [
      {
        peerId: "host-1",
        role: "host",
        label: "Host",
        packetTxBytes: 148,
        packetRxBytes: 132
      },
      {
        peerId: "client-a",
        role: "client",
        label: "Client A",
        packetTxBytes: 102,
        packetRxBytes: 98
      },
      {
        peerId: "client-b",
        role: "client",
        label: "Client B",
        packetTxBytes: 106,
        packetRxBytes: 96
      }
    ];

    return descriptors.map((descriptor, index) => {
      const model = new FakeLoopbackNetworkModel({
        sessionId: `${this.sessionId}-${descriptor.peerId}`
      });
      const snapshot = model.getSnapshot();
      return {
        ...descriptor,
        index,
        model,
        snapshot,
        txBytes: 0,
        rxBytes: 0,
        lastSentPackets: Number(snapshot.connection?.sentPackets || 0),
        lastReceivedPackets: Number(snapshot.connection?.receivedPackets || 0),
        lastTraceTotal: Number(snapshot.trace?.totalEvents || 0)
      };
    });
  }

  pushTrace(type, details = {}) {
    this.traceEvents.push({
      timestampMs: Math.round(this.elapsedSeconds * 1000),
      type,
      details: { ...details }
    });

    if (this.traceEvents.length > MAX_TRACE_EVENTS) {
      const trimCount = this.traceEvents.length - MAX_TRACE_EVENTS;
      this.traceEvents.splice(0, trimCount);
    }
  }

  getPeerState(peerId) {
    return this.peerStates.find((peer) => peer.peerId === peerId) || null;
  }

  forcePeerDisconnect(peerId, reason = "operator") {
    const peer = this.getPeerState(peerId);
    if (!peer) {
      return false;
    }
    peer.model.forceDisconnect();
    this.pushTrace("PEER_DISCONNECT", { peerId, reason });
    return true;
  }

  forcePeerReconnect(peerId, reason = "operator") {
    const peer = this.getPeerState(peerId);
    if (!peer) {
      return false;
    }
    peer.model.forceReconnect();
    this.pushTrace("PEER_RECONNECT", { peerId, reason });
    return true;
  }

  togglePeerConnection(peerId) {
    const peer = this.getPeerState(peerId);
    if (!peer) {
      return false;
    }

    const phase = String(peer.snapshot?.connection?.phase || "connected");
    if (phase === "disconnected") {
      return this.forcePeerReconnect(peerId, "toggle-reconnect");
    }
    return this.forcePeerDisconnect(peerId, "toggle-disconnect");
  }

  injectPeerPacket(peerId, reason = "manual") {
    const peer = this.getPeerState(peerId);
    if (!peer) {
      return false;
    }
    peer.model.sendSyntheticPacket(reason);
    this.pushTrace("PEER_PACKET", { peerId, reason });
    return true;
  }

  applyDeterministicTransitions(peer) {
    const cycle = (Math.floor(this.elapsedSeconds * 2) + (peer.index * 7)) % 32;

    if (peer.role === "client") {
      if (cycle === 12 && peer.snapshot.connection?.phase === "connected") {
        peer.model.forceDisconnect();
      }
      if ((cycle === 15 || cycle === 16) && peer.snapshot.connection?.phase === "disconnected") {
        peer.model.forceReconnect();
      }
      return;
    }

    if (cycle === 24 && peer.snapshot.connection?.phase === "connected") {
      peer.model.forceDisconnect();
    }
    if ((cycle === 26 || cycle === 27) && peer.snapshot.connection?.phase === "disconnected") {
      peer.model.forceReconnect();
    }
  }

  shouldInjectPacket(peer) {
    const pulse = (Math.floor(this.elapsedSeconds * 5) + peer.index) % 4;
    return pulse === 0 || pulse === 2;
  }

  updatePeerBytes(peer) {
    const sentPackets = Number(peer.snapshot.connection?.sentPackets || 0);
    const receivedPackets = Number(peer.snapshot.connection?.receivedPackets || 0);

    const deltaSent = Math.max(0, sentPackets - peer.lastSentPackets);
    const deltaReceived = Math.max(0, receivedPackets - peer.lastReceivedPackets);

    peer.lastSentPackets = sentPackets;
    peer.lastReceivedPackets = receivedPackets;

    peer.txBytes += deltaSent * peer.packetTxBytes;
    peer.rxBytes += deltaReceived * peer.packetRxBytes;
  }

  updatePeerTrace(peer) {
    const totalEvents = Number(peer.snapshot.trace?.totalEvents || 0);
    if (totalEvents <= peer.lastTraceTotal) {
      return;
    }

    this.pushTrace("PEER_TRACE_EVENT", {
      peerId: peer.peerId,
      role: peer.role,
      traceTotal: totalEvents
    });

    peer.lastTraceTotal = totalEvents;
  }

  update(dtSeconds, options = {}) {
    const safeDt = asPositiveNumber(dtSeconds, 1 / 60);
    this.elapsedSeconds += safeDt;

    this.peerStates.forEach((peer) => {
      this.applyDeterministicTransitions(peer);

      const injectPacket = options.injectPeerId === peer.peerId
        ? true
        : this.shouldInjectPacket(peer);

      peer.model.update(safeDt, { injectPacket });
      peer.snapshot = peer.model.getSnapshot();

      this.updatePeerBytes(peer);
      this.updatePeerTrace(peer);
    });
  }

  buildPeerRow(peer) {
    const connection = peer.snapshot.connection || {};
    const latency = peer.snapshot.latency || {};
    const replication = peer.snapshot.replication || {};

    return {
      peerId: peer.peerId,
      role: peer.role,
      label: peer.label,
      sessionId: peer.snapshot.sessionId || `${this.sessionId}-${peer.peerId}`,
      connectionState: String(connection.phase || "unknown"),
      connected: Boolean(connection.connected),
      latencyMs: Number(latency.rttMs || 0),
      jitterMs: Number(latency.jitterMs || 0),
      txBytes: peer.txBytes,
      rxBytes: peer.rxBytes,
      pendingPackets: Number(replication.pendingPackets || 0),
      backlog: Number(replication.backlog || 0),
      replicationTick: Number(replication.tick || 0),
      ackedSequence: Number(replication.ackedSequence || 0)
    };
  }

  getSnapshot() {
    const peers = this.peerStates.map((peer) => this.buildPeerRow(peer));
    const host = peers.find((peer) => peer.role === "host") || null;
    const clients = peers.filter((peer) => peer.role === "client");

    const connectedPeers = peers.filter((peer) => peer.connected);
    const avgLatencyMs = connectedPeers.length > 0
      ? Number((connectedPeers.reduce((sum, peer) => sum + peer.latencyMs, 0) / connectedPeers.length).toFixed(2))
      : 0;
    const maxLatencyMs = connectedPeers.length > 0
      ? Math.max(...connectedPeers.map((peer) => peer.latencyMs))
      : 0;

    const hostTick = Number(host?.replicationTick || 0);
    const clientSnapshots = clients.map((client) => ({
      peerId: client.peerId,
      replicationTick: client.replicationTick,
      pendingPackets: client.pendingPackets,
      backlog: client.backlog,
      tickDeltaFromHost: clamp(hostTick - client.replicationTick, -9999, 9999)
    }));

    const divergenceWarnings = clientSnapshots.filter((client) => client.tickDeltaFromHost > 4).length;
    const highestBacklog = peers.reduce((maxValue, peer) => Math.max(maxValue, peer.backlog), 0);

    const summary = {
      peerCount: peers.length,
      playerCount: peers.length,
      sessionCount: 1,
      hostConnected: Boolean(host?.connected),
      connectedClients: clients.filter((client) => client.connected).length,
      connectionState: toConnectionState(peers),
      latencyMs: {
        averageMs: avgLatencyMs,
        minMs: connectedPeers.length > 0 ? Math.min(...connectedPeers.map((peer) => peer.latencyMs)) : 0,
        maxMs: maxLatencyMs
      },
      txBytesTotal: peers.reduce((sum, peer) => sum + peer.txBytes, 0),
      rxBytesTotal: peers.reduce((sum, peer) => sum + peer.rxBytes, 0)
    };

    return {
      sessionId: this.sessionId,
      summary,
      peers,
      host,
      clients,
      ownership: {
        authorityMode: "host-authoritative",
        rows: this.ownershipRows.slice()
      },
      replication: {
        hostTick,
        highestBacklog,
        divergenceWarnings,
        clientSnapshots
      },
      trace: {
        totalEvents: this.traceEvents.length,
        events: this.traceEvents.slice(-18)
      }
    };
  }
}
