/*
Toolbox Aid
David Quesenberry
03/30/2026
events.js
*/

import {
  WORLD_GAME_STATE_EVENT_TYPES,
  WORLD_GAME_STATE_SYSTEM_ID
} from './constants.js';
import { cloneDeep, isPlainObject } from './utils.js';

function createStateEventEnvelope({
  eventType,
  eventVersion = 1,
  producer = WORLD_GAME_STATE_SYSTEM_ID,
  timestampMs,
  correlationId,
  payload = {},
  targetSystem,
  tags,
  meta,
  now = Date.now
} = {}) {
  const normalizedType = String(eventType || '').trim();
  if (!normalizedType) {
    throw new Error('Event envelope requires eventType.');
  }

  const normalizedCorrelationId = String(correlationId || '').trim();
  if (!normalizedCorrelationId) {
    throw new Error('Event envelope requires correlationId.');
  }

  const resolvedTimestamp = Number.isFinite(Number(timestampMs)) ? Number(timestampMs) : Number(now());
  const envelope = {
    eventType: normalizedType,
    eventVersion: Math.max(1, Math.floor(Number(eventVersion) || 1)),
    producer: String(producer || WORLD_GAME_STATE_SYSTEM_ID).trim() || WORLD_GAME_STATE_SYSTEM_ID,
    timestampMs: resolvedTimestamp,
    correlationId: normalizedCorrelationId,
    payload: isPlainObject(payload) ? cloneDeep(payload) : {}
  };

  if (targetSystem !== undefined) envelope.targetSystem = String(targetSystem);
  if (Array.isArray(tags)) envelope.tags = tags.map((tag) => String(tag));
  if (isPlainObject(meta)) envelope.meta = cloneDeep(meta);
  return envelope;
}

function createTransitionAppliedEvent({
  eventType = WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED,
  transitionName,
  correlationId,
  producer = WORLD_GAME_STATE_SYSTEM_ID,
  changes = [],
  payload = {},
  meta,
  now = Date.now
} = {}) {
  return createStateEventEnvelope({
    eventType,
    correlationId,
    producer,
    payload: {
      transitionName: String(transitionName || ''),
      changes: Array.isArray(changes) ? changes.slice() : [],
      summary: isPlainObject(payload) ? cloneDeep(payload) : {}
    },
    meta,
    now
  });
}

function createTransitionRejectedEvent({
  transitionName,
  correlationId,
  producer = WORLD_GAME_STATE_SYSTEM_ID,
  reason,
  code = 'TRANSITION_REJECTED',
  payload = {},
  meta,
  now = Date.now
} = {}) {
  return createStateEventEnvelope({
    eventType: WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_REJECTED,
    correlationId,
    producer,
    payload: {
      transitionName: String(transitionName || ''),
      reason: String(reason || 'Transition rejected.'),
      code: String(code),
      summary: isPlainObject(payload) ? cloneDeep(payload) : {}
    },
    meta,
    now
  });
}

export {
  createStateEventEnvelope,
  createTransitionAppliedEvent,
  createTransitionRejectedEvent
};
