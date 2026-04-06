# Session Validation Gate

Use this as the single pre-delivery gate.

- Is this a PLAN, BUILD, APPLY, or combined PLAN + BUILD + APPLY bundle?
- Does the bundle match only one PR purpose?
- If BUILD: is it specific enough that Codex does not need to guess?
- If APPLY: did I remove any Codex command?
- Are roadmap files preserved with bracket-only changes?
- Did I avoid fake claims about code being written?
- Did I avoid touching start_of_day directories?
- Is the ZIP repo-structured and commit-ready or execution-ready?

## Rule
If any answer is "no":
- stop the bundle
- do not mark it ready
- do not send it to Codex
- fix the violation first
