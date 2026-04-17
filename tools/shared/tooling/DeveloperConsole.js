/*
Toolbox Aid
David Quesenberry
03/22/2026
DeveloperConsole.js
*/
export default class DeveloperConsole {
  constructor() {
    this.commands = new Map();
    this.history = [];
  }

  register(command, handler) {
    this.commands.set(command, handler);
  }

  execute(input, context = {}) {
    const [command, ...args] = String(input || '').trim().split(/\s+/);
    const handler = this.commands.get(command);
    if (!handler) {
      const result = { ok: false, output: `Unknown command: ${command || 'empty'}` };
      this.history.push({ input, ...result });
      return result;
    }

    const output = handler(args, context);
    const result = typeof output === 'object' && output !== null
      ? { ok: output.ok !== false, output: output.output ?? '' }
      : { ok: true, output: String(output) };
    this.history.push({ input, ...result });
    return result;
  }
}
