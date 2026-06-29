/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeEventSystem.test.mjs
*/

import assert from "node:assert/strict";
import { evaluateRuntimeConditions } from "../../../www/src/engine/runtime/runtimeConditionSystem.js";
import {
  RUNTIME_EVENT_ERRORS,
  publishRuntimeEvents,
} from "../../../www/src/engine/runtime/runtimeEventSystem.js";
import { createRuntimeGameRuleFixture } from "./RuntimeGameRuleFixture.mjs";

export function run() {
  const fixture = createRuntimeGameRuleFixture();
  const conditionResult = evaluateRuntimeConditions(fixture.conditionDefinitions, fixture.runtimeFacts);
  const eventResult = publishRuntimeEvents(conditionResult.conditionMatches, fixture.runtimeEvents);

  assert.equal(eventResult.valid, true);
  assert.equal(eventResult.publishedEvents.length, 6);
  assert.equal(eventResult.runtimeEvents.length, 7);
  assert.equal(eventResult.runtimeEvents[0].eventId, "event.runtime.frameStart.0");
  assert.equal(eventResult.publishedEvents[0].eventId, "event.event.coinCollision.condition.coin.collision.0");
  assert.deepEqual(eventResult.publishedEvents.map((event) => event.eventType), [
    "event.coinCollision",
    "event.exitOverlap",
    "event.timerReady",
    "event.scoreReady",
    "event.enemyDestroyed",
    "event.coinSpawned",
  ]);

  const invalidResult = publishRuntimeEvents([
    {
      conditionId: "condition.invalid",
      payload: {},
    },
  ], []);

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_EVENT_ERRORS.EVENT_TYPE_REQUIRED]);

  const invalidRuntimeEventsResult = publishRuntimeEvents([], [
    {
      eventType: "event.frameStart",
      payload: {},
    },
    {
      eventId: "event.runtime.frameStart.1",
      payload: {},
    },
    "not-an-event-record",
  ]);

  assert.equal(invalidRuntimeEventsResult.valid, false);
  assert.deepEqual(invalidRuntimeEventsResult.errors.map((error) => error.code), [
    RUNTIME_EVENT_ERRORS.EVENT_ID_REQUIRED,
    RUNTIME_EVENT_ERRORS.EVENT_TYPE_REQUIRED,
    RUNTIME_EVENT_ERRORS.RUNTIME_EVENT_INVALID,
  ]);

  const sourceRuntimeEvent = {
    eventId: "event.runtime.frameStart.2",
    eventType: "event.frameStart",
    payload: {
      tick: 2,
    },
  };
  const sourceConditionMatch = {
    conditionId: "condition.score.ready",
    eventType: "event.scoreReady",
    payload: {
      score: 100,
    },
  };
  const clonedResult = publishRuntimeEvents([sourceConditionMatch], [sourceRuntimeEvent]);
  sourceRuntimeEvent.payload.tick = 99;
  sourceConditionMatch.payload.score = 999;

  assert.equal(clonedResult.runtimeEvents[0].payload.tick, 2);
  assert.equal(clonedResult.publishedEvents[0].payload.score, 100);
  assert.throws(() => {
    clonedResult.runtimeEvents.push({});
  }, TypeError);
  assert.throws(() => {
    clonedResult.runtimeEvents[0].eventId = "event.changed";
  }, TypeError);

  const nativeStructuredClone = globalThis.structuredClone;
  globalThis.structuredClone = undefined;
  try {
    const fallbackRuntimeEvent = {
      eventId: "event.runtime.frameStart.3",
      eventType: "event.frameStart",
      payload: {
        tick: 3,
      },
    };
    const fallbackResult = publishRuntimeEvents([], [fallbackRuntimeEvent]);
    fallbackRuntimeEvent.payload.tick = 333;

    assert.equal(fallbackResult.valid, true);
    assert.equal(fallbackResult.runtimeEvents[0].payload.tick, 3);
  } finally {
    globalThis.structuredClone = nativeStructuredClone;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
