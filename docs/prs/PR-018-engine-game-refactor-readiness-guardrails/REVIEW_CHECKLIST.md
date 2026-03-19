PR-018 — review checklist

### First-Code-PR Checklist

- one PR = one purpose
- scope is surgical
- no runtime behavior changes
- no export removals
- no export renames
- no file moves
- no import rewrites
- compatibility-retained exports remain intact
- comments/markers are runtime-neutral
- diff is easy to review and reverse if needed

### Suggested First-Code-PR Shape

Good first code PR examples:
- add non-breaking intent comments near compatibility-retained exports
- add runtime-neutral markers that reflect documented posture
- reinforce preferred public direction in comments without changing code flow

Bad first code PR examples:
- removing or renaming exports
- moving files or modules
- changing logic, branching, or execution order
- rewriting imports across callers
