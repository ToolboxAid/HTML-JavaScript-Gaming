MODEL: GPT-5.4
REASONING: medium

COMMAND:
Validate roadmap status using repo evidence only.

Scope:
- Read docs/dev/ROADMAP_RULES.md
- Do not implement code
- Do not change roadmap statuses directly
- Do not infer completion from partial structure

Required outputs:
1. docs/dev/reports/file_tree.txt
   - scoped file tree only
2. docs/dev/reports/validation_checklist.txt
   - criterion-by-criterion pass/fail with evidence
3. docs/dev/reports/change_summary.txt
   - concise facts found, missing evidence, and recommended status

Rules:
- Facts only
- No repo-wide scanning unless the roadmap line itself is repo-wide
- One roadmap line at a time
- Placeholder folders do not count as completion
- A recommendation may be [ ], [.] or [x], but only if justified by checklist evidence

Suggested execution pattern:
1. Load roadmap line and acceptance criteria
2. Scan only the minimum required repo area
3. Produce evidence-backed checklist
4. Recommend status without editing implementation files
