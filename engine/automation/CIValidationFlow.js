/*
Toolbox Aid
David Quesenberry
03/22/2026
CIValidationFlow.js
*/
export default class CIValidationFlow {
  constructor(steps = []) {
    this.steps = steps;
  }

  run(context = {}) {
    const results = this.steps.map((step) => {
      const result = step.run(context);
      return {
        id: step.id,
        passed: Boolean(result.passed),
        detail: result.detail,
      };
    });

    return {
      passed: results.every((result) => result.passed),
      results,
    };
  }
}
