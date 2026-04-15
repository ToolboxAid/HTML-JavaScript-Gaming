/*
Toolbox Aid
David Quesenberry
04/15/2026
RealNetworkLaunchScene.js
*/
import { Scene } from "/src/engine/scene/index.js";
import { drawFrame, drawPanel } from "/src/engine/debug/index.js";
import { Theme, ThemeTokens } from "/src/engine/theme/index.js";
import { clamp } from "/src/engine/utils/index.js";

const theme = new Theme(ThemeTokens);
const WORLD_BOUNDS = Object.freeze({
  minX: 120,
  maxX: 820,
  minY: 170,
  maxY: 450
});

function toFinite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function toServerUrl(rawUrl) {
  const fallback = "ws://127.0.0.1:4320/ws";
  const value = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!value) {
    return fallback;
  }
  try {
    const base = globalThis.location?.origin || "http://127.0.0.1:4320";
    const url = new URL(value, base);
    if (url.protocol === "http:") {
      url.protocol = "ws:";
    }
    if (url.protocol === "https:") {
      url.protocol = "wss:";
    }
    return url.toString();
  } catch {
    return fallback;
  }
}

export default class RealNetworkLaunchScene extends Scene {
  constructor(options = {}) {
    super();
    this.sessionId = typeof options.sessionId === "string" && options.sessionId.trim()
      ? options.sessionId.trim()
      : "sample-1319";
    this.serverUrl = toServerUrl(options.serverUrl);
    this.playerId = "";
    this.connectionState = "disconnected";
    this.connectedPlayers = 0;
    this.players = [];
    this.authoritativeTick = 0;
    this.rxBytes = 0;
    this.txBytes = 0;
    this.rttMs = 0;
    this.nextInputSequence = 0;
    this.lastSnapshotAt = "n/a";
    this.lastMessage = "Not connected.";
    this.inputAccumulator = 0;
    this.inputIntervalSeconds = 0.05;
    this.reconnectTimer = null;
    this.socket = null;
    this.persistentPlayerId = options.playerId || "";

    if (options.autoConnect !== false) {
      this.connect();
    }
  }

  setServerUrl(nextUrl) {
    this.serverUrl = toServerUrl(nextUrl);
  }

  buildSocketUrl() {
    const url = new URL(this.serverUrl);
    url.searchParams.set("sessionId", this.sessionId);
    if (this.persistentPlayerId) {
      url.searchParams.set("playerId", this.persistentPlayerId);
    }
    return url.toString();
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.connectionState = "connecting";
    this.lastMessage = "Connecting to real server endpoint...";

    const socket = new WebSocket(this.buildSocketUrl());
    this.socket = socket;

    socket.addEventListener("open", () => {
      this.connectionState = "connected";
      this.lastMessage = "Connected. Awaiting authoritative snapshots.";
    });

    socket.addEventListener("message", (event) => {
      const payloadText = typeof event.data === "string" ? event.data : "";
      this.rxBytes += payloadText.length;
      let payload;
      try {
        payload = JSON.parse(payloadText);
      } catch {
        this.lastMessage = "Received non-JSON payload.";
        return;
      }

      if (payload.type === "welcome") {
        this.playerId = String(payload.playerId || this.playerId || "");
        this.persistentPlayerId = this.playerId || this.persistentPlayerId;
        this.authoritativeTick = toFinite(payload.authoritativeTick, this.authoritativeTick);
        this.lastMessage = `Session ${payload.sessionId} accepted for ${this.playerId || "unknown-player"}.`;
        return;
      }

      if (payload.type === "snapshot") {
        this.authoritativeTick = toFinite(payload.authoritativeTick, this.authoritativeTick);
        this.players = Array.isArray(payload.players) ? payload.players.slice() : [];
        this.connectedPlayers = toFinite(payload.connectedPlayers, this.players.filter((player) => player.connected).length);
        this.lastSnapshotAt = new Date().toISOString();
        return;
      }

      if (payload.type === "ping") {
        this.send({
          type: "pong",
          pingId: payload.pingId,
          sentAtMs: payload.sentAtMs
        });
        return;
      }

      if (payload.type === "rtt") {
        this.rttMs = toFinite(payload.rttMs, this.rttMs);
      }
    });

    socket.addEventListener("close", () => {
      this.connectionState = "disconnected";
      this.lastMessage = "Disconnected from server.";
    });

    socket.addEventListener("error", () => {
      this.connectionState = "failed";
      this.lastMessage = "Connection error. Verify server endpoint.";
    });
  }

