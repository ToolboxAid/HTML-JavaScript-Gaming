# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: low

Apply PR_10_25_SAMPLE_METADATA_SSOT_DUPLICATE_EVIDENCE_FIX.

- Preserve samples/metadata/samples.index.metadata.json as the only live SSoT.
- Remove, move, or clearly demote the duplicate report evidence copy.
- Do not keep a repo-relative duplicate that looks like runtime source.
- Confirm runtime/tool code references only the live SSoT.
- Do not rewrite sample metadata content.
- Do not modify start_of_day folders.
- Add validation report.
- Return ZIP artifact at tmp/PR_10_25_SAMPLE_METADATA_SSOT_DUPLICATE_EVIDENCE_FIX_delta.zip.
