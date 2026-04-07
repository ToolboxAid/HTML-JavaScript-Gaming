/*
Toolbox Aid
David Quesenberry
03/22/2026
SessionTrustValidator.js
*/
export default class SessionTrustValidator {
  validate(session, { now = Date.now() } = {}) {
    const ageMs = now - session.issuedAt;
    const passed = ageMs <= session.maxAgeMs && Boolean(session.nonce) && Boolean(session.playerId);
    return {
      passed,
      detail: passed ? 'Session trusted.' : 'Session stale or invalid.',
      ageMs,
    };
  }
}
