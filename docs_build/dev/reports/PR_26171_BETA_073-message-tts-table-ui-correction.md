# PR_26171_BETA_073-message-tts-table-ui-correction

Generated: 2026-06-20T23:06:25.711Z
Team ownership: BETA
Branch: pr/26171-BETA-073-message-tts-table-ui-correction
Base HEAD: eaee83f9327b336ec5679ebd591d94e50fab0523
origin/main at branch start: eaee83f9327b336ec5679ebd591d94e50fab0523
Ahead/behind before commit: 0	0
Spec source: latest user request in Codex session; no repository BUILD_PR doc for PR_26171_BETA_073 was found by targeted search.

## Purpose

Correct TTS and Message Studio UI alignment while preserving Theme V2, external JavaScript, existing Local API contracts, and server/API-backed product data ownership.

## Requirement Checklist

- PASS: TTS Studio appears on the toolbox index through the active registry path `toolbox/text-to-speech/index.html`.
- PASS: No `tools/text2speech/` path was created or linked.
- PASS: TTS summary uses a single Theme V2 inline row with TTS Studio, Characters, TTS Profiles, Emotion Settings, Voices, and Engine items.
- PASS: Message Studio keeps parent table `Messages`.
- PASS: Message name cell owns expand/collapse for the Message Parts child table; clicking the Parts count does not expand.
- PASS: Message Parts child table keeps ordered parts with Text, Emotion, TTS Profile, Status, and Actions.
- PASS: Add/Edit Message and Add/Edit Part remain inline row workflows.
- PASS: Play Message, Play Part, and Stop controls remain visible and validated.
- PASS: No separate Emotion Studio was created.
- PASS: No database tables or browser-owned product data source of truth were added.
- PASS: No inline styles, style blocks, inline event handlers, page-local CSS, or tool-local CSS were added.

## Implementation Summary

- Corrected Text To Speech registry metadata from uppercase `Beta` to authoritative `beta` release-channel metadata so the DB-backed toolbox registry exposes it as active/visible.
- Reworked the TTS summary from a five-card grid into a Theme V2 nowrap inline summary row.
- Moved Message Studio Add Message and Add Part actions into table rows.
- Tightened Message Studio expansion to the parent message name cell with keyboard support.
- Updated targeted and workspace tests for the corrected TTS registration and table behavior.

## Git Workflow

- Current branch: pr/26171-BETA-073-message-tts-table-ui-correction
- Created branch: `pr/26171-BETA-073-message-tts-table-ui-correction`
- Push result: pending until commit/push step completes.
- PR URL: pending until PR creation step completes.
- Merge result: pending until PR merge step completes.
- Final main commit: pending until post-merge sync completes.
