# PR_26130_014-tools-roadmap-tts-engine-planning

## Purpose

Add future Text to Speech engine roadmap items to the `tools/index.html` planned section.

## Scope

Changed only the `Planned Next` section in `tools/index.html` and the required local Codex report artifacts.

No unrelated roadmap content was modified. No `start_of_day` files were changed.

## Implementation Summary

Added planned-section cards for:

- Browser Speech Backend (speechSynthesis)
- Piper WASM Backend
- eSpeak NG WASM Backend
- Optional SSML Processing Layer
- Queue-Based Speech Playback
- Character Voice Presets
- Offline / Local Speech Support
- Raspberry Pi Speech Deployment
- Game Character Voice / Event Integration

The new entries use the existing planned grid/card/pill layout convention.

## Playwright Impact

Playwright impacted: No.

No Playwright impact. This PR is planned-section roadmap content only.

## Validation

Passed:

```text
git diff --check HEAD -- tools/index.html
rg -n -P "<script(?![^>]*\bsrc=)|<style|\son[a-zA-Z]+=" tools/index.html
```

The inline HTML restriction scan returned no matches. `git diff --check` reported only the existing Windows line-ending warning and no whitespace errors.

## Full Samples Smoke Test

Skipped. This PR changes only planned roadmap content in `tools/index.html`; no runtime sample loader, sample JSON, or game launch behavior changed.

## ZIP Artifact

Repo-structured delta ZIP:

```text
tmp/PR_26130_014-tools-roadmap-tts-engine-planning_delta.zip
```

## Manual Validation Steps

1. Open `tools/index.html` in a browser or local server.
2. Scroll to the `Planned Next` section.
3. Confirm the Text to Speech engine roadmap entries appear as planned cards using the same layout as the existing planned cards.
4. Confirm the existing planned cards remain present and unchanged.

Expected outcome: the planned section shows the new Text to Speech engine roadmap items without changing active tool launch behavior.

## Changed Files

- `tools/index.html`
- `docs_build/dev/reports/PR_26130_014-tools-roadmap-tts-engine-planning.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
