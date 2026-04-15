/*
Toolbox Aid
David Quesenberry
04/15/2026
TransportContract.js
*/
const REQUIRED_TRANSPORT_METHODS = Object.freeze([
  'connect',
  'disconnect',
  'send',
  'drainInbox',
]);

function readConnectedFlag(transport) {
  if (typeof transport?.isConnected === 'function') {
    return Boolean(transport.isConnected());
  }
  if (typeof transport?.getConnectionState === 'function') {
    return transport.getConnectionState() === 'connected';
  }
  if (typeof transport?.getState === 'function') {
    const state = transport.getState();
    if (typeof state?.connected === 'boolean') {
      return state.connected;
    }
    if (typeof state?.connectionState === 'string') {
      return state.connectionState === 'connected';
    }
  }
  if (typeof transport?.connected === 'boolean') {
    return transport.connected;
  }
  return false;
}

export function getTransportContract() {
  return {
    requiredMethods: [...REQUIRED_TRANSPORT_METHODS],
    optionalIntrospection: ['isConnected()', 'getConnectionState()', 'getState()'],
    packetRules: {
      transportOwnedFields: ['createdAt', 'simulatedDelayMs'],
      requiredByCaller: ['type', 'sessionId', 'from', 'payload'],
    },
  };
}

export function assertTransportContract(transport, { name = 'transport' } = {}) {
  if (!transport || typeof transport !== 'object') {
    throw new TypeError(`${name} must be an object.`);
  }

  REQUIRED_TRANSPORT_METHODS.forEach((methodName) => {
    if (typeof transport[methodName] !== 'function') {
      throw new TypeError(
        `${name} must implement ${methodName}() to satisfy the transport contract.`,
      );
    }
  });

  return transport;
}

export function createTransportBoundary(transport, { name = 'transport' } = {}) {
  const validated = assertTransportContract(transport, { name });

  return {
    name,
    connect(remote) {
      return validated.connect(remote);
    },
    disconnect() {
      return validated.disconnect();
    },
    send(packet) {
      return validated.send(packet);
    },
    drainInbox() {
      return validated.drainInbox();
    },
    isConnected() {
      return readConnectedFlag(validated);
    },
    raw: validated,
  };
}

