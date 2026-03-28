MODEL: GPT-5.4
REASONING: medium

COMMAND:
Run a manual browser QC pass for the current Sprite Editor V7.5 build using QC - SPRITE_EDITOR_FINAL_QC.txt as the base defect log, with extra focus on the V7.5 changes implemented in this pass.

CONSTRAINTS:
- Do NOT modify code during this step
- Do NOT touch /engine
- Use the current local Sprite Editor build only
- Record defects inline in the existing QC defect style

V7.5 FOCUS CHECKS:
1. Menu click-close behavior
   - Clicking a menu action closes the current menu correctly
   - Files / Edit / Tools / Frame / Layer / Palette / Help all still behave correctly

2. Files menu flattening
   - Files contains direct actions:
     - Export Sprite
     - Export GIF
     - Export Project JSON
   - Export Assets / nested export submenu is gone
   - Reference-image actions still exist and are reachable

3. Palette lock first-edit enforcement
   - New project starts with palette required
   - First grid click before palette selection shows popup + red status
   - Selecting palette unlocks editing

4. Clone workflow
   - Clone action label is shortened correctly
   - Clone action is gated until palette selection
   - Right sidebar clone workflow is visible between Palette and Current
   - Clone selection/editability/persistence should be checked if reachable

5. About update
   - About popup reflects current top-bar sections including Palette
   - About popup remains clean/readable

6. Existing high-risk areas from prior QC
   - Selection move non-destructive behavior
   - Backspace cancel
   - Add Frame insertion position
   - Timeline range behavior
   - Timeline click syncing preview
   - Layer rename/edit including Backspace
   - Opacity control visibility/usability
   - No layer bleed into preview
   - Palette utility explanations / Help
   - Command palette visual cleanliness
   - Reference image load/align/persist
   - GIF timing alignment

OUTPUT:
- Update the QC defect log with current defects/questions
- Produce a concise summary:
  - Must Fix
  - Can Defer
  - Ready / Not Ready for signoff
