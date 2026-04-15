
MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_RULE_EXTRACTION_AND_FINAL_NON_3D_CLOSEOUT

Steps:

PART 1 — RULE EXTRACTION
- scan roadmap
- identify rule-like statements
- move them to Rules section
- remove duplicates from task areas

PART 2 — VALIDATION
- classify each remaining non-3D item:
  complete / partial / incomplete

PART 3 — CLOSEOUT
- complete only minimal residue
- do not expand scope

PART 4 — REPORT
- what rules were moved
- what items were already complete
- what was completed now
- any blockers

HARD RULES:
- no 3D work
- no broad cleanup
- no duplicate rule text
- minimal changes only

PACKAGE:
<project folder>/tmp/BUILD_PR_RULE_EXTRACTION_AND_FINAL_NON_3D_CLOSEOUT.zip
