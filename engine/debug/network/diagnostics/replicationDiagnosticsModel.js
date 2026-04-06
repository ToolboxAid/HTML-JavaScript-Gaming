/*
Toolbox Aid
David Quesenberry
04/06/2026
replicationDiagnosticsModel.js
*/

import { asArray, asNumber, asObject } from "../shared/networkDebugUtils.js";

export function createReplicationDiagnosticsModel(snapshot = {}) {
  const source = asObject(snapshot);
  const replication = asObject(source.replication);
  const clientSnapshots = asArray(replication.clientSnapshots);

  const highestBacklog = asNumber(replication.highestBacklog, 0);
  const divergenceWarnings = asNumber(replication.divergenceWarnings, 0);
  const hostTick = asNumber(replication.hostTick, 0);

  return {
    hostTick,
    highestBacklog,
    divergenceWarnings,
    hasPressure: highestBacklog > 5 || divergenceWarnings > 0,
    clients: clientSnapshots.map((client) => {
      const row = asObject(client);
      return {
        peerId: String(row.peerId || "client"),
        tick: asNumber(row.replicationTick, 0),
        pendingPackets: asNumber(row.pendingPackets, 0),
        backlog: asNumber(row.backlog, 0),
        tickDeltaFromHost: asNumber(row.tickDeltaFromHost, 0)
      };
    })
  };
}
