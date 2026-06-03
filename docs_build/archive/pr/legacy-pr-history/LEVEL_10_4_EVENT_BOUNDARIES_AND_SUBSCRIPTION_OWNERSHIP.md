Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_4_EVENT_BOUNDARIES_AND_SUBSCRIPTION_OWNERSHIP.md

# Level 10.4 - Producer/Consumer Boundaries and Subscription Ownership

## Producer Boundaries
Producer systems own:
- event emission timing
- payload correctness and version selection
- publishing only data they authoritatively own

Producer systems must not:
- access consumer state directly
- emit consumer-specific payload variants
- require subscriber presence for correctness

## Consumer Boundaries
Consumer systems own:
- subscription registration and unregistration
- local side effects from received events
- optional reaction policies and throttling

Consumer systems must not:
- rely on producer internals
- mutate shared producer-owned state
- assume cross-producer global ordering

## Subscription Ownership Model
- Scene/application composition root owns wiring lifecycle
- Each system declares its subscription set explicitly
- Unsubscribe responsibilities are owned by the registering system
- Disposable subscription handles are required for teardown safety

## Allowed Coupling
- producer -> pipeline
- pipeline -> consumer callback

## Forbidden Coupling
- producer -> consumer direct invocation
- consumer -> producer internal state read
- pipeline owning gameplay state transitions

## Lifecycle Guidance
- Register subscriptions during system initialization
- Pause/resume subscriptions only through explicit lifecycle controls
- Dispose all subscriptions at scene/system teardown

## Observability Requirements
- structured logs for subscription add/remove
- optional counters per event type
- contract validation failure metrics
