/*
Toolbox Aid
David Quesenberry
03/25/2026
AsteroidsAttractAdapter.js
*/
import { clamp } from '../../../src/engine/utils/math.js';

function estimateTextWidth(text, fontPx) {
  return String(text ?? '').length * (fontPx * 0.62);
}

function drawTextPanel(renderer, {
  cx,
  top,
  width,
  height,
  alpha,
} = {}) {
  const safeAlpha = clamp(alpha ?? 0.28, 0, 1);
  const x = cx - (width / 2);
  renderer.drawRect(x, top, width, height, `rgba(2, 6, 23, ${safeAlpha.toFixed(3)})`);
}

function drawShipSilhouette(renderer, x, y, angle = 0, color = '#ffffff') {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const toWorld = (lx, ly) => ({
    x: x + (lx * cos) - (ly * sin),
    y: y + (lx * sin) + (ly * cos),
  });
  const a = toWorld(16, 0);
  const b = toWorld(-10, 9);
  const c = toWorld(-5, 0);
  const d = toWorld(-10, -9);
  renderer.drawLine(a.x, a.y, b.x, b.y, color, 2);
  renderer.drawLine(b.x, b.y, c.x, c.y, color, 2);
  renderer.drawLine(c.x, c.y, d.x, d.y, color, 2);
  renderer.drawLine(d.x, d.y, a.x, a.y, color, 2);
}

function drawSaucerSilhouette(renderer, x, y, color = '#dbeafe') {
  renderer.drawLine(x - 20, y + 5, x + 20, y + 5, color, 2);
  renderer.drawLine(x - 14, y - 4, x + 14, y - 4, color, 2);
  renderer.drawLine(x - 20, y + 5, x - 14, y - 4, color, 2);
  renderer.drawLine(x + 20, y + 5, x + 14, y - 4, color, 2);
}

function drawAsteroidSilhouette(renderer, x, y, color = '#cbd5e1') {
  const pts = [
    [x - 16, y - 5], [x - 7, y + 14], [x + 11, y + 12],
    [x + 15, y - 6], [x + 2, y - 16], [x - 16, y - 5],
  ];
  for (let i = 0; i < pts.length - 1; i += 1) {
    renderer.drawLine(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], color, 2);
  }
}

export default class AsteroidsAttractAdapter {
  constructor({ scene }) {
    this.scene = scene;
    this.active = false;
    this.phase = 'title';
    this.demoActive = false;
    this.blinkTimer = 0;
    this.demoTime = 0;
    this.demoTrail = [];
  }

  enter() {
    this.active = true;
    this.blinkTimer = 0;
    this.demoTime = 0;
    this.demoTrail = [];
  }

  exit() {
    this.active = false;
    this.phase = 'title';
    this.demoActive = false;
    this.demoTrail = [];
  }

  setPhase(phase) {
    this.phase = phase || 'title';
  }

  startDemo() {
    this.demoActive = true;
    this.demoTime = 0;
    this.demoTrail = [];
  }

  stopDemo() {
    this.demoActive = false;
    this.demoTrail = [];
  }

  update(dtSeconds) {
    if (!this.active) {
      return;
    }

    this.blinkTimer += dtSeconds;

    if (this.phase === 'demo' && this.demoActive) {
      this.demoTime += dtSeconds;
      const x = 480 + Math.cos(this.demoTime * 0.7) * 220;
      const y = 340 + Math.sin(this.demoTime * 1.1) * 130;
      this.demoTrail.push({ x, y, life: 0.8 });
      this.demoTrail = this.demoTrail
        .map((entry) => ({ ...entry, life: entry.life - dtSeconds }))
        .filter((entry) => entry.life > 0);
    }
  }

  getPhaseAlpha() {
    const timing = this.scene?.attractController?.getPhaseTimingState?.();
    if (!timing) {
      return 1;
    }
    return clamp(timing.alpha, 0, 1);
  }

