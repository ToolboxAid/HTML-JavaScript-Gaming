# Engine V2 Custom Extension Approval Lifecycle

## Scope

- Added the Custom Extension approval lifecycle statuses: `draft`, `private`, `submitted`, `aiValidated`, `aiRejected`, `humanApproved`, `humanRejected`, and `promotedCandidate`.
- Added the Admin Custom Extension Approval boundary as a contract/runtime boundary only.
- Kept AI validation advisory only: `aiValidated` and `aiRejected` do not make a Custom Extension publish eligible.
- Kept human approval as the publish eligibility gate: only `humanApproved` clears publish blocking.
- Kept unapproved Custom Extensions creator-private and publish-blocking.

## Boundaries

- OpenAI integration implementation: Not added.
- Admin UI implementation: Not added.
- Marketplace, Publishing, Toolbox rebuild, and sample work: Not touched.
- Runtime code execution for Custom Extensions: Not added.

## Validation

- PASS: `node --check src/engine/runtime/engineV2CustomExtensionsHookRuntime.js`
- PASS: `node --check tests/engine/EngineV2CustomExtensionsHookRuntime.test.mjs`
- PASS: `node tests/engine/EngineV2CustomExtensionsHookRuntime.test.mjs`

## Notes

- The approval boundary is represented by exported lifecycle/action constants and a pure resolver for valid status transitions.
- AI advisory outcomes remain visible in approval metadata but cannot bypass human approval.
