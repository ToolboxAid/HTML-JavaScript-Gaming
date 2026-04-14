/*
Toolbox Aid
David Quesenberry
03/23/2026
GravityWellScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawPanel } from '/src/engine/debug/index.js';
import { drawVectorShape } from '/src/engine/rendering/VectorDrawing.js';
import { ReplaySystem } from '/src/engine/replay/index.js';
import GravityWellWorld from './GravityWellWorld.js';

const theme = new Theme(ThemeTokens);
const STAR_COUNT = 48;

function createStars(width, height) {
  return Array.from({ length: STAR_COUNT }, (_, index) => ({
    x: ((index * 173) % (width - 80)) + 40,
    y: ((index * 97) % (height - 80)) + 40,
    radius: 1 + (index % 3),
    color: index % 4 === 0 ? '#1d4ed8' : '#1e293b',
  }));
}

function createReplayInputSnapshot(input = null) {
  return {
    left: Boolean(input?.isDown?.('ArrowLeft')),
    right: Boolean(input?.isDown?.('ArrowRight')),
    thrust: Boolean(input?.isDown?.('ArrowUp')),
    brake: Boolean(input?.isDown?.('Space')),
  };
}

function createReplayInput(inputSnapshot = {}) {
  return {
    isDown(code) {
      if (code === 'ArrowLeft') {
        return Boolean(inputSnapshot.left);
      }
      if (code === 'ArrowRight') {
        return Boolean(inputSnapshot.right);
      }
      if (code === 'ArrowUp') {
        return Boolean(inputSnapshot.thrust);
      }
      if (code === 'Space') {
        return Boolean(inputSnapshot.brake);
      }
      return false;
    },
  };
}

export default class GravityWellScene extends Scene {
  constructor() {
    super();
    this.world = new GravityWellWorld({ width: 960, height: 720 });
    this.stars = createStars(this.world.width, this.world.height);
    this.replay = new ReplaySystem();
    this.phase = 'menu';
    this.lastEnterPressed = false;
    this.lastRecordPressed = false;
    this.lastPlaybackPressed = false;
  }

  enter(engine) {
    if (engine?.canvas) {
      engine.canvas.style.cursor = 'none';
    }
  }

  exit(engine) {
    if (engine?.canvas) {
      engine.canvas.style.cursor = 'default';
    }
  }

  startRun({ record = false } = {}) {
    this.world.reset();
    this.phase = 'playing';
    if (record) {
      this.replay.startRecording({
        metadata: { game: 'GravityWell' },
        initialState: this.world.getState(),
      });
    } else {
      this.replay.recording = false;
    }
  }

  startReplay() {
    const replay = this.replay.getReplay();
    if (!replay?.frames?.length || !replay.initialState) {
      return false;
    }

    this.world.reset();
    this.world.loadState(replay.initialState);
    this.phase = 'playing';
    return this.replay.startPlayback(replay);
  }

  update(dtSeconds, engine) {
    const enterPressed = Boolean(engine.input?.isDown('Enter'));
    const recordPressed = Boolean(engine.input?.isDown('KeyR'));
    const playbackPressed = Boolean(engine.input?.isDown('KeyP'));

    if (this.phase === 'menu') {
      if (recordPressed && !this.lastRecordPressed) {
        this.startRun({ record: true });
      } else if (playbackPressed && !this.lastPlaybackPressed) {
        this.startReplay();
      } else if (enterPressed && !this.lastEnterPressed) {
        this.startRun();
      }
      this.lastEnterPressed = enterPressed;
      this.lastRecordPressed = recordPressed;
      this.lastPlaybackPressed = playbackPressed;
      return;
    }

    if (this.phase === 'won' || this.phase === 'lost') {
      if (recordPressed && !this.lastRecordPressed) {
        this.startRun({ record: true });
      } else if (playbackPressed && !this.lastPlaybackPressed) {
        this.startReplay();
      } else if (enterPressed && !this.lastEnterPressed) {
        this.startRun();
      }
      this.lastEnterPressed = enterPressed;
      this.lastRecordPressed = recordPressed;
      this.lastPlaybackPressed = playbackPressed;
      return;
    }

    let result = null;

    if (this.replay.playing) {
      const frame = this.replay.nextFrame();
      if (!frame) {
        result = { status: this.world.status, collectedBeacon: false };
      } else {
        result = this.world.update(frame.dtSeconds, createReplayInput(frame.input));
      }
    } else {
      const replayInput = createReplayInputSnapshot(engine.input);
      result = this.world.update(dtSeconds, engine.input);
      if (this.replay.recording) {
        this.replay.recordFrame({
          dtSeconds,
          input: replayInput,
          events: result,
        });
      }
    }

    if (result.status === 'won') {
      this.phase = 'won';
    } else if (result.status === 'lost') {
      this.phase = 'lost';
    }

    if (this.replay.recording && (this.phase === 'won' || this.phase === 'lost')) {
      this.replay.stopRecording({ finalState: this.world.getState() });
    }

    this.lastEnterPressed = enterPressed;
    this.lastRecordPressed = recordPressed;
    this.lastPlaybackPressed = playbackPressed;
  }

  render(renderer) {
    renderer.clear(theme.getColor('canvasBackground'));
    renderer.drawRect(16, 16, this.world.width - 32, this.world.height - 32, '#081121');
    renderer.strokeRect(16, 16, this.world.width - 32, this.world.height - 32, '#244266', 2);

    this.stars.forEach((star) => {
      renderer.drawCircle(star.x, star.y, star.radius, star.color);
    });

    this.renderTrail(renderer);
    this.renderPlanets(renderer);
    this.renderBeacons(renderer);
    this.renderShip(renderer);
    this.renderHud(renderer);
    this.renderOverlay(renderer);
  }

  renderTrail(renderer) {
    for (let index = 1; index < this.world.trail.length; index += 1) {
      const previous = this.world.trail[index - 1];
      const current = this.world.trail[index];
      const alpha = index / this.world.trail.length;
      renderer.drawLine(
        previous.x,
        previous.y,
        current.x,
        current.y,
        `rgba(96, 165, 250, ${alpha * 0.34})`,
        1,
      );
    }
  }

  renderPlanets(renderer) {
    this.world.planets.forEach((planet) => {
      renderer.drawCircle(planet.x, planet.y, planet.radius + 18, 'rgba(30, 41, 59, 0.42)');
      renderer.drawCircle(planet.x, planet.y, planet.radius, planet.color);
      renderer.drawCircle(planet.x + 8, planet.y - 10, Math.max(10, planet.radius * 0.34), 'rgba(255, 255, 255, 0.12)');
    });
  }

  renderBeacons(renderer) {
    this.world.beacons.forEach((beacon) => {
      if (beacon.collected) {
        renderer.drawCircle(beacon.x, beacon.y, 8, 'rgba(134, 239, 172, 0.24)');
        return;
      }

      drawVectorShape(renderer, this.world.getBeaconPoints(beacon), {
        strokeColor: beacon.color,
        lineWidth: 2,
      });
      renderer.drawCircle(beacon.x, beacon.y, 3, beacon.color);
    });
  }

  renderShip(renderer) {
    drawVectorShape(renderer, this.world.getShipPoints(), {
      strokeColor: '#f8fafc',
      lineWidth: 2,
    });

    if (this.phase === 'playing' && this.world.ship.thrusting) {
      drawVectorShape(renderer, this.world.getFlamePoints(), {
        strokeColor: '#fbbf24',
        lineWidth: 2,
      });
    }

    renderer.drawLine(
      this.world.ship.x,
      this.world.ship.y,
      this.world.ship.x + this.world.ship.vx * 0.22,
      this.world.ship.y + this.world.ship.vy * 0.22,
      'rgba(125, 211, 252, 0.65)',
      1,
    );
  }

  renderHud(renderer) {
    drawPanel(renderer, 620, 28, 300, 176, 'Gravity Well', [
      `Phase: ${this.phase.toUpperCase()}`,
      `Beacons: ${this.world.collectedCount}/${this.world.beacons.length}`,
      `Speed: ${this.world.getShipSpeed().toFixed(1)}`,
      `Field: ${(this.world.getGravityPercent() * 100).toFixed(0)}%`,
      `Time: ${this.world.elapsedSeconds.toFixed(1)}s`,
      `Replay: ${this.replay.playing ? 'PLAYBACK' : this.replay.recording ? 'RECORDING' : this.replay.frames.length ? 'READY' : 'NONE'}`,
      'Left/Right rotate',
      'Up thrusts, Space brakes',
      'R records, P replays',
    ]);

    renderer.drawText('Slingshot around the wells and collect every beacon.', 42, 48, {
      color: theme.getColor('textCanvs'),
      font: '18px monospace',
    });
  }

  renderOverlay(renderer) {
    if (this.phase === 'playing') {
      return;
    }

    renderer.drawRect(180, 244, 600, 180, 'rgba(8, 15, 28, 0.88)');
    renderer.strokeRect(180, 244, 600, 180, '#60a5fa', 2);

    const title = this.phase === 'menu'
      ? 'GRAVITY WELL'
      : this.phase === 'won'
        ? 'RUN COMPLETE'
        : 'SHIP LOST';

    const lines = this.phase === 'menu'
      ? [
          'Collect every beacon while surviving the gravity wells.',
          'Use orbital pull and short thrust burns to build speed.',
          'Press Enter to launch. R records. P replays.',
        ]
      : [
          this.world.statusMessage,
          'Press Enter to try another run.',
        ];

    renderer.drawText(title, 480, 292, {
      color: '#f8fafc',
      font: '32px monospace',
      textAlign: 'center',
    });

    lines.forEach((line, index) => {
      renderer.drawText(line, 480, 338 + (index * 28), {
        color: '#cbd5e1',
        font: '18px monospace',
        textAlign: 'center',
      });
    });
  }
}
