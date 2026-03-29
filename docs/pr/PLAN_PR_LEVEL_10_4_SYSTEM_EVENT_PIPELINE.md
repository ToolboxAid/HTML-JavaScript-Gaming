# PLAN_PR_LEVEL_10_4_SYSTEM_EVENT_PIPELINE

## Goal
Introduce a centralized event pipeline to decouple systems (UI, Objectives, Engine).

## Architecture
modules/events/
  eventBus.js
  eventTypes.js
  eventDispatch.js

## Scope
- Create event bus
- Replace direct calls with events
- No behavior change

## Non-Goals
- No UI rewrite
- No engine modification
