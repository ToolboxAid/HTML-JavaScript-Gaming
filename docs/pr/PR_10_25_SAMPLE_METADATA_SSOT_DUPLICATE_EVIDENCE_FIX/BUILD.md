# BUILD_PR_10_25_SAMPLE_METADATA_SSOT_DUPLICATE_EVIDENCE_FIX

Required Codex Work:
1. Compare the report evidence duplicate against samples/metadata/samples.index.metadata.json.
2. Keep samples/metadata/samples.index.metadata.json as the only live SSoT.
3. Remove, move, or clearly demote the report evidence duplicate so it cannot be mistaken for runtime source.
4. Confirm no runtime/tool code reads the report duplicate.
5. Add docs/dev/reports/PR_10_25_SAMPLE_METADATA_SSOT_DUPLICATE_EVIDENCE_FIX_report.md.

Constraints:
- No sample metadata rewrite
- No broad report cleanup
- No roadmap text rewrite
