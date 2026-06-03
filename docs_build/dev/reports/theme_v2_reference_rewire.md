# Theme V2 Reference Rewire

Task: PR_26152_280-theme-v2-reference-rewire

## Summary

- Active HTML/JS files mechanically rewired: 58
- Active page/template/tool asset references now resolve through `src/engine/theme/v2/assets`.
- No template redesign, Storage Inspector rebuild, or CSS authoring was performed.

## Rewired Files

- `tools/_templates-v2/index.html`
- `tools/ai-assistant.html`
- `tools/animation-studio.html`
- `tools/asset-studio.html`
- `tools/builder.html`
- `tools/code-studio.html`
- `tools/creator.html`
- `tools/game-builder.html`
- `tools/game-design-studio.html`
- `tools/groups/configuration-admin.html`
- `tools/index.html`
- `tools/input-studio.html`
- `tools/localization-studio/index.html`
- `tools/midi-studio.html`
- `tools/object-vector-studio.html`
- `tools/palette-manager.html`
- `tools/particle-studio.html`
- `tools/publisher.html`
- `tools/sound-studio.html`
- `tools/storage-inspector.html`
- `tools/world-vector-studio.html`
- `GameFoundryStudio/arcade/index.html`
- `GameFoundryStudio/assets.html`
- `GameFoundryStudio/cloud/index.html`
- `GameFoundryStudio/cloud.html`
- `GameFoundryStudio/community/index.html`
- `GameFoundryStudio/community.html`
- `GameFoundryStudio/configuration-admin.html`
- `GameFoundryStudio/contact.html`
- `GameFoundryStudio/cookie-policy.html`
- `GameFoundryStudio/disclaimer.html`
- `GameFoundryStudio/docs/index.html`
- `GameFoundryStudio/docs.html`
- `GameFoundryStudio/faq.html`
- `GameFoundryStudio/games.html`
- `GameFoundryStudio/index.html`
- `GameFoundryStudio/learn/index.html`
- `GameFoundryStudio/learn.html`
- `GameFoundryStudio/marketplace/index.html`
- `GameFoundryStudio/marketplace.html`
- `GameFoundryStudio/privacy-policy.html`
- `GameFoundryStudio/publish/index.html`
- `GameFoundryStudio/publish.html`
- `GameFoundryStudio/reference.html`
- `GameFoundryStudio/support.html`
- `GameFoundryStudio/terms.html`
- `GameFoundryStudio/tools/builder.html`
- `GameFoundryStudio/tools/creator.html`
- `GameFoundryStudio/tools/game-builder.html`
- `GameFoundryStudio/tools/game-design-studio.html`
- `GameFoundryStudio/tools/groups/configuration-admin.html`
- `GameFoundryStudio/tools/localization-studio/index.html`
- `GameFoundryStudio/tools/publisher.html`
- `GameFoundryStudio/tools/world-vector-studio.html`
- `GameFoundryStudio/tools.html`
- `/_page_template_v2.html`
- `retired Theme V2 tool template`
- `tools/tools-page-accordions.js`

## Runtime Helper Adjustments

- `src/engine/theme/v2/assets/js/gamefoundry-partials.js`: resolves partial fetches and partial image rewrites from the Theme V2 asset script root.
- `src/engine/theme/v2/assets/js/tool-display-mode.js`: derives default image assets from the Theme V2 asset script root and allows a template placeholder character source.
- `tools/tools-page-accordions.js`: active generated image and badge paths now point to `../assets/theme/v2/images/...`.
