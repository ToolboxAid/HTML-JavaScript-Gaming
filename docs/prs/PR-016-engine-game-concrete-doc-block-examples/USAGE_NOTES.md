PR-016 — usage notes

### When To Use Fuller Blocks

Use fuller blocks when:
- the export needs a clearer support explanation
- caller reassurance is important
- the documentation section is describing compatibility posture in more detail

### When To Use Shorter Blocks

Use shorter blocks when:
- the export appears in a summary list or compact API section
- the surrounding documentation already provides context
- brevity is needed without sacrificing compatibility confidence

### Writing Rules

- match the block family to the approved documentation posture
- preserve confidence for current callers
- keep transition-planning wording cautious and documentation-focused
- do not imply runtime changes unless an approved PR explicitly changes support policy

### Do Not

- mix supported-surface language with deprecation-style warnings
- imply that transition-planning-note surfaces are unsafe for current callers
- overstate future guarantees beyond what has been documented
