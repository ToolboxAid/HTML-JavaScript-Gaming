/*
Toolbox Aid
David Quesenberry
03/22/2026
HighScoreStore.js
*/
import { StorageService } from '../../../engine/persistence/index.js';

function toSafeScore(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

export default class HighScoreStore {
  constructor({
    key = 'toolboxaid:games:asteroids:high-score',
    storage = null,
  } = {}) {
    this.key = key;
    this.storage = storage || new StorageService();
  }

  load() {
    return toSafeScore(Number(this.storage.loadJson(this.key, 0)));
  }

  save(score) {
    const safeScore = toSafeScore(Number(score));
    this.storage.saveJson(this.key, safeScore);
    return safeScore;
  }
}
