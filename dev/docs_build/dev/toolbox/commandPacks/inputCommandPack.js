/*
Toolbox Aid
David Quesenberry
04/05/2026
inputCommandPack.js
*/

import {
  requireNoArgs,
  safeSection,
  standardDetails
} from "./packUtils.js";

export function createInputCommandPack() {
  return {
    packId: "input",
    label: "Input",
    description: "Input state and mapping hint commands.",
    commands: [
      {
        name: "input.last",
        summary: "Show latest input snapshot fields.",
        usage: "input.last",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const input = safeSection(context, "input");
          const keys = Object.keys(input).sort((left, right) => left.localeCompare(right));
          return {
            title: "Input Last",
            lines: keys.length > 0
              ? keys.map((key) => `${key}: ${String(input[key])}`)
              : ["No input snapshot fields available."],
            details: standardDetails({ input }),
            code: "INPUT_LAST"
          };
        }
      },
      {
        name: "input.map",
        summary: "Show current input command map hints.",
        usage: "input.map",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler() {
          return {
            title: "Input Map",
            lines: [
              "Shift+` => toggle console",
              "Ctrl+Shift+` => toggle overlay",
              "Ctrl+Shift+R => reload",
              "Ctrl+Shift+] => next panel",
              "Ctrl+Shift+[ => previous panel"
            ],
            code: "INPUT_MAP"
          };
        }
      }
    ]
  };
}
