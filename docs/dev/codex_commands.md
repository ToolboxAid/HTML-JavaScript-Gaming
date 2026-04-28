# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_10_14_FULLSCREEN_HEADER_SUMMARY_LINE_FIX.

Use a surgical shared-platform fix only.

Required:
- Fix fullscreen header summary so caret + tool name/description remain on one line.
- Prevent fullscreen-only platform summary/error presentation from affecting normal screen.
- Preserve diagnostics without creating a multi-line visible error header in normal screen.
- Do not change tool data, manifests, registry entries, or start_of_day folders.
- Add validation report at docs/dev/reports/PR_10_14_FULLSCREEN_HEADER_SUMMARY_LINE_FIX_report.md.
- Return ZIP artifact at tmp/PR_10_14_FULLSCREEN_HEADER_SUMMARY_LINE_FIX_delta.zip.
