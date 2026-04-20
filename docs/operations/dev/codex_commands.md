MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_04_GAMES_INDEX_RESET_AND_HEADER_LOCKS as one focused, testable PR.

Rules:
- one PR purpose only
- use the established shared theme direction
- do not use legacy project styling as the baseline
- no embedded <style> in HTML
- no inline style=""
- no JS-generated styling
- keep theme under src/engine/theme

Required work:
1. Reset `/games/index.html` to the new shared style system.
2. Use the shared header from `src/engine/theme/toolboxaid-header.html`.
3. Update the shared header menu so the FIRST item is:
   <li class="menu-item">
     <a href="https://toolboxaid.com" class="is-external" target="_blank" rel="noopener noreferrer">Toolbox Aid</a>
   </li>
4. Ensure header styling keeps the header full width regardless of content.
5. Ensure the header image scales proportionally with viewport width:
   - retain aspect ratio
   - no fixed-height lock
   - no distortion
   - no cropping used to fake responsiveness
6. Add or keep shared external-link styling under theme CSS if useful.
7. Keep `/games/index.html` structurally close to `/index.html` and `/samples/index.html`.
8. Package to:
   <project folder>/tmp/BUILD_PR_STYLE_04_GAMES_INDEX_RESET_AND_HEADER_LOCKS.zip
