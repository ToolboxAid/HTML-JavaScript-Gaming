/*
Toolbox Aid
David Quesenberry
03/24/2026
ThrusterScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import ThrusterAudio from './ThrusterAudio.js';
import ThrusterInputController from './ThrusterInputController.js';
import ThrusterWorld from './ThrusterWorld.js';

const VIEW = {
  width: 960,
  height: 720,
};

const COLORS = {
  background: '#040813',
  wall: '#dbeafe',
  text: '#dbeafe',
  muted: '#9fb3c8',
  panel: '#040813',
  ship: '#dbeafe',
  flame: '#f59e0b',
  trail: '#1d4ed8',
};

function wrapText(text, maxCharacters = 40) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharacters && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

export default class ThrusterScene extends Scene {
  constructor() {
    super();
    this.world = new ThrusterWorld(VIEW);
    this.inputController = null;
    this.audio = new ThrusterAudio();
    this.isPaused = false;
  }

  enter(engine) {
    this.inputController = new ThrusterInputController(engine.input);
    this.audio.setAudioService(engine.audio ?? null);
    this.world.resetGame();
    this.isPaused = false;
  }

  update(dt) {
    const frame = this.inputController.getFrameState();

    if (frame.resetPressed && this.isPaused) {
      this.isPaused = false;
      this.world.resetGame();
      this.audio.playReset();
      return;
    }

    if (frame.pausePressed && this.world.status === 'playing') {
      this.isPaused = !this.isPaused;
      return;
    }

    if (this.isPaused) {
      return;
    }

    const event = this.world.update(dt, frame);
    if (event.started) {
      this.audio.playStart();
    }
    if (event.thrusting) {
      this.audio.playThrust();
    }
    if (event.wallBounced) {
      this.audio.playWallBounce();
    }
    if (event.reset) {
      this.audio.playReset();
    }
  }

  render(renderer) {
    renderer.clear(COLORS.background);
    this.drawArena(renderer);
    this.drawHud(renderer);
    this.drawShip(renderer);

    if (this.isPaused) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.5)');
      this.drawOverlay(renderer, {
        title: 'PAUSED',
        body: 'Thrusters are offline while the run is paused. Resume to continue working the ship through inertia.',
        prompt: 'Press P or Start to continue.',
      });
    } else if (this.world.status !== 'playing') {
      this.drawOverlay(renderer, {
        title: 'THRUSTER',
        body: 'Rotate the ship, burn thrust, and manage momentum in a bounded arena. No shooting, gravity wells, or orbit systems yet.',
        prompt: 'Press Space, Enter, or south button to start.',
      });
    }
  }

  drawArena(renderer) {
    const { playfield, wallThickness } = this.world;
    renderer.drawRect(0, 0, VIEW.width, wallThickness, COLORS.wall);
    renderer.drawRect(0, VIEW.height - wallThickness, VIEW.width, wallThickness, COLORS.wall);
    renderer.drawRect(0, 0, wallThickness, VIEW.height, COLORS.wall);
    renderer.drawRect(VIEW.width - wallThickness, 0, wallThickness, VIEW.height, COLORS.wall);
    renderer.strokeRect(
      playfield.left,
      playfield.top,
      playfield.right - playfield.left,
      playfield.bottom - playfield.top,
      COLORS.wall,
      2,
    );
  }

  drawHud(renderer) {
    renderer.drawText('THRUSTER', 28, 20, {
      color: COLORS.text,
      font: 'bold 24px monospace',
      textBaseline: 'top',
    });

    renderer.drawText(this.world.status === 'playing' ? 'LIVE' : 'READY', 930, 20, {
      color: COLORS.text,
      font: '18px monospace',
      textAlign: 'right',
      textBaseline: 'top',
    });

    renderer.drawText(`VX ${this.world.ship.vx.toFixed(0)}`, 28, 54, {
      color: COLORS.muted,
      font: '16px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`VY ${this.world.ship.vy.toFixed(0)}`, 156, 54, {
      color: COLORS.muted,
      font: '16px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`ANG ${(this.world.ship.angle * 57.2958).toFixed(0)}`, 284, 54, {
      color: COLORS.muted,
      font: '16px monospace',
      textBaseline: 'top',
    });

    if (this.world.status === 'playing') {
      renderer.drawText('LEFT/RIGHT turn  UP thrust', 930, 38, {
        color: COLORS.muted,
        font: '16px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
      renderer.drawText('P pause  R reset', 930, 58, {
        color: COLORS.muted,
        font: '16px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
    }
  }

  drawShip(renderer) {
    const shipPoints = this.world.getShipPoints();
    for (let index = 0; index < shipPoints.length; index += 1) {
      const current = shipPoints[index];
      const next = shipPoints[(index + 1) % shipPoints.length];
      renderer.drawLine(current.x, current.y, next.x, next.y, COLORS.ship, 3);
    }

    if (this.world.ship.thrusting) {
      const flamePoints = this.world.getFlamePoints();
      for (let index = 0; index < flamePoints.length; index += 1) {
        const current = flamePoints[index];
        const next = flamePoints[(index + 1) % flamePoints.length];
        renderer.drawLine(current.x, current.y, next.x, next.y, COLORS.flame, 2);
      }
    }

    renderer.drawLine(
      this.world.ship.x,
      this.world.ship.y,
      this.world.ship.x + (this.world.ship.vx * 0.25),
      this.world.ship.y + (this.world.ship.vy * 0.25),
      COLORS.trail,
      1,
    );
  }

  drawOverlay(renderer, copy) {
    renderer.drawRect(180, 258, 600, 192, COLORS.panel);
    renderer.strokeRect(180, 258, 600, 192, COLORS.wall, 2);
    renderer.drawText(copy.title, VIEW.width / 2, 292, {
      color: COLORS.text,
      font: 'bold 28px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    wrapText(copy.body).forEach((line, index) => {
      renderer.drawText(line, VIEW.width / 2, 336 + (index * 24), {
        color: COLORS.muted,
        font: '18px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    });

    renderer.drawText(copy.prompt, VIEW.width / 2, 422, {
      color: COLORS.text,
      font: '18px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }
}
