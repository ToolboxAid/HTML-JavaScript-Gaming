# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: low

1. Update workspace.manifest.schema.json:
   - change required key from "palette" to "palette-browser"
   - rename properties.palette to properties.palette-browser

2. Scan repo:
   - replace all tool key usage:
     palette → palette-browser

3. Remove invalid references:
   - palette-editor
   - duplicate palette tools

4. Validate:
   - all workspace manifests use tools.palette-browser
   - schema validation passes

5. Output report:
   docs/dev/reports/validation_after_11_103.txt
