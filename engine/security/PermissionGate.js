/*
Toolbox Aid
David Quesenberry
03/22/2026
PermissionGate.js
*/
export default class PermissionGate {
  constructor(rules = {}) {
    this.rules = rules;
  }

  can(role, capability) {
    return Boolean(this.rules[role]?.includes(capability));
  }
}
