/*
Toolbox Aid
David Quesenberry
03/22/2026
AutomatedTestRunner.js
*/
export default class AutomatedTestRunner {
  constructor() {
    this.tests = [];
  }

  register(id, run) {
    this.tests.push({ id, run });
  }

  async runAll(context = {}) {
    const results = [];
    for (const test of this.tests) {
      try {
        const output = await test.run(context);
        results.push({ id: test.id, passed: true, detail: output || 'passed' });
      } catch (error) {
        results.push({ id: test.id, passed: false, detail: error.message });
      }
    }
    return results;
  }
}
