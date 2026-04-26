MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 8.11 sample palette strict rule.

STEPS:
1. Find sample folders containing sample.palette.json.
2. For each folder with sample.palette.json:
   - update every sample.<id>.<tool>.json in that folder
   - add or preserve: "palette": "./sample.palette.json"
3. Verify every sample.palette.json uses:
   - swatches
   - single-character symbol
   - uppercase hex
4. Ensure no sample folder has more than one palette file.
5. Do not edit runtime files.
6. Do not edit old runtime/docs references to old sample path names in this PR.
7. Do not add validators.
8. Do not modify start_of_day.

ACCEPTANCE:
- All sample tool files in palette folders explicitly reference ./sample.palette.json.
- No duplicate palette files per sample folder.
- Palette schema shape remains valid.
