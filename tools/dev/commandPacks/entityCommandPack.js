/*
Toolbox Aid
David Quesenberry
04/05/2026
entityCommandPack.js
*/

import {
  requireAtLeastArgs,
  requireNoArgs,
  safeSection,
  standardDetails,
  toLinePair
} from "./packUtils.js";

export function createEntityCommandPack() {
  return {
    packId: "entity",
    label: "Entities",
    description: "Entity counts and inspection commands.",
    commands: [
      {
        name: "entity.count",
        summary: "Show active entity count.",
        usage: "entity.count",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const entities = safeSection(context, "entities");
          return {
            title: "Entity Count",
            lines: [
              toLinePair("count", entities.count ?? 0),
              toLinePair("heroState", entities.heroState ?? "unknown")
            ],
            details: standardDetails({ entities }),
            code: "ENTITY_COUNT"
          };
        }
      },
      {
        name: "entity.list",
        summary: "List available entity summary fields.",
        usage: "entity.list",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const entities = safeSection(context, "entities");
          const keys = Object.keys(entities).sort((left, right) => left.localeCompare(right));
          return {
            title: "Entity List",
            lines: keys.length > 0
              ? keys.map((key) => `${key}: ${String(entities[key])}`)
              : ["No entity summary data available."],
            details: standardDetails({ entities }),
            code: "ENTITY_LIST"
          };
        }
      },
      {
        name: "entity.inspect",
        summary: "Inspect a specific entity summary field.",
        usage: "entity.inspect <field>",
        arguments: ["field"],
        validate({ args, commandName }) {
          return requireAtLeastArgs(1, { args, commandName });
        },
        handler(context, args) {
          const entities = safeSection(context, "entities");
          const key = String(args[0] || "");
          const value = entities[key];
          if (value === undefined) {
            return {
              status: "failed",
              title: "Entity Inspect",
              lines: [`Field "${key}" not found.`],
              details: standardDetails({ entities, key }),
              code: "ENTITY_FIELD_NOT_FOUND"
            };
          }
          return {
            title: "Entity Inspect",
            lines: [`${key}: ${String(value)}`],
            details: standardDetails({ key, value }),
            code: "ENTITY_INSPECT"
          };
        }
      }
    ]
  };
}
