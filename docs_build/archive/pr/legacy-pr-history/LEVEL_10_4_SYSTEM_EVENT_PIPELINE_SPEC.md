Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_4_SYSTEM_EVENT_PIPELINE_SPEC.md

# Level 10.4 - System Event Pipeline Spec

## Objective
Define a centralized pipeline contract for public system events so optional and advanced systems can compose without direct coupling.

## Pipeline Model
1. Producer system emits a public event through its public API boundary.
2. Event pipeline validates event envelope and payload contract.
3. Event pipeline routes to subscribed consumers by event type.
4. Consumers process event with local logic only; no producer internals are referenced.

## Event Envelope Contract
Required fields:
- `eventType` (string, namespaced)
- `eventVersion` (integer, starts at 1)
- `producer` (string system id)
- `timestampMs` (number, monotonic source where possible)
- `correlationId` (string; stable across one logical action)
- `payload` (object; event-specific)

Optional fields:
- `targetSystem` (string)
- `tags` (string[])
- `meta` (object, non-authoritative)

## Ordering and Delivery
- Delivery guarantee: best-effort in-process dispatch
- Ordering scope: per producer, per tick/frame
- Cross-producer ordering: not guaranteed
- Consumer execution: isolated; failures are contained and reported

## Failure Handling
- Contract validation failure: reject event, record structured error
- Consumer exception: isolate failure, continue delivering remaining subscribers
- Unknown event type: ignore by default unless strict mode is enabled

## Compatibility Rules
- Additive payload changes are preferred
- Breaking payload changes require event version increment
- Producer and consumer must both declare supported versions

## Non-Goals
- no transport-layer redesign
- no event sourcing mandate
- no gameplay-rule ownership in the pipeline
