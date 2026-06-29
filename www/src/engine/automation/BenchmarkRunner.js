/*
Toolbox Aid
David Quesenberry
03/22/2026
BenchmarkRunner.js
*/
function now() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

export default class BenchmarkRunner {
  constructor() {
    this.benchmarks = [];
  }

  register(id, run) {
    this.benchmarks.push({ id, run });
  }

  runAll(context = {}) {
    return this.benchmarks.map((benchmark) => {
      const start = now();
      const iterations = benchmark.run(context) || 0;
      const durationMs = now() - start;
      return {
        id: benchmark.id,
        iterations,
        durationMs,
      };
    });
  }
}
