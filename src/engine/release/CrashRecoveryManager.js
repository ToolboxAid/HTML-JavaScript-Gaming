/*
Toolbox Aid
David Quesenberry
03/22/2026
CrashRecoveryManager.js
*/
import { StorageService } from '../persistence/index.js';

export default class CrashRecoveryManager {
  constructor({
    namespace = 'toolboxaid:crash-recovery',
    logger = null,
    storage = null,
    fallbackFactory = null,
  } = {}) {
    this.namespace = namespace;
    this.storage = storage || new StorageService();
    this.logger = logger || null;
    this.fallbackFactory = typeof fallbackFactory === 'function' ? fallbackFactory : null;
    this.lastCrash = null;
  }

  run(label, operation, context = {}) {
    try {
      const result = operation();
      this.clearCrash();
      return {
        ok: true,
        label,
        result,
        fallback: null,
      };
    } catch (error) {
      this.logger?.error('Operation failed gracefully.', {
        event: 'engine.crash-recovery.operation-failed',
        error: error?.message || 'Unknown error',
        label,
      });
      return this.captureCrash(label, context);
    }
  }

  captureCrash(label, context = {}) {
    const crash = {
      label,
      context: { ...context },
      crashedAt: new Date().toISOString(),
    };
    this.lastCrash = crash;
    this.storage.saveJson(this.namespace, crash);
    const fallback = this.fallbackFactory ? this.fallbackFactory(crash) : null;
    return {
      ok: false,
      label,
      result: null,
      fallback,
      crash,
    };
  }

  clearCrash() {
    this.lastCrash = null;
    this.storage.saveJson(this.namespace, null);
  }

  restoreLastCrash() {
    const stored = this.storage.loadJson(this.namespace, null);
    this.lastCrash = stored;
    return stored;
  }
}
