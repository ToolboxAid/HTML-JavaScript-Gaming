# Deprecated Asset Surface

`GameFoundryStudio/assets` is deprecated as an active Theme V2 asset source.

Theme V2 assets now use `src/engine/theme/v2/assets` as the source of truth. This legacy folder remains in place for compatibility and auditability during the staged migration. Do not delete files from this folder until a later cleanup PR explicitly removes the legacy surface.

New runtime, page, template, and tool references should resolve Theme V2 assets from `src/engine/theme/v2/assets`.
