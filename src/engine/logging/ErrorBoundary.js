/*
Toolbox Aid
David Quesenberry
03/22/2026
ErrorBoundary.js
*/
export default class ErrorBoundary {
  constructor({ logger = null } = {}) {
    this.logger = logger;
  }

  run(operation, fallback = null) {
    try {
      return operation();
    } catch (error) {
      this.logger?.error('Operation failed gracefully.', {
        error: error?.message || 'Unknown error',
      });
      return fallback;
    }
  }
}
