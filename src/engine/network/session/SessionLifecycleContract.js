/*
Toolbox Aid
David Quesenberry
04/15/2026
SessionLifecycleContract.js
*/
export const SESSION_STATES = Object.freeze({
  IDLE: 'idle',
  CONNECTING: 'connecting',
  HANDSHAKING: 'handshaking',
  ACTIVE: 'active',
  DISCONNECTING: 'disconnecting',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
});

const ALLOWED_TRANSITIONS = Object.freeze({
  [SESSION_STATES.IDLE]: [SESSION_STATES.CONNECTING, SESSION_STATES.FAILED],
  [SESSION_STATES.CONNECTING]: [
    SESSION_STATES.HANDSHAKING,
    SESSION_STATES.DISCONNECTED,
    SESSION_STATES.FAILED,
  ],
  [SESSION_STATES.HANDSHAKING]: [
    SESSION_STATES.ACTIVE,
    SESSION_STATES.DISCONNECTED,
    SESSION_STATES.FAILED,
  ],
  [SESSION_STATES.ACTIVE]: [
    SESSION_STATES.DISCONNECTING,
    SESSION_STATES.DISCONNECTED,
    SESSION_STATES.FAILED,
  ],
  [SESSION_STATES.DISCONNECTING]: [SESSION_STATES.DISCONNECTED, SESSION_STATES.FAILED],
  [SESSION_STATES.DISCONNECTED]: [SESSION_STATES.CONNECTING],
  [SESSION_STATES.FAILED]: [SESSION_STATES.CONNECTING],
});

export function getSessionLifecycleContract() {
  return {
    states: { ...SESSION_STATES },
    transitions: Object.entries(ALLOWED_TRANSITIONS).map(([from, to]) => ({
      from,
      to: [...to],
    })),
  };
}

export function createSessionLifecycle({
  sessionId = 'session',
  peerId = 'peer',
  role = 'client',
  initialState = SESSION_STATES.IDLE,
} = {}) {
  let state = initialState;
  const history = [
    {
      from: null,
      to: state,
      reason: 'initialized',
      step: 0,
    },
  ];

  function canTransition(nextState) {
    return ALLOWED_TRANSITIONS[state]?.includes(nextState) ?? false;
  }

  function transition(nextState, reason = 'unspecified') {
    if (!canTransition(nextState)) {
      return {
        ok: false,
        sessionId,
        peerId,
        role,
        from: state,
        to: nextState,
        reason,
      };
    }

    const previousState = state;
    state = nextState;
    history.push({
      from: previousState,
      to: nextState,
      reason,
      step: history.length,
    });
    return {
      ok: true,
      sessionId,
      peerId,
      role,
      from: previousState,
      to: state,
      reason,
    };
  }

  function getState() {
    return state;
  }

  function getSnapshot() {
    return {
      sessionId,
      peerId,
      role,
      state,
      history: history.map((entry) => ({ ...entry })),
    };
  }

  return {
    sessionId,
    peerId,
    role,
    canTransition,
    transition,
    getState,
    getSnapshot,
  };
}

