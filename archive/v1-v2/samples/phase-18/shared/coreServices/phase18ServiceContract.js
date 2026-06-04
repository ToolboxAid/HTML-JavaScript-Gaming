/*
Toolbox Aid
David Quesenberry
04/16/2026
phase18ServiceContract.js
*/
export function isValidPhase18Service(service) {
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

export function assertValidPhase18Service(service) {
  if (!isValidPhase18Service(service)) {
    throw new Error('Invalid Phase 18 service contract.');
  }
}
