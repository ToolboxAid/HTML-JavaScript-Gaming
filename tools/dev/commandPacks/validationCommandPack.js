/*
Toolbox Aid
David Quesenberry
04/05/2026
validationCommandPack.js
*/

import {
  requireNoArgs,
  safeSection,
  standardDetails,
  toLinePair
} from "./packUtils.js";

export function createValidationCommandPack() {
  return {
    packId: "validation",
    label: "Validation",
    description: "Validation status and issue summary commands.",
    commands: [
      {
        name: "validation.status",
        summary: "Show validation status counts.",
        usage: "validation.status",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const validation = safeSection(context, "validation");
          return {
            title: "Validation Status",
            lines: [
              toLinePair("errorCount", validation.errorCount ?? 0),
              toLinePair("warningCount", validation.warningCount ?? 0)
            ],
            details: standardDetails({ validation }),
            code: "VALIDATION_STATUS"
          };
        }
      },
      {
        name: "validation.errors",
        summary: "Show validation error details.",
        usage: "validation.errors",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const validation = safeSection(context, "validation");
          const errors = Array.isArray(validation.errors) ? validation.errors : [];
          return {
            title: "Validation Errors",
            lines: errors.length > 0 ? errors.map((error, index) => `${index + 1}. ${String(error)}`) : ["No validation errors."],
            details: standardDetails({ validation }),
            code: "VALIDATION_ERRORS"
          };
        }
      },
      {
        name: "validation.warnings",
        summary: "Show validation warning details.",
        usage: "validation.warnings",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const validation = safeSection(context, "validation");
          const warnings = Array.isArray(validation.warnings) ? validation.warnings : [];
          return {
            title: "Validation Warnings",
            lines: warnings.length > 0 ? warnings.map((warning, index) => `${index + 1}. ${String(warning)}`) : ["No validation warnings."],
            details: standardDetails({ validation }),
            code: "VALIDATION_WARNINGS"
          };
        }
      }
    ]
  };
}
