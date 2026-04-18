# PR_06_07_SAMPLE_LAUNCHER_FILTER_RESTORE

## Purpose
Restore the sample launcher phase dropdown and tag filter behavior without changing sample content or runtime behavior.

## Scope
- samples/index.html and only the direct assets/scripts/styles it depends on for launcher filter UI behavior
- no sample runtime changes
- no network simulation changes
- no launcher content restructuring beyond what is required to restore filters

## Required Work
1. Identify why the phase dropdown no longer renders/behaves correctly.
2. Identify why sample tags are no longer rendering/behaving correctly.
3. Restore phase dropdown population/interaction.
4. Restore tag rendering/filter interaction.
5. Preserve existing sample entries, phase ordering, and link targets.
6. Keep the fix surgical and execution-backed.

## Constraints
- no broad launcher redesign
- no sample data model redesign
- no behavior changes outside launcher filter restoration
- no changes to phase/sample content except what is required to restore filters

## Deliverables
- docs/reports/launcher_filter_regression_scan.txt
- docs/reports/launcher_filter_fix_map.txt
- docs/reports/validation_checklist.txt

## Validation
- phase dropdown renders and filters correctly
- tags render and filter correctly
- sample links remain intact
- no broken phase/sample navigation
- impacted smoke/manual validation passes

## Output
<project folder>/tmp/PR_06_07_SAMPLE_LAUNCHER_FILTER_RESTORE.zip
