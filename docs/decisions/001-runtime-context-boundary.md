# ADR 001: Runtime Context Boundary

## Status

Proposed.

## Context

The runtime context often becomes the place where state, services, orchestration, and convenience helpers all accumulate. When that happens, it turns into a god object and weakens subsystem boundaries.

## Decision

Treat runtime context as a coordination boundary, not a dumping ground.

It should be limited to:

- essential runtime state references
- explicitly shared services
- clearly named lifecycle access points

It should not become:

- a general utility holder
- a container for ad hoc game-specific state
- a shortcut around engine subsystem boundaries

## Consequences

### Positive

- ownership becomes easier to reason about
- subsystem boundaries remain clearer
- testing and refactoring become safer

### Negative

- some convenience access patterns may need to be removed or replaced
- short-term migration PRs may be required

## Follow-up questions

- Which current runtime consumers rely on broad context access?
- Which of those uses are public, internal, or private?
- What should move to dedicated subsystem APIs?
