# Codex Command — PR 11.56

Model: GPT-5.4
Reasoning: high

```powershell
codex exec --model gpt-5.4 --reasoning high "Run PR 11.56 exactly as documented in docs/pr/PR_11_56_METADATA_REFERENCE_CLEANUP.md. This is controlled cleanup mode. Remove up to exactly 8 audit NO JSON files only when there are no runtime references. If the only remaining reference is metadata/index JSON such as samples/metadata/samples.index.metadata.json, delete the unused JSON file and remove the stale metadata/index reference. Save before/after audit reports under docs/dev/reports. Prove the audit NO/missing-reference count decreases or fail the PR. Do not run the full samples suite unless shared loader/framework files are changed. Do not touch sample 1902, palette.json, or tile-map-editor-document.json. Do not rewrite roadmap content. Return a repo-structured ZIP at tmp/PR_11_56_METADATA_REFERENCE_CLEANUP.zip."
```
