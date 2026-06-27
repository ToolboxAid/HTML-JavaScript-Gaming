
Objective:
Generate a ZIP containing ALL schema and JSON files including games.

Include:
- src/shared/schemas/**
- src/shared/schemas/tools/**
- samples/**/sample.*.json
- samples/**/sample.*.palette.json
- workspace.manifest.json
- games/**/*.json
- any *.json used by tools or manifests

Rules:
- Preserve exact directory structure
- No file edits
