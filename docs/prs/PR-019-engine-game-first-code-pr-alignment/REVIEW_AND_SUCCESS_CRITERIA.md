PR-019 — review and success criteria

### Review Checklist

- one PR = one purpose
- scope is limited to `engine/game` export files
- no runtime behavior changes
- no import rewrites
- no file moves
- no export removals or renames
- comments or markers are runtime-neutral
- compatibility-retained exports remain intact
- the diff is small, clear, and reversible

### Success Criteria

The first code PR is successful if:
- it makes documented intent clearer in code
- it preserves all existing compatibility surfaces
- it does not require caller changes
- it introduces no behavior ambiguity
- it passes review directly against PR-018 guardrails

### Failure Conditions

The first code PR fails scope if it:
- changes logic
- changes imports
- changes file locations
- mixes alignment with cleanup or restructuring
- creates doubt about caller safety
