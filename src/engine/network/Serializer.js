/*
Toolbox Aid
David Quesenberry
03/22/2026
Serializer.js
*/
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default class Serializer {
  constructor({ version = 1 } = {}) {
    this.version = version;
  }

  encode(type, payload, { version = this.version } = {}) {
    return JSON.stringify({
      type,
      version,
      payload: clone(payload),
    });
  }

  decode(text) {
    const parsed = JSON.parse(text);
    return {
      type: parsed.type,
      version: parsed.version ?? 1,
      payload: clone(parsed.payload),
    };
  }

  roundTrip(type, payload, options = {}) {
    return this.decode(this.encode(type, payload, options));
  }
}
