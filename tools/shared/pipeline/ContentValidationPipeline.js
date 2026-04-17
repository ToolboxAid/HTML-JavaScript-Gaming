/*
Toolbox Aid
David Quesenberry
03/22/2026
ContentValidationPipeline.js
*/
export default class ContentValidationPipeline {
  constructor(validators = []) {
    this.validators = validators;
  }

  run(content) {
    const results = this.validators.map((validator) => validator(content));
    return {
      passed: results.every((result) => result.passed),
      results,
    };
  }
}
