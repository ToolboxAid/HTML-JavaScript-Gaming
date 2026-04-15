/*
Toolbox Aid
David Quesenberry
04/15/2026
realNetworkServer.mjs
*/
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";

import {
  AuthoritativeServerRuntime
} from "../../../../src/engine/network/index.js";
import {
  DASHBOARD_PATH,
  METRICS_PATH,
  HEALTH_PATH,
  createDashboardPage
} from "./realNetworkDashboard.mjs";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4320;
const DEFAULT_REFRESH_MS = 1000;
const DEFAULT_ADMIN_KEY = "network-1319-admin";
const DEFAULT_SESSION_ID = "sample-1319-live";
const WS_PATH = "/ws";

function asPositiveInteger(value, fallback) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    return fallback;
  }
  return number;
}

function asFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sanitizePlayerId(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return "";
  }
  return raw.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 32);
}

function toJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function toHtml(response, statusCode, html) {
  response.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(html);
}

function nowMs() {
  return Date.now();
}

function isLoopbackAddress(address) {
  const value = typeof address === "string" ? address.trim() : "";
  if (!value) {
    return false;
  }
  return value === "127.0.0.1"
    || value === "::1"
    || value === "::ffff:127.0.0.1";
}

function isConnectedSocket(ws) {
  return ws && ws.readyState === WebSocket.OPEN;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createRealNetworkSampleServer(options = {}) {
  const config = {
    host: String(options.host || process.env.NETWORK_SAMPLE_1319_HOST || DEFAULT_HOST),
    port: asPositiveInteger(options.port || process.env.NETWORK_SAMPLE_1319_PORT, DEFAULT_PORT),
    sessionId: String(options.sessionId || process.env.NETWORK_SAMPLE_1319_SESSION_ID || DEFAULT_SESSION_ID),
    refreshMs: asPositiveInteger(options.refreshMs || process.env.NETWORK_SAMPLE_1319_DASHBOARD_REFRESH_MS, DEFAULT_REFRESH_MS),
    adminKey: String(options.adminKey || process.env.NETWORK_SAMPLE_1319_ADMIN_KEY || DEFAULT_ADMIN_KEY),
    allowLoopbackWithoutKey: (options.allowLoopbackWithoutKey !== false)
      || String(process.env.NETWORK_SAMPLE_1319_ALLOW_LOCALHOST_WITHOUT_KEY || "").trim() === "1",
    allowRemoteWithKey: (options.allowRemoteWithKey === true)
      || String(process.env.NETWORK_SAMPLE_1319_ALLOW_REMOTE_WITH_KEY || "").trim() === "1",
    tickRateHz: asPositiveInteger(options.tickRateHz || process.env.NETWORK_SAMPLE_1319_TICK_RATE_HZ, 20)
  };

  const runtime = new AuthoritativeServerRuntime({
    sessionId: config.sessionId,
    tickRateHz: config.tickRateHz
  });
  const players = new Map();
  const sockets = new Map();
  const socketByPlayerId = new Map();
  const wss = new WebSocketServer({ noServer: true });
  const httpServer = http.createServer((request, response) => {
    const hostHeader = request.headers.host || `${config.host}:${config.port}`;
    const requestUrl = new URL(request.url || "/", `http://${hostHeader}`);
    if (request.method !== "GET") {
      toJson(response, 405, {
        status: "failed",
        code: "METHOD_NOT_ALLOWED"
      });
      return;
    }

    if (requestUrl.pathname === HEALTH_PATH) {
      toJson(response, 200, {
        status: "ready",
        code: "NETWORK_SAMPLE_1319_SERVER_HEALTHY",
        runtimePhase: runtime.getSnapshot().runtimePhase
      });
      return;
    }

    const access = checkAdminAccess({
      requestUrl,
      request,
      adminKey: config.adminKey,
      allowLoopbackWithoutKey: config.allowLoopbackWithoutKey,
      allowRemoteWithKey: config.allowRemoteWithKey
    });
    if (!access.ok) {
      toJson(response, 403, {
        status: "failed",
        code: access.code,
        message: access.message
      });
      return;
    }

    if (requestUrl.pathname === METRICS_PATH) {
      toJson(response, 200, buildMetricsSnapshot());
      return;
    }

    if (requestUrl.pathname === DASHBOARD_PATH) {
      toHtml(response, 200, createDashboardPage({
        metricsPath: METRICS_PATH,
        refreshMs: config.refreshMs
      }));
      return;
    }

    toJson(response, 404, {
      status: "failed",
      code: "NOT_FOUND",
      routes: [HEALTH_PATH, METRICS_PATH, DASHBOARD_PATH, WS_PATH]
    });
  });

  let tickTimer = null;
  let pingTimer = null;
  let nextPlayerOrdinal = 1;
  let nextConnectionOrdinal = 1;

  function checkAdminAccess({
    requestUrl,
    request,
    adminKey,
    allowLoopbackWithoutKey,
    allowRemoteWithKey
  }) {
    const loopback = isLoopbackAddress(request.socket?.remoteAddress);
    const headerKey = String(request.headers["x-debug-admin-key"] || "").trim();
    const queryKey = String(requestUrl.searchParams.get("key") || "").trim();
    const providedKey = headerKey || queryKey;
    const validKey = providedKey && providedKey === adminKey;

    if (loopback && allowLoopbackWithoutKey === true) {
      return { ok: true };
    }

    if (validKey && (loopback || allowRemoteWithKey === true)) {
      return { ok: true };
    }

    if (!loopback && allowRemoteWithKey !== true) {
      return {
        ok: false,
        code: "REMOTE_BLOCKED",
        message: "Remote dashboard access requires explicit allow + key."
      };
    }

    return {
      ok: false,
      code: "ADMIN_KEY_REQUIRED",
      message: "Provide a valid dashboard key via ?key=... or x-debug-admin-key."
    };
  }

  function choosePlayerId(requestedPlayerId = "") {
    const sanitized = sanitizePlayerId(requestedPlayerId);
    if (!sanitized) {
      return `player-${nextPlayerOrdinal++}`;
    }
    const existingSocket = socketByPlayerId.get(sanitized);
    if (!existingSocket || !isConnectedSocket(existingSocket)) {
      return sanitized;
    }
    return `${sanitized}-${nextPlayerOrdinal++}`;
  }

  function ensurePlayerState(playerId, sessionId) {
    const existing = players.get(playerId);
    if (existing) {
      return existing;
    }
    const startX = 150 + ((players.size % 8) * 80);
    const startY = 200 + (Math.floor(players.size / 8) * 70);
    const created = {
      playerId,
      sessionId,
      status: "connected",
      connected: true,
      connectionId: "",
      connectedAtMs: nowMs(),
      disconnectedAtMs: null,
      lastSeenAtMs: nowMs(),
      lastInputSequence: -1,
      rttMs: 0,
      rxBytes: 0,
      txBytes: 0,
      x: clamp(startX, 120, 820),
      y: clamp(startY, 150, 450),
      authoritativeTick: 0
    };
    players.set(playerId, created);
    return created;
  }

  function serializePlayer(state) {
    return {
      playerId: state.playerId,
      sessionId: state.sessionId,
      status: state.status,
      connected: state.connected,
      rttMs: asFiniteNumber(state.rttMs, 0),
      rxBytes: asFiniteNumber(state.rxBytes, 0),
      txBytes: asFiniteNumber(state.txBytes, 0),
      x: asFiniteNumber(state.x, 0),
      y: asFiniteNumber(state.y, 0),
      authoritativeTick: asFiniteNumber(state.authoritativeTick, 0),
      lastInputSequence: asFiniteNumber(state.lastInputSequence, -1)
    };
  }

  function getConnectedPlayers() {
    return [...players.values()].filter((player) => player.connected === true);
  }

  function computeLatencySummary(connectedPlayers) {
    const values = connectedPlayers.map((player) => asFiniteNumber(player.rttMs, 0));
    if (values.length === 0) {
      return { averageMs: 0, minMs: 0, maxMs: 0 };
    }
    const total = values.reduce((sum, value) => sum + value, 0);
    return {
      averageMs: Number((total / values.length).toFixed(2)),
      minMs: Math.min(...values),
      maxMs: Math.max(...values)
    };
  }

  function buildMetricsSnapshot() {
    const connectedPlayers = getConnectedPlayers();
    const activePlayers = connectedPlayers.length;
    const sessionCount = new Set(connectedPlayers.map((player) => player.sessionId)).size;
    const rxBytesTotal = [...players.values()].reduce((sum, player) => sum + asFiniteNumber(player.rxBytes, 0), 0);
    const txBytesTotal = [...players.values()].reduce((sum, player) => sum + asFiniteNumber(player.txBytes, 0), 0);

    return {
      timestamp: new Date().toISOString(),
      source: "network-sample-1319-real-runtime",
      summary: {
        activePlayers,
        sessionCount,
        connectionCount: sockets.size,
        connectionState: activePlayers > 0 ? "connected" : "idle",
        latencyMs: computeLatencySummary(connectedPlayers),
        rxBytesTotal,
        txBytesTotal,
        health: runtime.getSnapshot().runtimePhase === "running" ? "healthy" : "degraded"
      },
      players: [...players.values()]
        .map((player) => serializePlayer(player))
        .sort((left, right) => left.playerId.localeCompare(right.playerId))
    };
  }

  function sendToSocket(ws, payload) {
    if (!isConnectedSocket(ws)) {
      return false;
    }
    const text = JSON.stringify(payload);
    ws.send(text);
    const meta = sockets.get(ws);
    if (meta) {
      const player = players.get(meta.playerId);
      if (player) {
        player.txBytes += Buffer.byteLength(text);
      }
    }
    return true;
  }

  function broadcast(payload) {
    sockets.forEach((_meta, ws) => {
      sendToSocket(ws, payload);
    });
  }

  function broadcastSnapshot() {
    const snapshot = runtime.getSnapshot();
    const payload = {
      type: "snapshot",
      sessionId: config.sessionId,
      authoritativeTick: snapshot.authoritativeTick,
      connectedPlayers: getConnectedPlayers().length,
      players: [...players.values()].map((player) => serializePlayer(player)),
      serverTimeMs: nowMs()
    };
    broadcast(payload);
  }

  function applyAcceptedInput(envelope) {
    const player = players.get(envelope.clientId);
    if (!player) {
      return;
    }
    const dx = clamp(asFiniteNumber(envelope.payload?.dx, 0), -8, 8);
    const dy = clamp(asFiniteNumber(envelope.payload?.dy, 0), -8, 8);
    player.x = clamp(player.x + dx, 120, 820);
    player.y = clamp(player.y + dy, 150, 450);
    player.lastInputSequence = envelope.sequence;
    player.authoritativeTick = envelope.acceptedAtTick;
    player.lastSeenAtMs = nowMs();
  }

  function processClientMessage(ws, text) {
    const meta = sockets.get(ws);
    if (!meta) {
      return;
    }
    const player = players.get(meta.playerId);
    if (!player) {
      return;
    }

    player.rxBytes += Buffer.byteLength(text);
    player.lastSeenAtMs = nowMs();

    let message;
    try {
      message = JSON.parse(text);
    } catch {
      return;
    }

    if (message.type === "pong") {
      if (meta.lastPingId && message.pingId === meta.lastPingId) {
        player.rttMs = Math.max(0, nowMs() - asFiniteNumber(meta.lastPingSentAtMs, nowMs()));
      }
      return;
    }

    if (message.type !== "input") {
      return;
    }

    runtime.ingestClientInput({
      sessionId: config.sessionId,
      clientId: player.playerId,
      sequence: asPositiveInteger(message.sequence, 0) - 1 >= 0 ? Number(message.sequence) : 0,
      inputType: "move",
      payload: {
        dx: clamp(asFiniteNumber(message.dx, 0), -8, 8),
        dy: clamp(asFiniteNumber(message.dy, 0), -8, 8)
      },
      sentAtMs: asFiniteNumber(message.sentAtMs, nowMs())
    });
  }

  function runAuthoritativeTick() {
    runtime.step(1 / config.tickRateHz);
    const drained = runtime.drainAcceptedInputs();
    drained.forEach((envelope) => applyAcceptedInput(envelope));
    broadcastSnapshot();
  }

  function runPingTick() {
    const issuedAt = nowMs();
    sockets.forEach((meta, ws) => {
      if (!isConnectedSocket(ws)) {
        return;
      }
      const pingId = `${meta.playerId}:${issuedAt}`;
      meta.lastPingId = pingId;
      meta.lastPingSentAtMs = issuedAt;
      sendToSocket(ws, {
        type: "ping",
        pingId,
        sentAtMs: issuedAt
      });
    });
  }

  function onSocketConnection(ws, requestUrl) {
    const requestedPlayerId = requestUrl.searchParams.get("playerId") || "";
    const requestedSessionId = requestUrl.searchParams.get("sessionId") || config.sessionId;
    const playerId = choosePlayerId(requestedPlayerId);
    const sessionId = requestedSessionId || config.sessionId;
    const connectionId = `conn-${nextConnectionOrdinal++}`;
    const player = ensurePlayerState(playerId, sessionId);
    player.connected = true;
    player.status = "connected";
    player.connectionId = connectionId;
    player.connectedAtMs = nowMs();
    player.disconnectedAtMs = null;
    player.lastSeenAtMs = nowMs();

    const meta = {
      playerId,
      sessionId,
      connectionId,
      lastPingId: "",
      lastPingSentAtMs: 0
    };
    sockets.set(ws, meta);
    socketByPlayerId.set(playerId, ws);

    sendToSocket(ws, {
      type: "welcome",
      sessionId,
      playerId,
      connectionId,
      authoritativeTick: runtime.getSnapshot().authoritativeTick,
      connectedPlayers: getConnectedPlayers().length,
      serverTimeMs: nowMs()
    });

    broadcastSnapshot();

    ws.on("message", (data) => {
      const text = typeof data === "string" ? data : data.toString("utf8");
      processClientMessage(ws, text);
    });

    ws.on("close", () => {
      const connectionMeta = sockets.get(ws);
      sockets.delete(ws);
      if (!connectionMeta) {
        return;
      }
      const connectedPlayer = players.get(connectionMeta.playerId);
      if (connectedPlayer) {
        connectedPlayer.connected = false;
        connectedPlayer.status = "disconnected";
        connectedPlayer.disconnectedAtMs = nowMs();
        connectedPlayer.lastSeenAtMs = nowMs();
      }
      const currentSocket = socketByPlayerId.get(connectionMeta.playerId);
      if (currentSocket === ws) {
        socketByPlayerId.delete(connectionMeta.playerId);
      }
      broadcastSnapshot();
    });

    ws.on("error", () => {
      ws.close();
    });
  }

  httpServer.on("upgrade", (request, socket, head) => {
    const hostHeader = request.headers.host || `${config.host}:${config.port}`;
    const requestUrl = new URL(request.url || "/", `http://${hostHeader}`);
    if (requestUrl.pathname !== WS_PATH) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      onSocketConnection(ws, requestUrl);
    });
  });

  async function start() {
    runtime.start({ sessionId: config.sessionId, tickRateHz: config.tickRateHz });
    tickTimer = setInterval(runAuthoritativeTick, Math.round(1000 / config.tickRateHz));
    pingTimer = setInterval(runPingTick, 2000);

    await new Promise((resolve) => {
      httpServer.listen(config.port, config.host, resolve);
    });

    return {
      status: "ready",
      host: config.host,
      port: config.port,
      wsUrl: `ws://${config.host}:${config.port}${WS_PATH}`,
      dashboardUrl: `http://${config.host}:${config.port}${DASHBOARD_PATH}`,
      metricsUrl: `http://${config.host}:${config.port}${METRICS_PATH}`,
      healthUrl: `http://${config.host}:${config.port}${HEALTH_PATH}`
    };
  }

  async function stop() {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }

    sockets.forEach((_meta, ws) => {
      try {
        ws.close(1001, "server-stop");
      } catch {
        // no-op
      }
    });
    sockets.clear();
    socketByPlayerId.clear();

    await new Promise((resolve) => {
      wss.close(() => resolve());
    });
    await new Promise((resolve) => {
      httpServer.close(() => resolve());
    });

    runtime.stop("server-stop");
    return { status: "ready" };
  }

  return {
    config: clone(config),
    start,
    stop,
    getMetricsSnapshot: () => buildMetricsSnapshot()
  };
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const runtime = createRealNetworkSampleServer();
  runtime.start().then((result) => {
    console.log("NETWORK_SAMPLE_1319_SERVER_READY");
    console.log(`- WebSocket: ${result.wsUrl}`);
    console.log(`- Health: ${result.healthUrl}`);
    console.log(`- Dashboard: ${result.dashboardUrl}`);
    console.log(`- Metrics: ${result.metricsUrl}`);
    console.log("- Stop: Ctrl+C");
  });

  process.on("SIGINT", async () => {
    await runtime.stop();
    process.exit(0);
  });
}
