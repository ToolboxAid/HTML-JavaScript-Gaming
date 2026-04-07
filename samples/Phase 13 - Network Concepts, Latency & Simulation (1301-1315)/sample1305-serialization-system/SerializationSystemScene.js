/*
Toolbox Aid
David Quesenberry
03/22/2026
SerializationSystemScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { Serializer } from '../../../src/engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class SerializationSystemScene extends Scene {
  constructor() {
    super();
    this.serializer = new Serializer({ version: 3 });
    this.result = null;
    this.status = 'Serialize a payload and decode it again through the engine-owned serializer.';
  }

  roundTrip() {
    this.result = this.serializer.roundTrip('entity:update', {
      entityId: 'player-1',
      position: { x: 220, y: 140 },
      hp: 5,
    });
    this.status = 'Payload encoded and decoded successfully.';
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 1305',
      'Serialization centralizes stable payload encoding for network, replay, save, and config flows.',
      this.status,
    ]);
    renderer.drawRect(90, 220, 500, 200, '#0f172a');
    renderer.drawText(JSON.stringify(this.result || { type: 'entity:update', version: 3 }).slice(0, 64), 110, 270, {
      color: '#dbeafe',
      font: '15px monospace',
    });
    drawPanel(renderer, 630, 40, 250, 180, 'Serializer', [
      `Type: ${this.result?.type || 'n/a'}`,
      `Version: ${this.result?.version || 0}`,
      `Entity: ${this.result?.payload?.entityId || 'n/a'}`,
      `HP: ${this.result?.payload?.hp || 0}`,
    ]);
  }
}
