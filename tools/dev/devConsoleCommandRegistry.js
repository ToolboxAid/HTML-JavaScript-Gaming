/*
Toolbox Aid
David Quesenberry
04/05/2026
devConsoleCommandRegistry.js
*/

import { sanitizeText } from "../../src/engine/debug/inspectors/shared/inspectorUtils.js";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toLines(lines) {
  if (!Array.isArray(lines)) {
    return [];
  }
  return lines.map((line) => String(line)).map((line) => sanitizeText(line)).filter(Boolean);
}

function parseCommandInput(input) {
  const line = sanitizeText(input);
  if (!line) {
    return {
      raw: "",
      command: "",
      args: []
    };
  }

  const tokens = line.split(/\s+/).filter(Boolean);
  return {
    raw: line,
    command: sanitizeText(tokens[0]),
    args: tokens.slice(1).map((token) => sanitizeText(token)).filter(Boolean)
  };
}

function createStandardOutput({
  status = "ready",
  title = "",
  lines = [],
  details = {},
  code = "OK"
} = {}) {
  return {
    status: status === "failed" ? "failed" : "ready",
    title: sanitizeText(title) || "Dev Console",
    lines: toLines(lines),
    details: isObject(details) ? details : {},
    code: sanitizeText(code) || (status === "failed" ? "COMMAND_FAILED" : "OK")
  };
}

function createFailure(title, code, lines = [], details = {}) {
  return createStandardOutput({
    status: "failed",
    title,
    lines,
    details,
    code
  });
}

function validatePack(pack) {
  if (!isObject(pack)) {
    return "Pack must be an object.";
  }
  const packId = sanitizeText(pack.packId);
  if (!packId) {
    return "Pack packId is required.";
  }
  if (!Array.isArray(pack.commands)) {
    return "Pack commands must be an array.";
  }
  for (let index = 0; index < pack.commands.length; index += 1) {
    const command = pack.commands[index];
    if (!isObject(command)) {
      return `Pack ${packId} command at index ${index} must be an object.`;
    }
    const name = sanitizeText(command.name);
    if (!name) {
      return `Pack ${packId} command at index ${index} requires name.`;
    }
    if (!name.startsWith(`${packId}.`)) {
      return `Command ${name} must be namespaced with ${packId}.`;
    }
    if (typeof command.handler !== "function") {
      return `Command ${name} handler must be a function.`;
    }
    if (!sanitizeText(command.summary)) {
      return `Command ${name} summary is required.`;
    }
    if (!sanitizeText(command.usage)) {
      return `Command ${name} usage is required.`;
    }
    if (command.validate !== undefined && typeof command.validate !== "function") {
      return `Command ${name} validate must be a function when provided.`;
    }
  }
  return "";
}

function normalizeHandlerOutput(commandName, result) {
  if (isObject(result) && (result.status || result.title || result.lines || result.code)) {
    return createStandardOutput({
      status: sanitizeText(result.status) || "ready",
      title: sanitizeText(result.title) || commandName,
      lines: toLines(result.lines),
      details: isObject(result.details) ? result.details : {},
      code: sanitizeText(result.code) || "OK"
    });
  }

  if (Array.isArray(result)) {
    return createStandardOutput({
      status: "ready",
      title: commandName,
      lines: toLines(result),
      code: "OK"
    });
  }

  if (result !== undefined && result !== null) {
    return createStandardOutput({
      status: "ready",
      title: commandName,
      lines: [String(result)],
      code: "OK"
    });
  }

  return createStandardOutput({
    status: "ready",
    title: commandName,
    lines: ["(ok)"],
    code: "OK"
  });
}