  disconnect(reason = "manual") {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close(1000, reason);
      this.socket = null;
    }
    this.connectionState = "disconnected";
  }

  reconnect() {
    this.disconnect("reconnect");
    this.connectionState = "reconnecting";
    this.lastMessage = "Reconnect scheduled...";
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 150);
  }

  send(payload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    const text = JSON.stringify(payload);
    this.socket.send(text);
    this.txBytes += text.length;
    return true;
  }

  sendInput(dx, dy) {
    return this.send({
      type: "input",
      sequence: this.nextInputSequence++,
      inputType: "move",
      dx: clamp(toFinite(dx, 0), -6, 6),
      dy: clamp(toFinite(dy, 0), -6, 6),
      sentAtMs: Date.now()
    });
  }

  getLocalPlayer() {
    return this.players.find((player) => player.playerId === this.playerId) || null;
  }

  update(dtSeconds, engine) {
    const safeDt = Math.max(0, toFinite(dtSeconds, 1 / 60));
    const input = engine?.input || null;
    if (!input || this.connectionState !== "connected") {
      this.inputAccumulator = 0;
      return;
    }

    let dx = 0;
    let dy = 0;
    if (input.isDown?.("ArrowLeft") || input.isDown?.("KeyA")) dx -= 1;
    if (input.isDown?.("ArrowRight") || input.isDown?.("KeyD")) dx += 1;
    if (input.isDown?.("ArrowUp") || input.isDown?.("KeyW")) dy -= 1;
    if (input.isDown?.("ArrowDown") || input.isDown?.("KeyS")) dy += 1;

    if (dx === 0 && dy === 0) {
      this.inputAccumulator = 0;
      return;
    }

    this.inputAccumulator += safeDt;
    if (this.inputAccumulator >= this.inputIntervalSeconds) {
      this.inputAccumulator = 0;
      this.sendInput(dx * 3, dy * 3);
    }
  }

  render(renderer) {
    const localPlayer = this.getLocalPlayer();
    drawFrame(renderer, theme, [
      "Engine Sample 1319",
      "Real-network launch sample using live authoritative server snapshots over WebSocket.",
      this.lastMessage
    ]);

    renderer.drawRect(100, 150, 760, 320, "#0f172a");
    renderer.strokeRect(100, 150, 760, 320, "#334155", 1);

    this.players.forEach((player) => {
      const x = clamp(toFinite(player.x, 0), WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX);
      const y = clamp(toFinite(player.y, 0), WORLD_BOUNDS.minY, WORLD_BOUNDS.maxY);
      const isLocal = player.playerId === this.playerId;
      renderer.drawRect(x, y, 24, 24, isLocal ? "#38bdf8" : "#22c55e");
      renderer.drawText(String(player.playerId || "player"), x + 12, y - 8, {
        color: "#e2e8f0",
        font: "12px monospace",
        textAlign: "center"
      });
    });

    drawPanel(renderer, 620, 30, 280, 210, "Real Session", [
      `state=${this.connectionState}`,
      `sessionId=${this.sessionId}`,
      `playerId=${this.playerId || "pending"}`,
      `connectedPlayers=${this.connectedPlayers}`,
      `authoritativeTick=${this.authoritativeTick}`,
      `rttMs=${Math.round(this.rttMs)}`,
      `rxBytes=${this.rxBytes}`,
      `txBytes=${this.txBytes}`,
      `snapshotAt=${this.lastSnapshotAt}`
    ]);

    drawPanel(renderer, 620, 250, 280, 220, "Players", (this.players.length > 0
      ? this.players.slice(0, 8).map((player) => {
        const marker = player.playerId === this.playerId ? "*" : "-";
        return `${marker} ${player.playerId} ${player.status} x=${Math.round(toFinite(player.x, 0))} y=${Math.round(toFinite(player.y, 0))}`;
      })
      : ["No players connected yet."]));

    if (localPlayer) {
      renderer.drawText("You", clamp(toFinite(localPlayer.x, 0), 100, 860), clamp(toFinite(localPlayer.y, 0), 150, 470) + 38, {
        color: "#f8fafc",
        font: "bold 13px monospace",
        textAlign: "center"
      });
    }
  }
}
