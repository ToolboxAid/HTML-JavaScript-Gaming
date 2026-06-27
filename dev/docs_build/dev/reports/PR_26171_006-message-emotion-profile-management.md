# PR_26171_006-message-emotion-profile-management

## Branch Validation

- Branch: `pr/PR_26171_006-message-emotion-profile-management`
- Source: created after `main` contained commit `3dcb965a3`
- Status: PASS for branch setup; merged under the user-approved Batch 1 execution instruction with workspace-v2 failure recorded below.

## Requirement Checklist

- PASS: Emotion profile payloads expose `messageUsageCount`, `segmentUsageCount`, `usageCount`, and `references`.
- PASS: Usage counts are computed from `messages_records.emotionProfileKey` and `messages_segments.emotionProfileKey`.
- PASS: Referenced emotion profiles cannot be deactivated.
- PASS: Blocked deactivation shows an actionable API/UI diagnostic.
- PASS: Emotion Profiles table displays usage count.
- PASS: Existing add/edit/Active behavior is preserved for unreferenced profiles.
- PASS: No delete endpoint was added.
- PASS: No Text To Speech, speech preview, voice adapter, runtime playback, or audio behavior was added.
- PASS: Theme V2 rules were preserved; no inline CSS, style block, inline script, or inline event handler was introduced.
- FAIL: Required `npm run test:workspace-v2` lane failed in existing `RootToolsFutureState.spec.mjs` coverage outside the Messages tool; failure is documented and treated as outside PR_006 scope.

## Validation Lane Report

- PASS: `node --check src/dev-runtime/messages/messages-sqlite-service.mjs`
- PASS: `node --check toolbox/messages/messages.js`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: Direct SQLite/API usage-count and referenced-deactivation probe.
- PASS: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`
- PASS: `git diff --check -- src/dev-runtime/messages/messages-sqlite-service.mjs toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs`
- FAIL: `npm run test:workspace-v2`

## Workspace-V2 Failure Summary

`npm run test:workspace-v2` failed in `tests/playwright/tools/RootToolsFutureState.spec.mjs`:

- `root tools surface links current tool pages without old_* routes`: Toolbox accordion `.control-card` count was `0`.
- `common header renders primary navigation order across active pages`: existing alphabetical assertion expected `Game Hub` before `Game Journey`.
- `learn wireframe pages load with shared Theme V2 structure`: failed requests to `/api/session/current` and `/api/platform-settings/banner`.
- `tool template future-state page loads from root Theme V2 paths`: failed requests to `/api/session/current`, `/api/toolbox/registry/snapshot`, and `/api/platform-settings/banner`.
- `representative active tool pages align center cleanup and registry group colors`: failed requests to toolbox constants, session, platform banner, and registry APIs.

These failures are outside the PR_006 Messages emotion profile scope and were not fixed in this branch.

## Manual Validation Notes

- The Messages Playwright path creates a message using the `Urgent` profile and a segment using the same profile.
- The `Urgent` profile row displays usage count `2`.
- API deactivation of referenced `Urgent` returns HTTP 400 with the expected diagnostic.
- UI deactivation of referenced `Urgent` shows the expected diagnostic and leaves the profile Active.

## Samples Decision

- Full samples smoke was not run.
