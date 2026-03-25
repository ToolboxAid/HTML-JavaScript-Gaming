/*
Toolbox Aid
David Quesenberry
03/25/2026
AsteroidsAttractAdapter.js
*/
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
    const phaseMs = this.scene?.attractController?.getSnapshot?.().phaseMs ?? 0;
    const duration = this.scene?.attractController?.phaseDurationMs ?? 1;
    const normalized = clamp(phaseMs / duration, 0, 1);
    const edge = Math.min(normalized, 1 - normalized);
    return clamp(edge * 2.2, 0.2, 1);
  }

  renderTitle(renderer, alpha) {
    renderer.drawText('ASTEROIDS', 480, 196, {
      color: `rgba(255,255,255,${alpha})`,
      font: '56px "Vector Battle", monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText('ARCADE ATTRACT MODE', 480, 258, {
      color: `rgba(203,213,225,${alpha})`,
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
  }

  renderHighScores(renderer, alpha) {
    const rows = this.scene?.highScoreRows || [];

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
        color: `rgba(251,191,36,${alpha})`,
        font: '20px "Vector Battle", monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
    });
  }

  renderDemo(renderer, alpha) {
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
    renderer.drawLine(x + 15, y, x - 11, y + 10, '#ffffff', 2);
    renderer.drawLine(x - 11, y + 10, x - 6, y, '#ffffff', 2);
    renderer.drawLine(x - 6, y, x - 11, y - 10, '#ffffff', 2);
    renderer.drawLine(x - 11, y - 10, x + 15, y, '#ffffff', 2);

    const rockX = 480 + Math.sin(this.demoTime * 0.5) * 250;
    const rockY = 330 + Math.cos(this.demoTime * 0.9) * 120;
    renderer.drawLine(rockX - 16, rockY - 5, rockX - 7, rockY + 14, '#cbd5e1', 2);
    renderer.drawLine(rockX - 7, rockY + 14, rockX + 11, rockY + 12, '#cbd5e1', 2);
    renderer.drawLine(rockX + 11, rockY + 12, rockX + 15, rockY - 6, '#cbd5e1', 2);
    renderer.drawLine(rockX + 15, rockY - 6, rockX + 2, rockY - 16, '#cbd5e1', 2);
    renderer.drawLine(rockX + 2, rockY - 16, rockX - 16, rockY - 5, '#cbd5e1', 2);

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
