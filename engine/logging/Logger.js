/*
Toolbox Aid
David Quesenberry
03/22/2026
Logger.js
*/
const LEVEL_ORDER = ['debug', 'info', 'warn', 'error'];

export default class Logger {
  constructor({ channel = 'app', level = 'debug' } = {}) {
    this.channel = channel;
    this.level = level;
    this.entries = [];
  }

  shouldLog(level) {
    return LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(this.level);
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) {
      return null;
    }

    const entry = {
      level,
      channel: this.channel,
      message,
      meta: { ...meta },
      timestamp: new Date().toISOString(),
    };

    this.entries.push(entry);
    return entry;
  }

  debug(message, meta = {}) {
    return this.log('debug', message, meta);
  }

  info(message, meta = {}) {
    return this.log('info', message, meta);
  }

  warn(message, meta = {}) {
    return this.log('warn', message, meta);
  }

  error(message, meta = {}) {
    return this.log('error', message, meta);
  }

  getEntries(level = null) {
    if (!level) {
      return this.entries.map((entry) => ({ ...entry, meta: { ...entry.meta } }));
    }

    return this.entries
      .filter((entry) => entry.level === level)
      .map((entry) => ({ ...entry, meta: { ...entry.meta } }));
  }
}
