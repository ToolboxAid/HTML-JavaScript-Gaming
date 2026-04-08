/*
Toolbox Aid
David Quesenberry
03/25/2026
SpaceDuelHighScoreService.js
*/
import { StorageService } from '../../../src/engine/persistence/index.js';
import {
  sanitizeScore,
  sanitizeInitials,
  sanitizeRow,
  sortRows,
} from '../../../src/shared/utils/highScoreUtils.js';

const DEFAULT_KEY = 'toolboxaid:games:space-duel:high-scores';
const DEFAULT_TABLE = [
  { initials: 'ACE', score: 1800 },
  { initials: 'VTR', score: 1200 },
  { initials: 'ION', score: 900 },
  { initials: 'CPU', score: 700 },
  { initials: 'BOT', score: 500 },
];

export default class SpaceDuelHighScoreService {
  constructor({
    key = DEFAULT_KEY,
    tableSize = 5,
    storage = null,
  } = {}) {
    this.key = key;
    this.tableSize = Math.max(1, Math.trunc(tableSize || 5));
    this.storage = storage || new StorageService();
  }

  getDefaultTable() {
    return DEFAULT_TABLE.slice(0, this.tableSize).map((row) => sanitizeRow(row));
  }

  loadTable() {
    const fallback = this.getDefaultTable();
    const raw = this.storage.loadJson(this.key, fallback);
    if (!Array.isArray(raw)) {
      return fallback;
    }

    const rows = raw
      .map((row) => sanitizeRow(row))
      .filter((row) => row.score >= 0);

    if (!rows.length) {
      return fallback;
    }

    return sortRows(rows).slice(0, this.tableSize);
  }

  saveTable(rows) {
    const safeRows = sortRows((rows || []).map((row) => sanitizeRow(row))).slice(0, this.tableSize);
    this.storage.saveJson(this.key, safeRows);
    return safeRows;
  }

  getTopScore(rows = null) {
    const table = rows || this.loadTable();
    return table[0]?.score ?? 0;
  }

  getQualifyingIndex(score, rows = null) {
    const safeScore = sanitizeScore(score);
    const table = rows ? [...rows] : this.loadTable();
    const sorted = sortRows(table).slice(0, this.tableSize);

    for (let index = 0; index < sorted.length; index += 1) {
      if (safeScore > sorted[index].score) {
        return index;
      }
    }

    if (sorted.length < this.tableSize) {
      return sorted.length;
    }

    return -1;
  }

  insertScore({ initials, score }, rows = null) {
    const table = rows ? [...rows] : this.loadTable();
    const safeRow = sanitizeRow({ initials, score });
    const next = sortRows([...table, safeRow]).slice(0, this.tableSize);
    this.saveTable(next);
    return next;
  }
}
