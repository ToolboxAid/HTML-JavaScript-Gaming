/*
Toolbox Aid
David Quesenberry
03/22/2026
ReleaseValidationChecklist.js
*/
export default class ReleaseValidationChecklist {
  constructor(checks = []) {
    this.checks = [];
    checks.forEach((check) => this.register(check));
  }

  register(check) {
    this.checks.push({
      id: check.id,
      label: check.label || check.id,
      run: check.run,
      required: check.required !== false,
    });
  }

  run(context = {}) {
    const results = this.checks.map((check) => {
      const outcome = typeof check.run === 'function' ? check.run(context) : true;
      const normalized = typeof outcome === 'object'
        ? outcome
        : { passed: Boolean(outcome), detail: outcome ? 'Passed.' : 'Failed.' };

      return {
        id: check.id,
        label: check.label,
        required: check.required,
        passed: Boolean(normalized.passed),
        detail: normalized.detail || (normalized.passed ? 'Passed.' : 'Failed.'),
      };
    });

    const failedRequired = results.filter((result) => result.required && !result.passed);
    return {
      passed: failedRequired.length === 0,
      total: results.length,
      passedCount: results.filter((result) => result.passed).length,
      failedCount: results.filter((result) => !result.passed).length,
      results,
    };
  }
}
