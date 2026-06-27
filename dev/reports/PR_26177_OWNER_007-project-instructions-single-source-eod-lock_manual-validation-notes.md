# Manual Validation Notes - PR_26177_OWNER_007-project-instructions-single-source-eod-lock

Status: PASS

- Reviewed requested DoD and roadmap files before moving them.
- Verified listed files are legacy/superseded by current active governance in docs_build/dev/ProjectInstructions/.
- Used the existing root archive tree under archive/docs_build/dev/.
- Moved the listed DoD file to archive/docs_build/dev/dod/.
- Moved the listed roadmap files to archive/docs_build/dev/roadmaps/.
- Removed docs_build/dev/dod/ after it became empty.
- Left docs_build/dev/roadmaps/ in place because unlisted roadmap files remain there.
- Added docs_build/dev/reports/legacy-docs-archive-report.md.
- Updated active preservation guidance away from docs_build/dev/ProjectInstructions/archive/ and toward root archive history.
- Merged latest origin/main into the PR branch for EOD and regenerated the generated Codex report files that conflicted.
- Confirmed active governance remains only under docs_build/dev/ProjectInstructions/.
- Confirmed no product/runtime files changed.
- Confirmed no start_of_day files changed.
- Playwright was not run; documentation/governance-only change.
