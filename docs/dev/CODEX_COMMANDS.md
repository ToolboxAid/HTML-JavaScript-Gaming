MODEL: GPT-5.3-codex
REASONING: low
COMMAND:
Run validation sweep across Level 17 samples:
- 1708, 1710
- 1709, 1711
- 1712
- 1713

Verify:
- Bottom-right overlay placement
- Non-Tab cycle key
- Correct stack ordering

Do not modify runtime or tests unless a blocking defect is found.
If defects are found, log them in reports.

Package results to <project folder>/tmp/
