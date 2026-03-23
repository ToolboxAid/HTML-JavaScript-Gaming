/*
Toolbox Aid
David Quesenberry
03/22/2026
HighScoreStore.js
*/
import { StorageService } from '../../../engine/persistence/index.js';

export default class HighScoreStore {
  constructor({
    key = 'toolboxaid:games:asteroids:high-score',
    storage = null,
  } = {}) {
    this.key = key;
    this.storage = storage || new StorageService();
  }

  load() {
    return Number(this.storage.loadJson(this.key, 0)) || 0;
  }

  save(score) {
    this.storage.saveJson(this.key, score);
    return score;
  }
}
