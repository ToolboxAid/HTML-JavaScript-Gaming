/*
Toolbox Aid
David Quesenberry
04/14/2026
NetworkDebugAndServerDashboardCloseout.test.mjs
*/
import assert from "node:assert/strict";
import {
  createLatencyDiagnosticsModel,
  createReplicationDiagnosticsModel,
  createLatencyRttPanel,
  createReplicationStatePanel,
  createNetworkObservabilityPanels,
  createNetworkHelpCommand,
  createNetworkReplicationCommand,
  createNetworkSampleCommand,
  createNetworkCommandPack,
  createReadOnlyNetworkProviders,
  createServerDashboardRegistry,
  createServerDashboardHost,
  createServerDashboardCommandPack,
  createNetworkPromotionRecommendation
} from "../../src/engine/debug/network/index.js";

function createSampleSnapshot() {
  return {
    assets: {
      network: {
        latency: {
          status: "degraded",
          rttMs: 92,
          jitterMs: 14
        },
        replication: {
          hostTick: 440,
          highestBacklog: 7,
          divergenceWarnings: 1,
          clientSnapshots: [
            {
              peerId: "client-a",
              replicationTick: 437,
              pendingPackets: 2,
              backlog: 7,
              tickDeltaFromHost: 3
            }
          ]
        }
      }
    }
  };
}

export async function run() {
  const snapshot = createSampleSnapshot();

  const latencyModel = createLatencyDiagnosticsModel(snapshot.assets.network);
  assert.equal(latencyModel.rttMs, 92);
  assert.equal(latencyModel.jitterMs, 14);
  assert.equal(latencyModel.healthy, false);

  const replicationModel = createReplicationDiagnosticsModel(snapshot.assets.network);
  assert.equal(replicationModel.hostTick, 440);
  assert.equal(replicationModel.highestBacklog, 7);
  assert.equal(replicationModel.divergenceWarnings, 1);
  assert.equal(replicationModel.clients.length, 1);

  const latencyPanel = createLatencyRttPanel();
  const renderedLatencyPanel = latencyPanel.render(latencyPanel, snapshot);
  assert.match(renderedLatencyPanel.lines.join("\n"), /rttMs=92/);
  assert.match(renderedLatencyPanel.lines.join("\n"), /jitterMs=14/);

  const replicationPanel = createReplicationStatePanel();
  const renderedReplicationPanel = replicationPanel.render(replicationPanel, snapshot);
  assert.match(renderedReplicationPanel.lines.join("\n"), /hostTick=440/);
  assert.match(renderedReplicationPanel.lines.join("\n"), /highestBacklog=7/);
  assert.match(renderedReplicationPanel.lines.join("\n"), /client-a/);

  const panelSet = createNetworkObservabilityPanels();
  assert.equal(panelSet.length, 2);
  assert.equal(panelSet[0].id, "network-latency-rtt");
  assert.equal(panelSet[1].id, "network-replication-state");

  const helpCommand = createNetworkHelpCommand();
  const helpResult = helpCommand.handler();
  assert.equal(helpCommand.name, "network.help");
  assert.match(helpResult.lines.join("\n"), /network\.replication/);
  assert.match(helpResult.lines.join("\n"), /network\.sample\.status/);

  const replicationCommand = createNetworkReplicationCommand();
  const replicationResult = replicationCommand.handler(snapshot);
  assert.equal(replicationCommand.name, "network.replication");
  assert.match(replicationResult.lines.join("\n"), /hostTick=440/);
  assert.match(replicationResult.lines.join("\n"), /hasPressure=true/);

  const sampleCommand = createNetworkSampleCommand({ sampleCommandId: "repro" });
  const sampleResult = sampleCommand.handler(snapshot);
  assert.equal(sampleCommand.name, "network.sample.repro");
  assert.match(sampleResult.lines.join("\n"), /sampleKey=network/);

  const commandPack = createNetworkCommandPack({
    commands: [helpCommand, replicationCommand, sampleCommand]
  });
  assert.equal(commandPack.commands.length, 3);

  const providers = createReadOnlyNetworkProviders([
    {
      providerId: "network.sample.provider",
      title: "Sample-backed Provider",
      sourcePath: "assets.network"
    }
  ]);
  assert.equal(providers.length, 1);
  assert.equal(providers[0].readOnly, true);
  assert.equal(providers[0].providerId, "network.sample.provider");

  const dashboardSnapshot = {
    timestampMs: 12345,
    connectionSessionCounts: {
      connections: 3,
      sessions: 2
    },
    latency: {
      averageMs: 23,
      maxMs: 37
    },
    traffic: {
      rxBytes: 2400,
      txBytes: 1800
    },
    players: [
      {
        playerId: "player-1",
        status: "connected",
        latencyMs: 22,
        rxBytes: 1000,
        txBytes: 800,
        sessionId: "session-a",
        connected: true
      },
      {
        playerId: "player-2",
        status: "connected",
        latencyMs: 24,
        rxBytes: 1400,
        txBytes: 1000,
        sessionId: "session-b",
        connected: true
      }
    ]
  };

  const dashboardRegistry = createServerDashboardRegistry();
  assert.equal(dashboardRegistry.listSections().length >= 6, true);

  const dashboardHost = createServerDashboardHost({
    snapshot: dashboardSnapshot,
    refreshMode: "manual"
  });
  const dashboardRun = dashboardHost.runOnce();
  assert.equal(dashboardRun.ok, true);
  assert.equal(dashboardRun.rendered.sections.length >= 6, true);
  assert.match(
    dashboardRun.rendered.sections.map((section) => section.sectionId).join(","),
    /network\.dashboard\.players/
  );
  assert.match(
    dashboardRun.rendered.sections.find((section) => section.sectionId === "network.dashboard.players").lines.join("\n"),
    /player-1/
  );

  const fastStatus = dashboardHost.setRefreshMode("fast");
  assert.equal(fastStatus.mode, "fast");
  assert.equal(fastStatus.refreshIntervalMs, 250);

  const dashboardCommandPack = createServerDashboardCommandPack({ host: dashboardHost });
  const dashboardHelp = dashboardCommandPack.commands.find((command) => command.name === "dashboard.help").handler();
  assert.match(dashboardHelp.lines.join("\n"), /dashboard\.snapshot/);
  const dashboardStatus = dashboardCommandPack.commands.find((command) => command.name === "dashboard.status").handler();
  assert.match(dashboardStatus.lines.join("\n"), /connections=3/);
  const dashboardSnapshotResult = dashboardCommandPack.commands.find((command) => command.name === "dashboard.snapshot").handler();
  assert.match(dashboardSnapshotResult.lines.join("\n"), /playerCount=2/);

  const debugDisabledHost = createServerDashboardHost({
    snapshot: dashboardSnapshot,
    refreshMode: "manual",
    debugOnly: true,
    isDebugEnabled: false
  });
  assert.equal(debugDisabledHost.start(), false);
  const deniedRun = debugDisabledHost.runOnce();
  assert.equal(deniedRun.ok, false);
  assert.equal(deniedRun.code, "SERVER_DASHBOARD_DEBUG_ONLY_DISABLED");
  assert.equal(debugDisabledHost.getStatus().debugAccessEnabled, false);

  const promotion = createNetworkPromotionRecommendation({
    sampleProviderValidation: true,
    samplePanelValidation: true,
    operatorCommandValidation: true,
    debugOnlyGatingValidation: true
  });
  assert.equal(promotion.readyForPromotion, true);
  assert.equal(promotion.recommendation, "promote");
}
