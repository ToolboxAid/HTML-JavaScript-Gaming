# PR_26174_BRAVO_011-message-sentence-action-buttons

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Continued on the Bravo branch without returning to `main`.
- PASS: No merge was performed.
- PASS: No `start_of_day` folders were modified.

## Requirement Checklist
- PASS: Parent table remains `Game Text Repository` Messages.
- PASS: Parent Message table keeps columns `Message`, `TTS Profile`, `Updated`, `Actions`.
- PASS: Parent controls include Add Message, Edit Message, Save Message, Cancel Message, Delete/Archive Message, and Play Message.
- PASS: Parent Message rows expand to child Sentence rows.
- PASS: Child Sentence table keeps columns `Order`, `Text`, `Emotion`, `Actions`.
- PASS: Child controls include Add Sentence, Edit Sentence, Save Sentence, Cancel Sentence, Delete/Archive Sentence, and Play Sentence.
- PASS: Creator-facing Messages UI now uses Sentence/Sentences wording for the child records.
- PASS: Existing internal `segment` and `parts` identifiers are retained only where changing them would expand risk.
- PASS: Message Play queues ordered Sentences from the selected Message.
- PASS: Sentence Play uses the same Browser Speech runtime path for only the selected Sentence.
- PASS: Edit actions switch rows to Save/Cancel controls.
- PASS: Cancel leaves the previous row state intact.
- PASS: Message Delete remains blocked while the Message has Sentences, with Archive available.
- PASS: Sentence Archive/Restore is available as the preferred non-destructive action.
- PASS: Messages page does not show `Reusable Assets Emotion Profiles`, `Emotion Profiles`, or `Voice Profiles` sections.
- PASS: Messages page does not add pitch, rate, volume, voice, or provider ownership controls.
- PASS: No inline styles, style blocks, inline handlers, or HTML script blocks were added.
- PASS: No browser-owned authoritative product data was added.
- PASS: Errors added or changed are Creator-safe.

## Validation Lane Report
- PASS: `node --check toolbox/messages/messages.js`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: `rg -n --pcre2 "<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)" toolbox/messages/index.html` returned no matches.
- PASS: `rg -n "localStorage|sessionStorage|imageDataUrl|Reusable Assets|Emotion Profiles|Voice Profiles|Message Parts" toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` found only negative Playwright assertions for forbidden labels.
- PASS: `git diff --check -- toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` completed with no whitespace errors. Git emitted existing CRLF normalization warnings.
- BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright` could not launch because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- BLOCKED: `npm run test:workspace-v2` reached the same missing Chromium blocker after its non-browser audits completed.

## Manual Validation Notes
- Reviewed `toolbox/messages/index.html` and confirmed the Inspector label now says `Sentence`, not `Part`.
- Reviewed `toolbox/messages/messages.js` and confirmed Sentence rows render Edit, Archive/Restore, Delete, and Play actions.
- Reviewed playback flow and confirmed Message Play maps ordered Sentences through `speechItemFromSegment`, while Sentence Play queues only the selected Sentence.
- Reviewed Messages ownership and confirmed no profile management tables or TTS setting sliders were added to Messages.
- Browser click-through validation is pending a local Playwright Chromium install.

## Review Artifacts
- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26174_BRAVO_011-message-sentence-action-buttons_delta.zip`
