# APPLY_PR_LOW_TOKEN_START_OF_DAY_AND_ROADMAP_MOVE

## PR Purpose
Apply the approved start_of_day workflow tightening and relocate roadmap tracker files from `docs/roadmaps/` to `docs/dev/roadmaps/`.

## Applied Scope
- updated ChatGPT start_of_day control files for lower-token BUILD discipline
- updated Codex start_of_day control files for smaller, more exact execution
- refreshed start_of_day helper summaries
- moved roadmap tracker files into `docs/dev/roadmaps/`
- updated direct references found in active dev/docs files included in this bundle

## Notes
- roadmap contents were preserved as-is during relocation
- roadmap tracking rules still allow bracket-state changes only
- this bundle is non-destructive as packaged: it adds the new roadmap location and includes a manifest for removing the old location after apply

## Post-Apply Cleanup
After applying this delta, remove the old roadmap paths:
- `docs/roadmaps/BIG_PICTURE_ROADMAP.md`
- `docs/roadmaps/NETWORK_SAMPLES_PLAN.md`
- `docs/roadmaps/PRODUCTIZATION_ROADMAP.md`
- `docs/roadmaps/big_picture_roadmap_text.md`

If using git, prefer `git mv` during apply so history follows the files.
