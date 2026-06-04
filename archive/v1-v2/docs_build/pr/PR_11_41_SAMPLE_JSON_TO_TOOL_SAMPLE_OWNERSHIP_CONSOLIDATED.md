# PR 11.41 — Consolidated Sample JSON to Tool Sample Ownership

## Purpose
Consolidate PR 11.38, PR 11.39, and PR 11.40 into one clean instruction set.

This PR defines how sample JSON files must map to executable tool samples.

## Core Rule
If a sample JSON file exists, it must belong to the correct executable sample for the correct tool/use case.

A JSON file must either:
1. fit the current executable sample and be visibly used there, or
2. be deleted from that sample and moved/recreated under the correct sample/tool use case.

## Do Not Force Bad Fits
Do not blindly force a JSON file into a sample where it does not make sense.

If the JSON does not match the sample's purpose:
- remove it from that sample
- rehome it to the correct sample, or
- create/update the correct sample so the use case remains covered

## Coverage Rule
End result must preserve intended sample-to-tool/use-case coverage.

Do not reduce useful sample coverage just because a JSON file is misplaced.

## Sample 1902 Exception
Sample 1902 is explicitly excluded from single-tool JSON ownership enforcement.

Reason:
- Sample 1902 is a Workspace Manager / workspace integration sample.
- It is allowed to aggregate multiple tool payloads.
- It is not a single-tool executable sample.

For sample 1902:
- do not rehome/delete JSON because it contains multiple tool payloads
- only validate that its JSON supports workspace integration
- do not apply KEEP/MOVE/DELETE single-tool rules to it

## Required Audit
Audit active sample JSON files, excluding sample 1902 from single-tool enforcement decisions.

For each relevant JSON file:
- JSON path
- current owning sample
- intended tool/use case
- executable entry point
- does it fit current sample?
- is it loaded?
- does it visibly affect the sample/tool?
- decision:
  - KEEP + WIRE
  - MOVE / REHOME
  - DELETE
  - CREATE / UPDATE CORRECT SAMPLE
  - EXEMPT WORKSPACE SAMPLE

## Required Implementation
Apply the smallest safe changes based on the audit.

Fix high-confidence mismatches only.

If a mismatch is uncertain, document it for the next PR instead of guessing.

## Scope
- Sample JSON ownership and executable sample alignment only.
- Do not change unrelated tool behavior.
- Do not undo SVG Asset Studio rename.
- Do not rename tools.
- Do not add hidden/default fallback data.
- Do not create decorative JSON.
- Do not rewrite all samples blindly.
- Do not touch start_of_day folders unless required for active runtime validation.

## Acceptance
- One consolidated audit report exists.
- Sample 1902 is marked as workspace-exempt.
- JSON files outside 1902 are either visibly used by the right sample or documented for rehome/delete/update.
- Any applied rehome/delete/update preserves coverage.
- No JSON is blindly forced into a mismatched sample.
- Runtime smoke tests pass.
