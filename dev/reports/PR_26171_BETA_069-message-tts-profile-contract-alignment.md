# PR_26171_BETA_069-message-tts-profile-contract-alignment

Generated: 2026-06-20T22:03:35.223Z

## TEAM Ownership

- TEAM owner: Bravo
- Ownership source: docs_build/dev/PROJECT_MULTI_PC.txt
- Message Studio maps to Bravo-owned Messages.
- TTS Studio maps to Bravo-owned Text To Speech / TTS.
- TextToSpeechEngine-adjacent playback maps to Bravo-owned Audio / TTS, with src/engine/audio retaining playback code ownership.

## Instruction Compliance

- Read docs_build/dev/PROJECT_INSTRUCTIONS.md: PASS
- Read docs_build/dev/PROJECT_MULTI_PC.txt: PASS
- Confirm TEAM token in PR name: PASS
- Confirm Bravo ownership for Message Studio, TTS Studio, and TextToSpeechEngine-adjacent playback: PASS
- Started from clean synced main before branch creation: PASS
- Branch created: pr/26171-BETA-069-message-tts-profile-contract-alignment

## Scope

Implemented a scoped Message/TTS alignment refresh on top of the historical PR_26171_069 work already on main:

- Message Studio visible contract now uses Emotion rather than Emotion Profile language.
- Default Local API TTS Profile seed is the required balanced profile.
- Message Studio validation and playback errors use the Message Parts contract wording.
- Message Studio Playwright coverage now verifies the Message Part edit row exposes Text, Emotion, and TTS Profile controls.

No separate Emotion Studio was created. No inline styles, style blocks, inline event handlers, page-local CSS, or tool-local CSS were added. No database schema changes were added.

## Git Workflow

- Current branch at report generation: pr/26171-BETA-069-message-tts-profile-contract-alignment
- Starting HEAD: 77462a96a3bb19f508e2d10a5aacbaa243a97fb1
- origin/main: 77462a96a3bb19f508e2d10a5aacbaa243a97fb1
- origin/main...HEAD: 0	0
- Push result: pending at report generation
- PR URL: pending at report generation
- Merge result: pending at report generation
- Final main commit: pending at report generation

## Changed Files Before Report Generation

```text
docs_build/dev/reports/coverage_changed_js_guardrail.txt
docs_build/dev/reports/dependency_gating_report.md
docs_build/dev/reports/dependency_hydration_reuse_report.md
docs_build/dev/reports/execution_graph_reuse_report.md
docs_build/dev/reports/failure_fingerprint_report.md
docs_build/dev/reports/filesystem_scan_reduction_report.md
docs_build/dev/reports/incremental_validation_report.md
docs_build/dev/reports/lane_compilation_report.md
docs_build/dev/reports/lane_deduplication_report.md
docs_build/dev/reports/lane_input_validation_report.md
docs_build/dev/reports/lane_manifests/workspace-contract.json
docs_build/dev/reports/lane_runtime_optimization_report.md
docs_build/dev/reports/lane_snapshot_report.md
docs_build/dev/reports/lane_snapshots/workspace-contract.json
docs_build/dev/reports/lane_warm_start_report.md
docs_build/dev/reports/lane_warm_starts/workspace-contract.json
docs_build/dev/reports/monolith_trigger_removal_report.md
docs_build/dev/reports/persistent_lane_manifest_report.md
docs_build/dev/reports/playwright_discovery_ownership_report.md
docs_build/dev/reports/playwright_discovery_scope_report.md
docs_build/dev/reports/playwright_structure_audit.md
docs_build/dev/reports/playwright_v8_coverage_report.txt
docs_build/dev/reports/retry_suppression_report.md
docs_build/dev/reports/slow_path_pruning_report.md
docs_build/dev/reports/static_validation_report.md
docs_build/dev/reports/targeted_file_manifest_report.md
docs_build/dev/reports/test_cleanup_performance_report.md
docs_build/dev/reports/test_cleanup_routing_report.md
docs_build/dev/reports/testing_lane_execution_report.md
docs_build/dev/reports/validation_cache_report.md
docs_build/dev/reports/zero_browser_preflight_report.md
src/dev-runtime/messages/messages-sqlite-service.mjs
tests/playwright/tools/MessagesTool.spec.mjs
toolbox/messages/index.html
toolbox/messages/messages.js
```

## Requirement Checklist

- Message Studio parent table = Messages: PASS
- Message row opens Message Parts child table/accordion: PASS
- Message Parts select Text, Emotion, and TTS Profile: PASS
- Default balanced TTS Profile exists until authored profiles are available: PASS
- No separate Emotion Studio: PASS
- TTS Studio parent table = TTS Profiles: PASS
- TTS Profile row opens Emotion Settings child table/accordion: PASS
- Emotion Settings belong to selected TTS Profile: PASS
- Man Profile 1 / Woman Profile 2 each expose Neutral, Happy, Angry, Scared: PASS
- Message Studio owns text and ordered message parts: PASS
- TTS Studio owns profiles and per-profile emotion values: PASS
- src/engine/audio owns playback: PASS
- Audio owns generated/played output: PASS
