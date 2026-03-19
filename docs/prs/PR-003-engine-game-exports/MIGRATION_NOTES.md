PR-003 — migration notes

### Current Rule

This PR does not change exports in code.

It only documents how exports should be classified in the current architecture.

### Safe Follow-Up Direction

A later surgical PR may:
- mark concrete exports in docs
- add comments or markers in code if approved
- reduce accidental public exposure without breaking compatibility

### Not Allowed In This PR

- removing exports
- moving files
- rewriting imports
- changing runtime behavior
- changing execution paths

### Next Likely PR

A narrow follow-up PR should classify actual `engine/game` exports one-by-one against these rules and record them in docs under `/docs/prs`.
