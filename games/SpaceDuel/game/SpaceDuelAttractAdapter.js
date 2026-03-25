/*
Toolbox Aid
David Quesenberry
03/25/2026
SpaceDuelAttractAdapter.js
*/
export default class SpaceDuelAttractAdapter {
  constructor({ scene }) {
    this.scene = scene;
    this.active = false;
    this.phase = 'title';
    this.demoActive = false;
  }

  enter() {
    this.active = true;
  }

  exit() {
    this.active = false;
    this.demoActive = false;
    this.phase = 'title';
  }

  setPhase(phase) {
    this.phase = phase || 'title';
  }

  startDemo() {
    this.demoActive = true;
  }

  stopDemo() {
    this.demoActive = false;
  }

  update(_dtSeconds) {}

  render(renderer) {
    if (!this.active) {
      return;
    }

    if (this.phase === 'title') {
      renderer.drawText('ATTRACT MODE', 480, 506, {
        color: '#e2e8f0',
        font: '16px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
      return;
    }

    if (this.phase === 'highScores') {
      const p1 = this.scene?.scoreManager?.getPlayerState?.(1);
      const p2 = this.scene?.scoreManager?.getPlayerState?.(2);
      renderer.drawText('HIGH SCORE PREVIEW', 480, 506, {
        color: '#e2e8f0',
        font: '16px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
      renderer.drawText(`P1 ${(p1?.score ?? 0).toString().padStart(4, '0')}  P2 ${(p2?.score ?? 0).toString().padStart(4, '0')}`, 480, 526, {
        color: '#93a5bc',
        font: '14px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
      return;
    }

    if (this.phase === 'demo') {
      renderer.drawText(this.demoActive ? 'DEMO RUNNING' : 'DEMO READY', 480, 506, {
        color: '#fbbf24',
        font: '16px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
      renderer.drawText('PRESS ANY GAME INPUT TO EXIT ATTRACT', 480, 526, {
        color: '#93a5bc',
        font: '14px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    }
  }
}
