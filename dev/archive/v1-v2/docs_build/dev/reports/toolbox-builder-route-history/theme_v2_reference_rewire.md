# Theme V2 Reference Rewire

Task: PR_26152_280-theme-v2-reference-rewire

## Summary

- Active HTML/JS files mechanically rewired: 58
- Active page/template/tool asset references now resolve through `assets/theme/v2/assets`.
- No template redesign, Storage Inspector rebuild, or CSS authoring was performed.

## Rewired Files

- `dev/templates/tool-template-v2.html`
- `toolbox/ai-assistant.html`
- `toolbox/animation-studio.html`
- `toolbox/asset-studio.html`
- `toolbox/builder.html`
- `toolbox/code-studio.html`
- `toolbox/creator.html`
- `toolbox/game-builder.html`
- `toolbox/game-design-studio.html`
- `toolbox/groups/configuration-admin.html`
- `toolbox/index.html`
- `toolbox/input-studio.html`
- `toolbox/localization-studio/index.html`
- `toolbox/midi-studio.html`
- `toolbox/object-vector-studio.html`
- `toolbox/palette-manager.html`
- `toolbox/particle-studio.html`
- `toolbox/publisher.html`
- `toolbox/sound-studio.html`
- `toolbox/storage-inspector.html`
- `toolbox/world-vector-studio.html`
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
- `/dev/templates/page-template-v2.html`
- `retired Theme V2 tool template`
- `toolbox/tools-page-accordions.js`

## Runtime Helper Adjustments

- `assets/theme/v2/js/gamefoundry-partials.js`: resolves partial fetches and partial image rewrites from the Theme V2 asset script root.
- `assets/theme/v2/js/tool-display-mode.js`: derives default image assets from the Theme V2 asset script root and allows a template placeholder character source.
- `toolbox/tools-page-accordions.js`: active generated image and badge paths now point to `../assets/theme/v2/images/...`.