  renderTitle(renderer, alpha) {
    drawTextPanel(renderer, {
      cx: 480,
      top: 176,
      width: 620,
      height: 196,
      alpha: 0.27 * alpha,
    });

    renderer.drawText('ASTEROIDS', 480, 196, {
      color: `rgba(255,255,255,${alpha})`,
      font: '56px "Vector Battle", monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText('ARCADE ATTRACT MODE', 480, 258, {
      color: `rgba(226,232,240,${alpha})`,
      font: '18px "Vector Battle", monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    if (Math.floor(this.blinkTimer * 2) % 2 === 0) {
      renderer.drawText('PRESS 1 OR 2 TO START', 480, 330, {
        color: `rgba(251,191,36,${alpha})`,
        font: '26px "Vector Battle", monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    }

    drawShipSilhouette(renderer, 328, 348, -0.28, `rgba(248,250,252,${alpha})`);
    drawAsteroidSilhouette(renderer, 632, 352, `rgba(203,213,225,${alpha})`);
  }

  renderHighScores(renderer, alpha) {
    const rows = this.scene?.highScoreRows || [];
    const rowCount = Math.max(rows.length, 1);
    drawTextPanel(renderer, {
      cx: 480,
      top: 176,
      width: 460,
      height: 104 + (rowCount * 42),
      alpha: 0.29 * alpha,
    });

    renderer.drawText('HIGH SCORES', 480, 196, {
      color: `rgba(255,255,255,${alpha})`,
      font: '34px "Vector Battle", monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    rows.forEach((row, index) => {
      const y = 248 + (index * 42);
      renderer.drawText(`${index + 1}. ${row.initials}`, 298, y, {
        color: `rgba(226,232,240,${alpha})`,
        font: '20px "Vector Battle", monospace',
        textBaseline: 'top',
      });
      renderer.drawText(String(row.score).padStart(5, '0'), 662, y, {
        color: `rgba(252,211,77,${alpha})`,
        font: '20px "Vector Battle", monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
    });
  }

  renderDemo(renderer, alpha) {
    const instructions = 'PRESS ANY GAME INPUT TO EXIT ATTRACT';
    const instructionsWidth = estimateTextWidth(instructions, 14) + 28;
    drawTextPanel(renderer, {
      cx: 480,
      top: 184,
      width: 230,
      height: 54,
      alpha: 0.24 * alpha,
    });
    drawTextPanel(renderer, {
      cx: 480,
      top: 510,
      width: instructionsWidth,
      height: 30,
      alpha: 0.3 * alpha,
    });

    renderer.drawText('DEMO', 480, 196, {
      color: `rgba(251,191,36,${alpha})`,
      font: '34px "Vector Battle", monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    this.demoTrail.forEach((entry) => {
      const trailAlpha = clamp(entry.life, 0, 1) * 0.5 * alpha;
      renderer.drawRect(entry.x, entry.y, 2, 2, `rgba(148,163,184,${trailAlpha.toFixed(3)})`);
    });

    const x = 480 + Math.cos(this.demoTime * 0.7) * 220;
    const y = 340 + Math.sin(this.demoTime * 1.1) * 130;
    drawShipSilhouette(renderer, x, y, Math.sin(this.demoTime * 0.9) * 1.2, '#ffffff');

    const rockX = 480 + Math.sin(this.demoTime * 0.5) * 250;
    const rockY = 330 + Math.cos(this.demoTime * 0.9) * 120;
    drawAsteroidSilhouette(renderer, rockX, rockY, '#cbd5e1');
    drawSaucerSilhouette(renderer, 480 + Math.cos(this.demoTime * 0.43) * 280, 284, '#dbeafe');

    renderer.drawText('PRESS ANY GAME INPUT TO EXIT ATTRACT', 480, 520, {
      color: `rgba(148,163,184,${alpha})`,
      font: '14px "Vector Battle", monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }

  render(renderer) {
    if (!this.active) {
      return;
    }

    const alpha = this.getPhaseAlpha();
    renderer.drawRect(0, 0, 960, 720, 'rgba(2, 6, 23, 0.86)');

    if (this.phase === 'title') {
      this.renderTitle(renderer, alpha);
      return;
    }

    if (this.phase === 'highScores') {
      this.renderHighScores(renderer, alpha);
      return;
    }

    if (this.phase === 'demo') {
      this.renderDemo(renderer, alpha);
    }
  }
}
