# Codex Commands - PR_26126_026-locate-missing-samples

```bash
codex run "Create PR_26126_026-locate-missing-samples. Do not modify code. Perform a repo search to determine where sample IDs 0125, 0126, and 0127 are defined or referenced. Search for these IDs across samples, metadata, tool hints, and any index/registry files. Report exact file paths where they exist, or explicitly confirm they do not exist as folders under samples/phase-* directories. If they are referenced but missing physically, identify the source (metadata, index, or generator logic) that is producing them. Output findings only in docs/dev/reports/missing_samples_0125_0126_0127.txt. Produce review artifacts."
```

## Validation Commands

```bash
Get-ChildItem -Path samples -Directory -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -in @('0125','0126','0127') } | Select-Object -ExpandProperty FullName
rg -n --hidden --no-ignore --glob '!node_modules/**' --glob '!.git/**' --glob '!tmp/**' --glob '!**/*.svg' --glob '!**/*.png' --glob '!**/*.jpg' --glob '!**/*.jpeg' --glob '!**/*.gif' --glob '!**/*.zip' "\b(0125|0126|0127)\b" samples docs tools src scripts tests games package.json *.json *.md
Select-String -Path tools/preview-generator-v2/index.html -Pattern 'resolveSamplePhase|phaseDir.entries|hasIndexHtml|sampleEntries.push|sampleEntries.sort|No sample index.html' -Context 2,3
Select-String -Path @('scripts/generate-sample-manifest.mjs','scripts/generate-samples-index.mjs','scripts/generate-runtime-sample-previews.mjs') -Pattern 'readdir|phase-|index.html|samplesDir|sampleId|id' -Context 2,3
Select-String -Path samples/metadata/metadataReference.js,samples/metadata/samples.index.metadata.json -Pattern '0125|0126|0127|0124|0101|phase-01' -Context 1,2
rg -n "0225|0226|0227" samples/metadata/samples.index.metadata.json samples/index.html samples/index.render.js --glob '!**/*.svg'
rg -n -i "executeSample|execute sample|sample-card|samples-phase-list|samples-pinned-list|buildSampleRows|createSampleCard" samples/index.html samples/index.render.js samples/metadata/samples.index.metadata.json
git diff --check -- docs/dev/reports/missing_samples_0125_0126_0127.txt docs/dev/codex_commands.md docs/dev/commit_comment.txt
git diff --cached --name-only -- samples games start_of_day tools src scripts tests
npm run codex:review-artifacts
```

## Notes

No Playwright impact. This PR is search/report only and does not modify runtime code, samples, schemas, or tests.
