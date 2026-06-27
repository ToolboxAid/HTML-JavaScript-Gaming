# BUILD PR — Games Thruster Full Folder Migration

## Purpose
Execute full template-based migration for `games/Thruster/**`.

## Steps
1. _template → Thruster_next
2. migrate gameplay
3. validate _next
4. clear canonical
5. copy back
6. validate
7. remove _next

## Rules
- No other games touched
- No engine refactor
- Fail fast on ambiguity
