
MODEL: GPT-5.3-codex

TASK:
Create export ZIP of all JSON/schema files including games.

STEPS:
1. Collect all files matching:
   - **/*.json
2. Exclude:
   - node_modules
   - .git
3. Ensure inclusion:
   - games/**
4. Preserve folder structure
5. Output ZIP:
   <project>/tmp/FULL_SCHEMA_JSON_EXPORT_V2.zip

Do NOT modify files
