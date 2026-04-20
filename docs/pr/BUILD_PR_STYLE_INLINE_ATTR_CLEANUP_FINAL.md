# BUILD_PR_STYLE_INLINE_ATTR_CLEANUP_FINAL

## Purpose
Remove the remaining inline `style=""` attributes and move them into shared CSS using the same reuse-first rule as the inline `<style>` cleanup.

## Single PR Purpose
Eliminate the last known inline style-attribute violations without redesigning layout.

## Targeted Files
- `tools/Tool Host/index.html`
- `tools/Vector Map Editor/how_to_use.html`

## Confirmed Remaining Inline Style Targets
### `tools/Tool Host/index.html`
- `<label class="field" style="width:100%;">`
- `<textarea ... style="width:100%;">`
- `<div data-tool-host-mount-container ... style="min-height: 420px; border: 1px solid rgba(148, 163, 184, 0.35); border-radius: 10px; overflow: hidden; background: rgba(15, 23, 42, 0.45);"></div>`

### `tools/Vector Map Editor/how_to_use.html`
- `<div class="callout" style="margin-top: 16px;">`

## Required Rule
If an inline style attribute matches or is close to rules already appropriate in a higher-level shared CSS path, reuse that CSS destination instead of creating a new file.

## Reuse-First CSS Destination Rules
1. Reuse an existing higher-level CSS file when the rules are already represented or close enough to belong there.
2. Prefer the highest reasonable shared destination that fits the file’s role.
3. Only create a new shared CSS rule/class when reuse would be incorrect.
4. Preserve current visual behavior as closely as possible.

## Required Work
1. Remove all remaining inline `style=""` attributes from the targeted files.
2. Move the rules into reused higher-level CSS where appropriate.
3. Create new shared CSS classes/selectors only when reuse would be wrong.
4. Update markup to use classes or existing selectors instead of inline styles.
5. Do not introduce new inline `style=""`.
6. Do not introduce embedded `<style>` blocks.
7. Do not introduce JS-generated styling.
8. Preserve behavior/layout as closely as possible.

## Acceptance
- targeted files no longer contain inline `style=""`
- higher-level shared CSS is reused whenever close enough
- new CSS classes/selectors are created only when necessary
- visual behavior is preserved closely
- no inline `style=""` introduced
- no embedded `<style>` blocks introduced
- no JS-generated styling introduced
- change is testable
