
Objective:
Generate a ZIP containing ALL schema and JSON files in repo.

Include:
- tools/schemas/**
- tools/schemas/tools/**
- samples/**/sample.*.json
- samples/**/sample.*.palette.json
- workspace.manifest.json
- any *.json used by tools or manifests

Rules:
- Preserve exact directory structure
- No file edits
- No filtering (except non-JSON)

Output:
<project>/tmp/FULL_SCHEMA_JSON_EXPORT.zip
