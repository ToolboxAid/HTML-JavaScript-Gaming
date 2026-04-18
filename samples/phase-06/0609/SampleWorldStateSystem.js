/*
Toolbox Aid
David Quesenberry
03/22/2026
SampleWorldStateSystem.js
*/
export class SampleWorldStateSystem {
  constructor(waves = []) {
    this.waves = Array.isArray(waves) ? waves : [];
    this.phase = this.waves.length ? 'idle' : 'complete';
    this.waveIndex = 0;
  }

  getCurrentWave() {
    return this.waves[this.waveIndex] || null;
  }

  update(entities, spawnDone) {
    const transitions = [];
    if (this.phase === 'complete') return transitions;
    if (this.phase === 'idle') {
      this.phase = 'spawning';
      transitions.push('spawning');
      return transitions;
    }
    if (this.phase === 'spawning' && spawnDone) {
      this.phase = 'active';
      transitions.push('active');
      return transitions;
    }
    if (this.phase === 'active' && entities.length === 0) {
      this.waveIndex += 1;
      if (this.waveIndex >= this.waves.length) {
        this.phase = 'complete';
        transitions.push('complete');
      } else {
        this.phase = 'spawning';
        transitions.push('spawning');
      }
    }
    return transitions;
  }
}
