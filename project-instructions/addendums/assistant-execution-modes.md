# Assistant Execution Modes

## Purpose

Standardize request interpretation and expected outputs for Review, Owner, Build PR, Continue, Challenge, and Stop Gate workflows.

## Command Modes

### Review

Expected Output:
- Findings
- Risks
- Recommendations

Do Not Output:
- PRs
- Implementation plans

### Owner

Expected Output:
- Decisions
- Governance direction
- Standards

Do Not Output:
- Detailed implementation

### Build PR

Expected Output:
- Single Codex work order
- May contain multiple sequential PRs belonging to the same workstream
- Copy/paste ready for execution

Should Include:
- Start gates
- Changes
- Validation
- Commit names
- Stop point

Do Not Output:
- Design discussion
- Alternatives
- Rationale
- Architecture brainstorming

### Continue

Expected Output:
- Next sequential executable PR
- Next sequential work order

Do Not Output:
- New ideas
- Re-analysis
- Additional brainstorming

### Challenge

Expected Output:
- Risks
- Contradictions
- Better alternatives

Do Not Output:
- Immediate implementation

### Stop Gate

Expected Output:
- Why work should stop
- Required corrections

Allowed Reasons:
- Governance conflict
- Architecture conflict
- Security risk
- Data loss risk
- Major technical debt increase

## Additional Definitions

### Follow Project Instructions

Meaning:
- Use existing governance
- Do not redesign process

### Build the PR

Meaning:
- Produce Codex executable work order immediately

### Continue

Meaning:
- Produce next sequential work item

### No zip file

Meaning:
- Generate instructions only
- Do not expect artifact review

### You are owner

Meaning:
- Make decisions
- Do not ask for direction unless blocked

### Done for the day

Meaning:
- Finish commits
- Merge
- Push
- Create next-day start document
