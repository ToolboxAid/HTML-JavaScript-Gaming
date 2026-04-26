# PR 8.2 — Schema Enforcement + Sample Compliance

## Purpose
Enforce schema usage across all samples and ensure compliance with tool + shared schemas.

## Scope
- Require $schema in all JSON assets
- Validate samples against tool schemas
- Ensure palettes align with shared schema
- No runtime validation logic added

## Rules
- Samples MUST reference tool schemas directly
- All JSON MUST include $schema
- No fallback or normalization allowed

## Validation Targets
- samples/**/config.json -> tool.schema.json
- samples/**/palette.json -> palette.schema.json
- workspace.manifest.json -> workspace.schema.json
