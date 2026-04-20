# BUILD_PR_STYLE_04_GAMES_INDEX_RESET_AND_HEADER_LOCKS

## Purpose
Apply the shared style system to `/games/index.html` and lock the newly agreed shared-header rules so they are implemented consistently.

## Single PR Purpose
Reset `/games/index.html` onto the new Toolbox Aid-derived theme while carrying forward the agreed shared header behavior.

## Locked Header Rules For This PR
1. Add this as the FIRST menu item:
   - Toolbox Aid
   - opens in a new tab
   - uses:
     - `class="is-external"`
     - `target="_blank"`
     - `rel="noopener noreferrer"`

2. Header must stretch the full width of the screen regardless of content.
   - no centered max-width wrapper may constrain the header
   - header image area must remain full-width
   - image behavior must preserve aspect ratio

3. Shared header source remains under:
   - `src/engine/theme/toolboxaid-header.html`

4. Shared header styling remains under:
   - `src/engine/theme/header.css`
   - plus shared base support in `src/engine/theme/main.css` as needed

## `/games/index.html` Scope
- reset `/games/index.html` to shared theme only
- use shared header
- no embedded `<style>`
- no inline `style=""`
- no JS-generated styling
- keep structure closely aligned with `/index.html` and `/samples/index.html`

## External Link Standard
If multiple external links exist, standardize them using:
- `class="is-external"`
- `target="_blank"`
- `rel="noopener noreferrer"`

Optional shared visual cue:
- `is-external` may use a shared external-link marker in theme CSS

## Acceptance
- `/games/index.html` visually aligns with the new shared page shell
- header renders from shared source
- Toolbox Aid link is first in menu and opens in new tab safely
- header remains full width regardless of content
- no embedded styling remains on `/games/index.html`
- page is testable and narrow in scope
