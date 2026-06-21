# PR_26171_BETA_077-tts-profile-parent-child-table

## Team Ownership
- TEAM: BETA
- Ownership source: docs_build/dev/PROJECT_MULTI_PC.txt
- Scope confirmed: Text To Speech / TTS Studio work is owned by Team BETA.

## Summary
- Converted the TTS Profile add action into an inline parent-table action row.
- Converted the Emotion Setting add action into an inline child-table action row.
- Restricted profile expansion to the Profile Name cell so non-control parent cells remain table data.
- Added keyboard support and aria-expanded state for the Profile Name accordion trigger.

## Scope Guard
- Theme V2 only.
- External JS only.
- No inline styles, style blocks, inline handlers, page-local CSS, or tool-local CSS.
- No duplicate left-column controls added.
- Delivery and Preset values remain in the Emotion Settings child table.
