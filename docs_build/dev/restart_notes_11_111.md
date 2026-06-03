# Restart Notes — PR 11.111

Stay on the current path:
- direct JSON input
- schema-only validation
- visible errors for mismatch
- no normalization
- no transforming
- no inferring
- no fallback/default/preset data

This PR moves test-only `tool.schema.json` files out of runtime tool folders and removes more shared inference paths.
