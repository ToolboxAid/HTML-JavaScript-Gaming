Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_3_OBJECTIVE_PATTERN_INVENTORY.md

# Level 10.3 Objective Pattern Inventory

## Reusable Objective Types

### Survive For Duration
Use when:
- player or entity must persist through a timed window

Signals:
- elapsed time
- alive-state or failure flag from local game context

### Reach Location / Trigger Zone
Use when:
- mission should validate traversal or spatial arrival

Signals:
- local position facts
- trigger-zone entry outcomes already resolved in game layer

### Defeat Target / Clear Wave
Use when:
- mission should complete after enemy or wave removal

Signals:
- remaining enemy count
- specific target eliminated flag
- world-state wave context

### Collect Count / Deliver Item
Use when:
- mission depends on item acquisition or transfer

Signals:
- collected-count facts
- delivery completion flags

### Protect / Escort Entity
Use when:
- mission depends on keeping an entity alive or within a safe route/state

Signals:
- target alive-state
- progress checkpoints
- local escort-state facts

### Sequenced Objectives
Use when:
- mission must unlock steps in order

Signals:
- prior objective completion
- phase-specific activation rules

### Branching Mission Steps
Use when:
- alternate success paths or optional route variations are needed

Signals:
- branch conditions from local game facts
- completion choice flags

### Timed Bonus Objectives
Use when:
- optional reward windows should coexist with a primary mission

Signals:
- event windows
- explicit timers
- score or collection thresholds

## Boundary Rule
Objective types stay generic. Their flavor, wording, rewards, and exact presentation remain local to the game/sample layer.
