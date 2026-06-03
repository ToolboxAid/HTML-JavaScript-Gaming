# REPORT_PR_10_24_SAMPLE_JSON_DESTINATION_NORMALIZATION

## Bundle Summary
This PR cleans up sample-owned JSON destination hints across all samples.

## Target Behavior
- No sample JSON points to `games/<project>/...`.
- No sample JSON suggests nonexistent `config/` destinations.
- Sample 1413 Workflow JSON destination becomes sample-local.
- Catalog data remains unchanged.