export function createDevConsoleCommandRegistry(options = {}) {
  const packMap = new Map();
  const commandMap = new Map();

  function registerPack(pack) {
    const error = validatePack(pack);
    if (error) {
      return createFailure("Command Pack Registration", "INVALID_COMMAND_PACK", [error], {
        pack
      });
    }

    const packId = sanitizeText(pack.packId);
    if (packMap.has(packId)) {
      return createFailure("Command Pack Registration", "COMMAND_PACK_DUPLICATE", [`Pack ${packId} is already registered.`], {
        packId
      });
    }

    const normalizedPack = {
      packId,
      label: sanitizeText(pack.label) || packId,
      description: sanitizeText(pack.description) || `${packId} command pack`,
      contextRequirements: Array.isArray(pack.contextRequirements)
        ? pack.contextRequirements.map((item) => sanitizeText(item)).filter(Boolean)
        : [],
      commands: pack.commands.map((command) => ({
        name: sanitizeText(command.name),
        summary: sanitizeText(command.summary),
        usage: sanitizeText(command.usage),
        arguments: Array.isArray(command.arguments)
          ? command.arguments.map((item) => sanitizeText(item)).filter(Boolean)
          : [],
        outputHint: sanitizeText(command.outputHint) || "text",
        validate: typeof command.validate === "function" ? command.validate : null,
        handler: command.handler
      }))
    };

    packMap.set(packId, normalizedPack);
    normalizedPack.commands.forEach((command) => {
      if (!commandMap.has(command.name)) {
        commandMap.set(command.name, {
          packId,
          command
        });
      }
    });

    return createStandardOutput({
      status: "ready",
      title: "Command Pack Registration",
      lines: [`Registered pack ${packId} (${normalizedPack.commands.length} commands).`],
      details: {
        packId,
        commandCount: normalizedPack.commands.length
      },
      code: "COMMAND_PACK_REGISTERED"
    });
  }

  function listPacks() {
    return Array.from(packMap.values()).sort((left, right) => left.packId.localeCompare(right.packId));
  }

  function listCommands() {
    return Array.from(commandMap.values())
      .map((entry) => entry.command)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  function renderHelp(args = []) {
    if (args.length === 0) {
      const packs = listPacks();
      const lines = [
        "Usage: help | help <pack> | help <command>"
      ];
      if (packs.length === 0) {
        lines.push("No command packs registered.");
      } else {
        lines.push("Packs:");
        packs.forEach((pack) => {
          lines.push(`- ${pack.packId} (${pack.commands.length}): ${pack.description}`);
        });
      }
      return createStandardOutput({
        title: "Help",
        lines,
        details: {
          packCount: packs.length,
          packs: packs.map((pack) => pack.packId)
        },
        code: "HELP_INDEX"
      });
    }

    const target = sanitizeText(args[0]);
    const commandEntry = commandMap.get(target);
    if (commandEntry) {
      const command = commandEntry.command;
      const lines = [
        command.summary,
        `Usage: ${command.usage}`
      ];
      if (command.arguments.length > 0) {
        lines.push(`Args: ${command.arguments.join(", ")}`);
      }
      lines.push(`Pack: ${commandEntry.packId}`);
      return createStandardOutput({
        title: `Help: ${command.name}`,
        lines,
        details: {
          command: command.name,
          packId: commandEntry.packId
        },
        code: "HELP_COMMAND"
      });
    }

    const pack = packMap.get(target);
    if (pack) {
      const lines = [
        pack.description,
        `Commands (${pack.commands.length}):`
      ];
      pack.commands
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .forEach((command) => {
          lines.push(`- ${command.name}: ${command.summary}`);
        });

      return createStandardOutput({
        title: `Help: ${pack.packId}`,
        lines,
        details: {
          packId: pack.packId,
          commandCount: pack.commands.length
        },
        code: "HELP_PACK"
      });
    }

    const failureCode = target.includes(".")
      ? "COMMAND_NOT_FOUND"
      : "COMMAND_PACK_NOT_FOUND";
    return createFailure("Help", failureCode, [`No help entry found for "${target}".`], {
      target
    });
  }

  function executeRuntimeFallback(commandName, context) {
    if (typeof context?.executeRuntimeCommand !== "function") {
      return null;
    }

    const runtimeOutput = context.executeRuntimeCommand(commandName, context);
    if (!runtimeOutput) {
      return null;
    }

    return createStandardOutput({
      status: sanitizeText(runtimeOutput.status) || "failed",
      title: sanitizeText(runtimeOutput.title) || `Runtime: ${commandName}`,
      lines: toLines(runtimeOutput.lines),
      details: isObject(runtimeOutput.details) ? runtimeOutput.details : {},
      code: sanitizeText(runtimeOutput.code) || "RUNTIME_COMMAND"
    });
  }

  function execute(commandInput, context = {}) {
    const parsed = parseCommandInput(commandInput);
    if (!parsed.command) {
      return createFailure("Command", "EMPTY_COMMAND", ["No command entered."]);
    }

    if (parsed.command === "help") {
      return renderHelp(parsed.args);
    }

    if (parsed.command === "status") {
      const runtimeState = typeof context?.consoleRuntime?.getState === "function"
        ? context.consoleRuntime.getState()
        : {};
      return createStandardOutput({
        title: "Status",
        lines: [
          `consoleVisible=${Boolean(runtimeState.consoleVisible)}`,
          `overlayVisible=${Boolean(runtimeState.overlayVisible)}`,
          `reloadGeneration=${Number.isFinite(runtimeState.reloadGeneration) ? runtimeState.reloadGeneration : 0}`
        ],
        details: runtimeState,
        code: "STATUS_INFO"
      });
    }

    const entry = commandMap.get(parsed.command);
    if (!entry) {
      const fallback = executeRuntimeFallback(parsed.command, context);
      if (fallback && fallback.status === "ready") {
        return fallback;
      }
      return createFailure("Command", "COMMAND_NOT_FOUND", [`Unknown command "${parsed.command}". Try "help".`], {
        command: parsed.command
      });
    }

    const command = entry.command;
    if (typeof command.validate === "function") {
      const validation = command.validate({
        args: parsed.args.slice(),
        context,
        commandName: command.name
      });
      if (validation && validation.ok === false) {
        return createFailure(
          sanitizeText(validation.title) || `Command: ${command.name}`,
          sanitizeText(validation.code) || "INVALID_COMMAND_ARGS",
          [sanitizeText(validation.message) || "Invalid command arguments."],
          isObject(validation.details) ? validation.details : {
            command: command.name
          }
        );
      }
    }

    try {
      const output = command.handler(context, parsed.args.slice());
      const normalized = normalizeHandlerOutput(command.name, output);
      return createStandardOutput({
        status: normalized.status,
        title: normalized.title,
        lines: normalized.lines,
        details: {
          ...normalized.details,
          command: command.name,
          packId: entry.packId,
          args: parsed.args.slice()
        },
        code: normalized.code
      });
    } catch (error) {
      return createFailure(
        `Command: ${command.name}`,
        "COMMAND_EXECUTION_FAILED",
        [error instanceof Error ? error.message : String(error)],
        {
          command: command.name,
          packId: entry.packId
        }
      );
    }
  }

  const initialPacks = Array.isArray(options.packs) ? options.packs : [];
  initialPacks.forEach((pack) => {
    registerPack(pack);
  });

  return {
    registerPack,
    execute,
    listPacks,
    listCommands,
    getPackCount() {
      return packMap.size;
    },
    getCommandCount() {
      return commandMap.size;
    }
  };
}

export function createConsoleOutput({
  status = "ready",
  title = "",
  lines = [],
  details = {},
  code = "OK"
} = {}) {
  return createStandardOutput({
    status,
    title,
    lines,
    details,
    code
  });
}
