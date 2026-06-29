/*
Toolbox Aid
David Quesenberry
03/22/2026
PacketValidator.js
*/
export default class PacketValidator {
  constructor({ allowedTypes = [], maxPayloadBytes = 256 } = {}) {
    this.allowedTypes = new Set(allowedTypes);
    this.maxPayloadBytes = maxPayloadBytes;
  }

  validate(packet) {
    const typeAllowed = this.allowedTypes.size === 0 || this.allowedTypes.has(packet.type);
    const size = JSON.stringify(packet.payload || {}).length;
    const passed = Boolean(packet?.from) && typeAllowed && size <= this.maxPayloadBytes;
    return {
      passed,
      detail: passed ? 'Accepted.' : 'Rejected suspicious packet.',
      size,
    };
  }
}
