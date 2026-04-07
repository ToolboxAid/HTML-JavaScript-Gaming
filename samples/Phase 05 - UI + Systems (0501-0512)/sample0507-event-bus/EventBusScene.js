/*
Toolbox Aid
David Quesenberry
03/22/2026
EventBusScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

class ScoreListener {
  constructor(bus) {
    this.score = 0;
    this.lastMessage = 'No events received yet.';
    this.unsubscribe = bus.on('orb_collected', (payload) => {
      this.score += payload.value;
      this.lastMessage = `HUD received orb_collected from ${payload.source}.`;
    });
  }
}

export default class EventBusScene extends Scene {
  constructor() {
    super();
    this.player = { x: 150, y: 280, width: 34, height: 34 };
    this.orb = { x: 640, y: 282, width: 28, height: 28, active: true };
    this.message = 'Move to the orb and press Space. The HUD listens through the event bus.';
    this.scoreListener = null;
    this.unsubscribers = [];
  }

  enter(engine) {
    this.scoreListener = new ScoreListener(engine.events);
    this.unsubscribers.push(this.scoreListener.unsubscribe);
    this.unsubscribers.push(engine.events.on('orb_collected', (payload) => {
      this.message = `Scene observed ${payload.name} without direct HUD wiring.`;
      this.orb.active = false;
    }));
  }

  update(dt, engine) {
    const move = 220 * dt;
    if (engine.input.isActionDown('move_left')) this.player.x -= move;
    if (engine.input.isActionDown('move_right')) this.player.x += move;

    this.player.x = Math.max(40, Math.min(880, this.player.x));

    const overlapping =
      this.player.x < this.orb.x + this.orb.width &&
      this.player.x + this.player.width > this.orb.x &&
      this.player.y < this.orb.y + this.orb.height &&
      this.player.y + this.player.height > this.orb.y;

    if (this.orb.active && overlapping && engine.input.isActionPressed('interact')) {
      engine.events.emit('orb_collected', {
        name: 'orb_collected',
        source: 'collector',
        value: 10,
      });
    }

    if (engine.input.isActionPressed('reset')) {
      this.orb.active = true;
      this.scoreListener.score = 0;
      this.scoreListener.lastMessage = 'Reset complete.';
      this.message = 'Move to the orb and press Space. The HUD listens through the event bus.';
    }
  }

  render(renderer, engine) {
    drawFrame(renderer, theme, [
      'Engine sample 0507',
      'An engine-owned event bus lets separate concerns publish and subscribe without direct object links.',
      this.message,
    ]);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    if (this.orb.active) {
      renderer.drawRect(this.orb.x, this.orb.y, this.orb.width, this.orb.height, '#fbbf24');
    }

    drawPanel(renderer, 620, 34, 300, 126, 'Event Bus', [
      `Listeners on orb_collected: ${engine.events.listenerCount('orb_collected')}`,
      `Score: ${this.scoreListener?.score ?? 0}`,
      this.scoreListener?.lastMessage ?? 'No HUD listener.',
      'Space publishes, HUD subscribes.',
    ]);
  }

  exit() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
  }
}
