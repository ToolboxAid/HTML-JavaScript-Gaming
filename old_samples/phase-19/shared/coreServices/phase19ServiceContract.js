/*
Toolbox Aid
David Quesenberry
04/16/2026
phase19ServiceContract.js
*/
export function isValidPhase19Service(service) {
  if (!service || typeof service !== 'object') return false;
  if (typeof service.id !== 'string' || service.id.trim().length === 0) return false;

  const hookNames = ['onRegister', 'onStart', 'onUpdate', 'onStop'];
  for (let i = 0; i < hookNames.length; i += 1) {
    const hook = service[hookNames[i]];
    if (hook !== undefined && typeof hook !== 'function') {
      return false;
    }
  }
  return true;
}

export function assertValidPhase19Service(service) {
  if (!isValidPhase19Service(service)) {
    throw new Error('Invalid Phase 19 service contract.');
  }
}
