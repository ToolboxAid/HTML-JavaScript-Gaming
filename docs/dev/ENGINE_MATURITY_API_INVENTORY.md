# Engine Maturity API Inventory

## Purpose
Define the proven public debug surfaces that may be promoted, and the internal surfaces that remain non-public.

## Promotion Gate (required)
A surface is promotable only if all are true:
1. already used by multiple debug workflows
2. behavior is deterministic and documented
3. does not expose private state shape
4. can be versioned with backward-compatibility notes

## Public Debug API Seams
### Commands
- command pack registration seam
- command discovery/listing seam
- standardized command output contract

### Panels
- panel registration seam
- panel descriptor metadata seam (`id`, `title`, `priority`, `enabled`)
- panel summary render seam

### Providers
- provider registration seam
- read-only snapshot seam
- bounded refresh/poll semantics

### Runtime Control
- debug surface visibility seam (console/overlay)
- deterministic debug render-order seam

## Plugin Lifecycle Seams
- `register(context)`
- `enable(context)`
- `disable(context)`
- `dispose(context)`

## Internal (Do Not Promote)
- internal overlay composition internals
- private runtime state containers
- persistence internals
- sample-specific wiring and hacks
- experimental inspector internals

## Boundary Rule
Promote seams, not implementation details.
