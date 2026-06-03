/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeErrorReporting.js
*/

export const RUNTIME_ERROR_REPORT_STAGES = Object.freeze({
  MANIFEST: "manifest",
  OBJECT: "object",
  TERRAIN: "terrain",
  ENVIRONMENT: "environment",
  RULE: "rule",
  INPUT: "input",
  COLLISION: "collision",
  RENDER: "render",
});

export const RUNTIME_ERROR_REPORT_STAGE_LIST = Object.freeze([
  RUNTIME_ERROR_REPORT_STAGES.MANIFEST,
  RUNTIME_ERROR_REPORT_STAGES.OBJECT,
  RUNTIME_ERROR_REPORT_STAGES.TERRAIN,
  RUNTIME_ERROR_REPORT_STAGES.ENVIRONMENT,
  RUNTIME_ERROR_REPORT_STAGES.RULE,
  RUNTIME_ERROR_REPORT_STAGES.INPUT,
  RUNTIME_ERROR_REPORT_STAGES.COLLISION,
  RUNTIME_ERROR_REPORT_STAGES.RENDER,
]);

export const RUNTIME_ERROR_REPORTING_ERRORS = Object.freeze({
  STAGE_INVALID: "RUNTIME_ERROR_REPORT_STAGE_INVALID",
  SOURCE_REQUIRED: "RUNTIME_ERROR_REPORT_SOURCE_REQUIRED",
  ERRORS_INVALID: "RUNTIME_ERROR_REPORT_ERRORS_INVALID",
  ERROR_CODE_REQUIRED: "RUNTIME_ERROR_REPORT_ERROR_CODE_REQUIRED",
  ERROR_MESSAGE_REQUIRED: "RUNTIME_ERROR_REPORT_ERROR_MESSAGE_REQUIRED",
  ERROR_PATH_REQUIRED: "RUNTIME_ERROR_REPORT_ERROR_PATH_REQUIRED",
});

export function createRuntimeErrorReport({ stage, source, errors }) {
  const validationErrors = validateErrorReportInput({ stage, source, errors });

  if (validationErrors.length > 0) {
    return createRuntimeErrorReportResult({ report: null, errors: validationErrors });
  }

  return createRuntimeErrorReportResult({
    report: Object.freeze({
      visible: true,
      stage,
      source: source.trim(),
      summary: `${stage} failed with ${errors.length} error(s).`,
      items: Object.freeze(errors.map((error) => Object.freeze({
        code: error.code.trim(),
        message: error.message.trim(),
        path: error.path.trim(),
      }))),
    }),
    errors: [],
  });
}

function validateErrorReportInput({ stage, source, errors }) {
  const validationErrors = [];

  if (!RUNTIME_ERROR_REPORT_STAGE_LIST.includes(stage)) {
    validationErrors.push(createRuntimeErrorReportingError(
      RUNTIME_ERROR_REPORTING_ERRORS.STAGE_INVALID,
      "Runtime error report requires an approved stage.",
      "stage"
    ));
  }

  if (!hasNonEmptyString(source)) {
    validationErrors.push(createRuntimeErrorReportingError(
      RUNTIME_ERROR_REPORTING_ERRORS.SOURCE_REQUIRED,
      "Runtime error report requires explicit source.",
      "source"
    ));
  }

  if (!Array.isArray(errors) || errors.length === 0) {
    validationErrors.push(createRuntimeErrorReportingError(
      RUNTIME_ERROR_REPORTING_ERRORS.ERRORS_INVALID,
      "Runtime error report requires one or more errors.",
      "errors"
    ));
    return validationErrors;
  }

  errors.forEach((error, index) => {
    const path = `errors[${index}]`;

    if (!hasNonEmptyString(error?.code)) {
      validationErrors.push(createRuntimeErrorReportingError(
        RUNTIME_ERROR_REPORTING_ERRORS.ERROR_CODE_REQUIRED,
        "Runtime error item requires code.",
        `${path}.code`
      ));
    }

    if (!hasNonEmptyString(error?.message)) {
      validationErrors.push(createRuntimeErrorReportingError(
        RUNTIME_ERROR_REPORTING_ERRORS.ERROR_MESSAGE_REQUIRED,
        "Runtime error item requires message.",
        `${path}.message`
      ));
    }

    if (!hasNonEmptyString(error?.path)) {
      validationErrors.push(createRuntimeErrorReportingError(
        RUNTIME_ERROR_REPORTING_ERRORS.ERROR_PATH_REQUIRED,
        "Runtime error item requires path.",
        `${path}.path`
      ));
    }
  });

  return validationErrors;
}

function createRuntimeErrorReportResult({ report, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    report,
    errors: Object.freeze(errors),
  });
}

function createRuntimeErrorReportingError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
