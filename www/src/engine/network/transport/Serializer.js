/*
Toolbox Aid
David Quesenberry
03/22/2026
Serializer.js
*/

import { deepClone } from '../../../shared/json/clone.js';
export default class Serializer {
  constructor({ version = 1 } = {}) {
    this.version = version;
  }

  encode(type, payload, { version = this.version } = {}) {
    return JSON.stringify({
      type,
      version,
      payload: deepClone(payload),
    });
  }

  decode(text) {
    const parsed = JSON.parse(text);
    return {
      type: parsed.type,
      version: parsed.version ?? 1,
      payload: deepClone(parsed.payload),
    };
  }

  roundTrip(type, payload, options = {}) {
    return this.decode(this.encode(type, payload, options));
  }
}
