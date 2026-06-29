# PR_26180_OWNER_019a-contracts-schemas-obsolescence-audit Manual Validation Notes

- Reviewed active reference surfaces requested by Owner: `www/`, `api/`, `dev/tests/`, `dev/scripts/`, and `package.json` scripts.
- Treated `www/src/shared/toolbox/schemaOnlyToolPresetValidation.js` as a dynamic browser/runtime reference for all tool schema JSON files because it builds `/src/shared/schemas/tools/<tool>.schema.json` at runtime.
- No source files were moved, deleted, or rewritten.
- No protected developer workspace files were moved.
- Recommended next action is to split/move browser-consumed contracts and schemas to `www/src/shared/...` before retrying API-only migration.
