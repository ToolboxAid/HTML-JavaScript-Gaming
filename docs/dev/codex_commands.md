MODEL: gpt-5.5
REASONING: high

COMMAND:

Rebuild "Palette Manager" as a Tool v2:

LOCATION:
tools/Palette Manager/

RULES:
- Single file: main.js
- Single class only
- No helper classes
- No abstraction layers
- No alias variables
- No pass-through variables

REQUIREMENTS:

1. ENTRY
- console.log("[PALETTE_V2_ENTRY]")

2. SESSION READ
- read session using hostContextId
- console.log("[SESSION_CONTEXT_READ]")

3. CONTRACT
- load paletteJson only
- console.log("[PALETTE_V2_CONTRACT_LOADED]")

4. RENDER
- show palette name
- render swatches
- show count

5. STATES
- empty state
- error state

6. UI
- reuse src/engine/theme styles
- reuse existing accordion CSS
- header must match /index.html
- include accordion hide/show

7. HARD BLOCKS
- no platformShell
- no workspace v1
- no fallback data
