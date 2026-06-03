# BUILD_PR_LEVEL_11_154_FIX_SVG_PAYLOAD_DETECTION_NOT_LABEL

## Purpose
Fix the root issue: Workspace Manager is NOT detecting the SVG payload at all, not just labeling it.

## Problem
SVG Asset Studio still shows:

Asset: none

This means:
Workspace Manager does NOT see `vectorAssetDocument` as valid data.

This is NOT just a label issue — detection logic is wrong.

## STRICT SCOPE

ALLOWED FILES:
- tools/workspace-manager/main.js

ALLOWED CHANGES:
- fix payload detection for svg-asset-studio ONLY

## ROOT CAUSE

Workspace Manager likely checks wrong keys such as:
- payload.*
- asset.*
- wrong casing
- wrong nesting

But actual data is:

tools["svg-asset-studio"].vectorAssetDocument

## REQUIRED FIX

Detection logic must:

1. Check:
   workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument

2. Confirm existence of:
   - svgText OR sourceName

3. Mark tool as populated if present

## DO NOT

- modify schema
- modify sample
- modify svg tool
- add fallback
- transform payload
- generalize logic for all tools

ONLY fix SVG detection path

## VALIDATION

Must verify:

- vectorAssetDocument exists
- svgText exists
- Workspace Manager detects it
- card is no longer "none"

## REPORT

docs_build/dev/reports/svg_payload_detection_fix_11_154.txt

Include:
- detection logic before
- detection logic after
- verification result

## FAILURE

FAIL if still shows "Asset: none"
