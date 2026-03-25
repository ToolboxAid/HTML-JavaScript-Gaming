/*
Toolbox Aid
David Quesenberry
03/25/2026
SpaceDuelAttractAdapter.js
*/
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default class SpaceDuelAttractAdapter {
  constructor({ scene }) {
    this.scene = scene;
    this.active = false;
    this.phase = 'title';
    this.demoActive = false;
    this.blinkTimer = 0;
    this.demoTime = 0;
    this.demoTrail = [];
    this.highScoreRows = [];
  }

  enter() {
    this.active = true;
    this.blinkTimer = 0;
    this.demoTime = 0;
    this.demoTrail = [];

    const loadedRows = this.scene?.highScoreRows || this.scene?.highScoreService?.loadTable?.() || [];
    this.highScoreRows = loadedRows.map((row, index) => ({
      rank: index + 1,
      label: row.initials,
      score: row.score,
    }));
  }

  exit() {
    this.active = false;
    this.demoActive = false;
    this.phase = 'title';
    this.demoTrail = [];
  }

  setPhase(phase) {
    this.phase = phase || 'title';
    if (this.phase !== 'demo') {
      this.demoTrail = [];
    }
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
      const ship = this.getDemoShipState();
      this.demoTrail.push({ x: ship.x, y: ship.y, life: 0.7 });
      this.demoTrail = this.demoTrail
        .map((entry) => ({ ...entry, life: entry.life - dtSeconds }))
        .filter((entry) => entry.life > 0);
    }
  }

  getPhaseFadeAlpha() {
    const timing = this.scene?.attractController?.getPhaseTimingState?.();
    if (!timing) {
      return 1;
    }
    return clamp(timing.alpha, 0, 1);
  }

  getDemoShipState() {
    const t = this.demoTime;
    return {
      x: 480 + Math.cos(t * 0.8) * 220,
      y: 340 + Math.sin(t * 1.2) * 120,
      angle: Math.sin(t * 0.9) * 1.4,
    };
  }

  drawDemoShip(renderer, ship) {
    const size = 16;
    const cos = Math.cos(ship.angle);
    const sin = Math.sin(ship.angle);
    const p1 = { x: ship.x + (cos * size), y: ship.y + (sin * size) };
    const p2 = { x: ship.x - (cos * 10) + (sin * 8), y: ship.y - (sin * 10) - (cos * 8) };
    const p3 = { x: ship.x - (cos * 10) - (sin * 8), y: ship.y - (sin * 10) + (cos * 8) };
    renderer.drawLine(p1.x, p1.y, p2.x, p2.y, '#e2e8f0', 2);
    renderer.drawLine(p2.x, p2.y, p3.x, p3.y, '#e2e8f0', 2);
    renderer.drawLine(p3.x, p3.y, p1.x, p1.y, '#e2e8f0', 2);
  }

  renderTitle(renderer, alpha) {
    renderer.drawRect(170, 210, 620, 280, `rgba(2, 6, 23, ${0.62 * alpha})`);
    renderer.strokeRect(170, 210, 620, 280, `rgba(148, 163, 184, ${0.8 * alpha})`, 1.5);

    renderer.drawText('SPACE DUEL', 480, 252, {
      color: `rgba(226, 232, 240, ${alpha})`,
      font: '52px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText('VECTOR ARCADE COMBAT', 480, 314, {
      color: `rgba(148, 163, 184, ${alpha})`,
      font: '18px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    const blinkOn = Math.floor(this.blinkTimer * 2) % 2 === 0;
    if (blinkOn) {
      renderer.drawText('PRESS 1 OR 2 TO START', 480, 386, {
        color: `rgba(251, 191, 36, ${alpha})`,
        font: '24px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    }

    renderer.drawText('IDLE ATTRACT - INPUT EXITS', 480, 432, {
      color: `rgba(148, 163, 184, ${alpha})`,
      font: '14px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }

  renderHighScores(renderer, alpha) {
    renderer.drawRect(240, 200, 480, 320, `rgba(2, 6, 23, ${0.62 * alpha})`);
    renderer.strokeRect(240, 200, 480, 320, `rgba(148, 163, 184, ${0.8 * alpha})`, 1.5);

    renderer.drawText('HIGH SCORES', 480, 234, {
      color: `rgba(226, 232, 240, ${alpha})`,
      font: '36px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    this.highScoreRows.forEach((row, index) => {
      const y = 286 + (index * 40);
      renderer.drawText(`${row.rank}. ${row.label}`, 304, y, {
        color: `rgba(226, 232, 240, ${alpha})`,
        font: '20px monospace',
        textBaseline: 'top',
      });
      renderer.drawText(String(row.score).padStart(5, '0'), 686, y, {
        color: `rgba(251, 191, 36, ${alpha})`,
        font: '20px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
    });
  }

  renderDemo(renderer, alpha) {
    renderer.drawRect(150, 180, 660, 360, `rgba(2, 6, 23, ${0.4 * alpha})`);
    renderer.strokeRect(150, 180, 660, 360, `rgba(148, 163, 184, ${0.76 * alpha})`, 1.5);

    renderer.drawText('DEMO MODE', 480, 210, {
      color: `rgba(251, 191, 36, ${alpha})`,
      font: '30px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    this.demoTrail.forEach((entry) => {
      const trailAlpha = clamp(entry.life, 0, 1) * 0.45 * alpha;
      renderer.drawRect(entry.x, entry.y, 2, 2, `rgba(148, 163, 184, ${trailAlpha.toFixed(3)})`);
    });

    const ship = this.getDemoShipState();
    this.drawDemoShip(renderer, ship);

    const enemyX = 480 + Math.sin(this.demoTime * 0.6) * 260;
    const enemyY = 300 + Math.cos(this.demoTime * 1.1) * 90;
    renderer.drawLine(enemyX - 16, enemyY, enemyX + 16, enemyY, '#fca5a5', 2);
    renderer.drawLine(enemyX, enemyY - 16, enemyX, enemyY + 16, '#fca5a5', 2);

    renderer.drawText('PRESS ANY GAME INPUT TO EXIT ATTRACT', 480, 500, {
      color: `rgba(148, 163, 184, ${alpha})`,
      font: '14px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }

  render(renderer) {
    if (!this.active) {
      return;
    }

    const fade = this.getPhaseFadeAlpha();
    renderer.drawRect(0, 0, 960, 720, 'rgba(2, 6, 23, 0.86)');

    if (this.phase === 'title') {
      this.renderTitle(renderer, fade);
      return;
    }

    if (this.phase === 'highScores') {
      this.renderHighScores(renderer, fade);
      return;
    }

    if (this.phase === 'demo') {
      this.renderDemo(renderer, fade);
    }
  }
}
