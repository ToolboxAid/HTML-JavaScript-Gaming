/*
Toolbox Aid
David Quesenberry
03/22/2026
StateSyncReplicationScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { NetworkingLayer, StateReplication } from '../../../engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class StateSyncReplicationScene extends Scene {
  constructor() {
    super();
    [this.host, this.client] = NetworkingLayer.createLinkedPair({ sessionId: 'sample148' });
    this.replication = new StateReplication();
    this.tickCount = 0;
    this.hostEntities = [{ id: 'entity-1', x: 120, y: 280 }];
    this.clientEntities = [];
  }

  update(dtSeconds) {
    this.tickCount += 1;
    this.hostEntities[0].x = 120 + Math.sin(this.tickCount * 0.08) * 180;
    const snapshot = this.replication.createSnapshot(this.hostEntities, { tick: this.tickCount });
    this.host.send('snapshot', { text: this.replication.encodeSnapshot(snapshot) });
    this.host.update(dtSeconds);
    this.client.update(dtSeconds);

    this.client.consumeReceived().forEach((packet) => {
      const decoded = this.replication.decodeSnapshot(packet.payload.text);
      this.clientEntities = this.replication.applySnapshot(decoded, this.clientEntities);
    });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 1302',
      'Authoritative state is packed into snapshots and replicated to the remote side.',
      'Left is authority, right is replicated client view.',
    ]);
    renderer.drawRect(80, 220, 360, 180, '#0f172a');
    renderer.drawRect(520, 220, 360, 180, '#111827');
    renderer.drawRect(this.hostEntities[0].x, this.hostEntities[0].y, 34, 34, '#38bdf8');
    if (this.clientEntities[0]) {
      renderer.drawRect(520 + (this.clientEntities[0].x - 80), this.clientEntities[0].y, 34, 34, '#34d399');
    }
    drawPanel(renderer, 620, 40, 270, 160, 'Replication', [
      `Tick: ${this.tickCount}`,
      `Host X: ${Math.round(this.hostEntities[0].x)}`,
      `Client X: ${Math.round(this.clientEntities[0]?.x || 0)}`,
      `Entities: ${this.clientEntities.length}`,
    ]);
  }
}
