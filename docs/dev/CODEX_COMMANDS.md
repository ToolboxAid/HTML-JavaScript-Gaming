MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_ROADMAP_REPAIR_ADDITIVE_MOVE_ONLY`.

Repair:
`docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

Hard rules:
- NO delete
- NO text rewrite
- NO summarization
- ONLY adds, moves, and status marker updates
- preserve every existing roadmap line somewhere in the repaired file

Required actions:
1. Repair roadmap structure using MOVE operations first
2. Preserve all existing text exactly as written
3. If duplicated/appended content exists:
   - move it into the correct location when clear
   - otherwise preserve it in an additive `Recovery / Preserved Content` section
4. Productization-rule style content:
   - move to the correct policy/instruction area if touched
   - do not delete
   - do not rewrite
5. Update status markers only where execution truth clearly supports it
6. Do not change any other wording

Validation output must explicitly confirm:
- no roadmap text deleted
- no roadmap wording changed
- only adds, moves, and status updates were used

Final packaging step is REQUIRED:
`<project folder>/tmp/BUILD_PR_ROADMAP_REPAIR_ADDITIVE_MOVE_ONLY.zip`

Hard rules:
- roadmap repair only
- no unrelated repo changes
- no missing ZIP
