/*
Toolbox Aid
David Quesenberry
03/25/2026
SpaceInvadersHighScoreService.js
*/
import { StorageService } from '../../../src/engine/persistence/index.js';

const DEFAULT_KEY = 'toolboxaid:games:space-invaders:high-score-table';
const DEFAULT_ROWS = [
  { initials: 'ACE', score: 1500 },
  { initials: 'VTR', score: 1200 },
  { initials: 'ION', score: 900 },
  { initials: 'CPU', score: 700 },
  { initials: 'BOT', score: 500 },
];

function sanitizeScore(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.trunc(value));
}

function sanitizeInitials(value) {
  const letters = String(value ?? '').toUpperCase().replace(/[^A-Z]/g, '');
  return (letters || 'AAA').slice(0, 3).padEnd(3, 'A');
}

function sanitizeRow(row) {
  return {
    initials: sanitizeInitials(row?.initials),
    score: sanitizeScore(row?.score),
  };
}

function sortRows(rows) {
  return [...rows].sort((a, b) => b.score - a.score);
}

export default class SpaceInvadersHighScoreService {
  constructor({ key = DEFAULT_KEY, tableSize = 5, storage = null } = {}) {
    this.key = key;
    this.tableSize = Math.max(1, Math.trunc(tableSize || 5));
    this.storage = storage || new StorageService();
  }

  getDefaultTable() {
    return DEFAULT_ROWS.slice(0, this.tableSize).map((row) => sanitizeRow(row));
  }

  loadTable() {
    const fallback = this.getDefaultTable();
    const loaded = this.storage.loadJson(this.key, fallback);
    if (!Array.isArray(loaded)) {
      return fallback;
    }

    const rows = loaded.map((row) => sanitizeRow(row));
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
