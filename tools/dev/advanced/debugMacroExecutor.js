/*
Toolbox Aid
David Quesenberry
04/05/2026
debugMacroExecutor.js
*/

import { sanitizeText } from "/src/engine/debug/inspectors/shared/inspectorUtils.js";

function parseCommandName(commandLine) {
  const line = sanitizeText(commandLine);
  if (!line) {
    return "";
  }
  const parts = line.split(/\s+/).filter(Boolean);
  return sanitizeText(parts[0]);
}

function toResult(status, title, lines, code, details = {}) {
  return {
    status: status === "failed" ? "failed" : "ready",
    title,
    lines: Array.isArray(lines) ? lines : [],
    code,
    details
  };
}

export class DebugMacroExecutor {
  constructor(options = {}) {
    this.macroRegistry = options.macroRegistry || null;
    this.maxSteps = Number.isFinite(options.maxSteps) && options.maxSteps > 0
      ? Math.floor(options.maxSteps)
      : 12;
  }

  executeMacro(macroId, context = {}) {
    if (!this.macroRegistry || typeof this.macroRegistry.getMacro !== "function") {
      return toResult(
        "failed",
        "Macro Run",
        ["Macro registry is unavailable."],
        "MISSING_MACRO_REGISTRY",
        {
          macroId: sanitizeText(macroId)
        }
      );
    }

    if (typeof context?.executeConsoleCommand !== "function") {
      return toResult(
        "failed",
        "Macro Run",
        ["Macro execution function is unavailable."],
        "MISSING_MACRO_EXECUTOR",
        {
          macroId: sanitizeText(macroId)
        }
      );
    }

    const descriptor = this.macroRegistry.getMacro(macroId);
    if (!descriptor) {
      return toResult(
        "failed",
        "Macro Run",
        [`Macro ${sanitizeText(macroId) || "n/a"} was not found.`],
        "MACRO_NOT_FOUND",
        {
          macroId: sanitizeText(macroId)
        }
      );
    }

    const steps = Array.isArray(descriptor.steps) ? descriptor.steps.slice() : [];
    if (steps.length === 0) {
      return toResult(
        "failed",
        "Macro Run",
        ["Macro has no steps."],
        "MACRO_EMPTY",
        {
          macroId: descriptor.macroId
        }
      );
    }

    if (steps.length > this.maxSteps) {
      return toResult(
        "failed",
        "Macro Run",
        [`Macro exceeds max step count (${this.maxSteps}).`],
        "MACRO_STEP_LIMIT",
        {
          macroId: descriptor.macroId,
          stepCount: steps.length,
          maxSteps: this.maxSteps
        }
      );
    }

    const registeredCommands = typeof context?.listRegisteredCommands === "function"
      ? context.listRegisteredCommands()
      : [];

    const approvedNames = new Set(
      Array.isArray(registeredCommands)
        ? registeredCommands.map((name) => sanitizeText(name)).filter(Boolean)
        : []
    );

    const stepReports = [];
    for (let index = 0; index < steps.length; index += 1) {
      const step = sanitizeText(steps[index]);
      const commandName = parseCommandName(step);
      if (!commandName) {
        return toResult(
          "failed",
          "Macro Run",
          [`Step ${index + 1} is empty.`],
          "MACRO_STEP_INVALID",
          {
            macroId: descriptor.macroId,
            stepIndex: index
          }
        );
      }

      if (commandName.startsWith("macro.")) {
        return toResult(
          "failed",
          "Macro Run",
          [`Nested macro command is not allowed: ${commandName}`],
          "MACRO_NESTING_NOT_ALLOWED",
          {
            macroId: descriptor.macroId,
            stepIndex: index,
            commandName
          }
        );
      }

      if (approvedNames.size > 0 && !approvedNames.has(commandName) && commandName !== "help" && commandName !== "status") {
        return toResult(
          "failed",
          "Macro Run",
          [`Unapproved command in macro step: ${commandName}`],
          "MACRO_COMMAND_NOT_APPROVED",
          {
            macroId: descriptor.macroId,
            stepIndex: index,
            commandName
          }
        );
      }

      const execution = context.executeConsoleCommand(step, context?.baseContext || {});
      stepReports.push({
        step,
        status: sanitizeText(execution?.status) || "failed",
        code: sanitizeText(execution?.code) || "COMMAND_EXECUTION_FAILED"
      });

      if (sanitizeText(execution?.status) !== "ready") {
        return toResult(
          "failed",
          "Macro Run",
          [
            `macroId=${descriptor.macroId}`,
            `step=${index + 1}/${steps.length}`,
            `command=${commandName}`,
            `status=failed`,
            `code=${sanitizeText(execution?.code) || "COMMAND_EXECUTION_FAILED"}`
          ],
          "MACRO_STEP_FAILED",
          {
            macroId: descriptor.macroId,
            stepIndex: index,
            commandName,
            stepReports
          }
        );
      }
    }

    return toResult(
      "ready",
      "Macro Run",
      [
        `macroId=${descriptor.macroId}`,
        `stepCount=${steps.length}`,
        "status=ready"
      ],
      "MACRO_RUN_READY",
      {
        macroId: descriptor.macroId,
        stepCount: steps.length,
        stepReports
      }
    );
  }
}
