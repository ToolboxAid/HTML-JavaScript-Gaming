# Sprite Editor QC Click-by-Click Test Script

## Instructions
- Run this in a real browser, not headless only.
- Mark each step Pass / Fail / Notes as you go.
- If a step fails, stop only if it blocks the rest of the section.
- Record exact repro steps for any failure.

---
[x] = success
[-] = failure (with discription)
[?] = not sure what the function does
---


## 1. Launch / Smoke Test

### 1.1 Open editor
- [x] Open `tools/SpriteEditor_old_keep/index.html`
- [x] Verify editor loads without visible errors
- [x] Verify no console errors on load

### 1.2 Basic chrome
- [x] Confirm top menu order is:
  - Files
  - Edit
  - Tools
  - Frame
  - Layer
  - Palette
  - Help
  - About
- [-] Confirm timeline is visible (does not have a header)
- [x] Confirm playback controls are visible
- [x] Confirm grid controls are visible
- [x] Confirm palette sidebar is visible
- [x] Confirm sheet preview is visible

---

## 2. Top Menu Open / Close Pass

### 2.1 Files
- [x] Click `Files`
- [x] Verify menu opens above all editor content
- [x] Click outside
- [x] Verify menu closes
- [-] Download GIF, new feature

### 2.2 Edit
- [x] Click `Edit`
- [x] Verify menu opens above all editor content
- [-] Press `Ctrl+W` closes the tab (don't think we need this if we click off to close)
- [x] Verify menu closes

### 2.3 Tools
- [x] Click `Tools`
- [x] Verify menu opens above all editor content
- [x] Click outside
- [x] Verify menu closes

### 2.4 Frame
- [x] Click `Frame`
- [x] Verify menu opens above all editor content
- [x] Press `Ctrl+W`
- [x] Verify menu closes

### 2.5 Layer
- [x] Click `Layer`
- [x] Verify menu opens above all editor content
- [x] Click outside
- [x] Verify menu closes

### 2.6 Palette
- [x] Click `Palette`
- [x] Verify menu opens above all editor content
- [x] Press `Ctrl+W`
- [x] Verify menu closes

### 2.7 Help
- [x] Click `Help`
- [x] Verify menu opens above all editor content
- [x] Click outside
- [x] Verify menu closes

### 2.8 About
- [x] Click `About`
- [x] Verify centered popup opens
- [x] Verify popup is above all content
- [x] Click `Close`
- [x] Verify popup closes
---

## 3. Files Menu Click-by-Click

- [x] Open `Files`
- [x] Click each visible item one at a time and verify it responds correctly
- [-] If `New` exists: does not exist add new to clear all data (short of F5)
  - [ ] Make a small drawing first
  - [ ] Click `New`
  - [ ] Verify clean state appears
- [?] If `Open` exists: no 'Open' button
  - [ ] Trigger `Open`
  - [ ] Verify chooser/load path opens correctly
- [?] If `Save` exists: no 'Save' button
  - [ ] Click `Save` with dirty changes
  - [ ] Verify save works
  - [ ] Click `Save` again with no new changes
  - [ ] Verify `Nothing to save.` appears
- [?] If `Export` exists: (no sure how this works)
  - [ ] Trigger export
  - [ ] Verify export path works

---

## 4. Edit Menu Click-by-Click

- [x] Open `Edit`
- [x] If `Undo` exists:
  - [x] Draw one stroke
  - [x] Click `Undo`
  - [x] Verify stroke disappears
- [x] If `Redo` exists:
  - [x] Click `Redo`
  - [x] Verify stroke returns
- [?] If any clear/reset action exists: (not shure what this does)
  - [ ] Trigger it
  - [ ] Verify result matches label

[?] not sure how to use Section tools via Select tool
[?] not sure how to clear section
[?] need to move the two sections together on the menu

---

## 5. Tools Menu Click-by-Click

For each tool below:
- [x] Open `Tools`
- [x] Click the tool
- [x] Verify active tool indicator updates
- [x] Use the tool on canvas
- [x] Verify behavior matches tool name

### 5.1 Brush
- [x] Select `Brush`
- [x] Draw on canvas
- [x] Verify pixels appear
- [?] change brush cap from 5 to 9

### 5.2 Erase
- [x] Select `Erase`
- [x] Erase existing pixels
- [x] Verify pixels are removed

### 5.3 Fill
- [x] Select `Fill`
- [x] Click inside a bounded area
- [x] Verify fill applies correctly

### 5.4 Line
- [x] Select `Line`
- [x] Draw a line
- [x] Verify preview and final line render correctly

### 5.5 Rectangle
- [x] Select `Rectangle`
- [x] Draw a rectangle outline
- [x] Verify result

### 5.6 Fill Rectangle
- [x] Select `Fill Rectangle`
- [x] Draw a filled rectangle
- [x] Verify result

### 5.7 Eyedropper
- [x] Select `Eyedropper`
- [x] Click an existing pixel color
- [x] Verify current color updates

### 5.8 Select
- [x] Select `Select`
- [x] Drag a selection area
- [x] Verify selection appears
- [x] Move selection if supported
- [-] Verify selection behaves correctly(moves but should not clears content)

---

## 6. Frame Menu Click-by-Click

- [x] Open `Frame`
- [x] If `Add Frame` exists:
  - [x] Click `Add Frame`
  - [x] Verify a new frame appears
- [x] If `Duplicate Frame` exists:
  - [x] Click `Duplicate Frame`
  - [x] Verify current frame duplicates
- [x] If `Remove/Delete Frame` exists:
  - [x] Click it
  - [x] Verify frame count decreases safely
- [x] Verify timeline still works after frame operations

-[ ] frame has many more submenu items that need tested.
---

## 7. Layer Menu Click-by-Click

- [x] Open `Layer`
- [x] Click `Add Layer`
- [x] Verify a new layer appears
- [x] Select a different layer
- [x] Verify active layer changes
- [x] Toggle visibility if available
- [x] Verify hidden layer does not render
- [x] Remove a layer if supported
- [x] Verify state remains valid
[-] after duplicat, the name overlaps %
[-] layer > toggle visibilty is not required 
[-] what does solo do? also, after click show/hide works, but the text does not change
[-] order is backward, the layer on top should paint over the layer below
[-] 2+ layers move into the animation preview

---

## 8. Palette Menu Click-by-Click

### 8.1 Main Palette menu
- [x] Open `Palette`
- [x] Verify utility items are visible
- [x] Verify `Replace Color` is not present

### 8.2 Palette utilities
If these exist, click and verify each:
[?] not shure what these are suppost to do.
- [ ] Set Src From Current
- [ ] Set Dst From Current
- [ ] Scope Active Layer
- [ ] Scope Current Frame
- [ ] Scope Selected Range

### 8.3 Palettes submenu / popup
- [x] Open `Palette`
- [x] Click `Palettes`
- [x] Verify palette list/popup becomes clearly visible
- [x] Verify current preset is marked
- [x] Click one preset with a small color count
- [x] Verify sidebar palette updates
- [x] Click one preset with a large color count
- [x] Verify sidebar palette updates
- [x] Verify all colors are reachable via scrolling
[-] needs added to HELP

---

## 9. Palette Sidebar Click-by-Click

### 9.1 Basic visibility
- [x] Verify label reads `Palette: <name>`
- [x] Verify swatches are visible
- [?] Verify current color readout is visible ( present but change to "Current:" and add "Named Color: <name>" to right, also add a small swatch of current color after #hex [])

### 9.2 Large palette test
- [x] Select a palette with 100+ colors
- [x] Scroll down the palette sidebar
- [x] Verify the last colors are reachable
- [x] Click one of the final colors
- [x] Verify current color updates

### 9.3 Sorting
At bottom of palette sidebar:
- [x] Click `Name`
- [x] Verify order changes
- [x] Click `Hue`
- [x] Verify order changes
- [x] Click `Saturation`
- [x] Verify order changes
- [x] Click `Lightness`
- [x] Verify order changes
- [x] After each sort, click a color
- [x] Verify current color updates correctly

---

## 10. Help Menu Click-by-Click

For each help topic:
- [x] Open `Help`
- [x] Click topic
- [x] Verify centered help popup opens
- [x] Verify popup contains:
  - [x] title
  - [x] short description
  - [x] how to use
  - [x] option explanations
  - [x] Close button
- [x] Click `Close`
- [x] Verify popup closes
- missing Palette 

Topics to test:
- [x] Files
- [x] Edit
- [x] Tools
- [x] Frame
- [x] Layer

---

## 11. About Popup Click-by-Click

- [?] Click `About` - remove content from Menu down(add hotlink to toolboxaid.com and github.com/ToolboxAid/HTML-JavaScript-Gaming

- [x] Verify centered popup opens
- [x] Verify content is readable
- [x] Verify `Close` button is visible
- [x] Click `Close`
- [x] Verify popup closes
- [x] Reopen `About`
- [-] Press `Ctrl+W` - remove this and all others, ctlr+w closes page
- [x] Verify popup closes

---

## 12. Grid Controls Click-by-Click

- [x] Find `Grid` section
- [x] Click `Add Row`
- [x] Verify row count increases
- [x] Click `Remove Row`
- [x] Verify row count decreases
- [x] Click `Add Column`
- [x] Verify column count increases
- [x] Click `Remove Column`
- [x] Verify column count decreases
- [x] Verify existing data remains sane after changes

---

## 13. Timeline Click-by-Click

### 13.1 Control order
- [x] Verify controls are stacked:
  - [x] Play
  - [x] Stop
  - [x] Loop
  - [x] Range

### 13.2 Control behavior
- [x] Click `Play`
- [x] Verify playback starts
- [x] Click `Stop`
- [x] Verify playback stops
- [x] Toggle `Loop`
- [x] Verify loop state changes
- [x] Use `Range`
- [-] Verify range state changes - all frames cycled

### 13.3 Frame strip
- [x] Click frame thumbnails/entries
- [x] Verify active frame changes
- [x] Verify no overlap with controls

---

## 14. Animation Preview

- [x] Verify animation preview is visible
- [x] Verify state text is NOT shown
- [x] Verify bottom helper line is NOT shown
- [x] Click `Play` in timeline
- [x] Verify animation preview updates
- [x] Click `Stop`
- [x] Verify animation preview stops

---

## 15. Sheet Preview

- [x] Verify Sheet Preview image is visible
- [x] Verify preview uses vertical space well
- [x] Verify image remains within bounds
- [x] Verify `Frames: <count>` appears to the right
- [x] Verify `Order: <value>` appears to the right
- [x] Verify text does not overlap preview

---

## 16. Zoom / Pan / Clipping

- [x] Zoom in
- [x] Verify grid stays inside viewport bounds
- [x] Verify sprite pixels stay inside viewport bounds
- [x] Verify selection/shape overlays stay clipped correctly
- [x] Zoom out
- [x] Verify viewport remains clean
- [?] Pan if supported (need to add the middle mouse to the help section)
- [x] Verify no content bleeds into sidebars or preview areas

---

## 17. Input / Cancel / Focus

### 17.1 ESC
- [x] Enter fullscreen
- [x] Press `Esc`
- [x] Verify fullscreen exits
- [x] Verify editor UI did not consume ESC

### 17.2 Command palette
- [x] Press `Ctrl+P`
- [x] Verify command palette opens
- [-] Press `Ctrl+W` remove this
- [x] Verify command palette closes
- [-] section teal text overlays white tool text
- [-] the star and [] overlay
- [-] remove the ESC close

### 17.3 Cancel interaction
- [x] Start drawing
- [x] Right-click
- [x] Verify action cancels
- [x] Start another interaction
- [-] Press `Backspace`
- [-] Verify action cancels (nothing happens)

### 17.4 Typing protection
If any text input is present:
- [ ] Focus the input
- [ ] Press `Backspace`
- [ ] Verify it does not trigger editor cancel
- [-] Press `Ctrl+W` - remove
- [ ] Verify it does not wrongly close editor UI

---

## 18. Stress / Edge Pass

- [x ] Resize browser window very small
- [x] Verify controls remain reachable
- [x] Resize browser window very large
- [x] Verify layout remains stable
- [x] Select a large palette again
- [?] Scroll to bottom (palette does not ready the bottom, no scrole available)
- [x] Verify last colors still visible/selectable
- [x] Switch tools rapidly
- [x] Verify no ghost state remains
- [x] Add/remove rows and columns after palette changes
- [x] Verify no corruption
- [x] Change frame and layer after palette selection
- [x] Verify state remains consistent

---

## 19. Final Console / Stability Pass

- [x] Open dev tools console
- [x] Repeat quick pass through:
  - [x] Files
  - [x] Edit
  - [x] Tools
  - [x] Frame
  - [x] Layer
  - [x] Palette
  - [x] Help
  - [x] About
- [x] Draw on canvas
- [x] Change palette
- [x] Change frame
- [x] Change layer
- [x] Verify no console errors

---

## 20. Final Exit Criteria

- [x] Every top menu opened and closed successfully
- [x] Every submenu/popup path tested successfully
- [?] Every tool tested successfully
- [x] Grid controls visible and working
- [x] Palette workflow fully working, including large palettes
- [x] Timeline and previews working
- [x] No console errors
- [?] Ready for full regression signoff
- [?] move FPS controls inside animation preview under Frame
- [?] increase size of Sheet Preview so it is the same from top and bottom (margin 5?)

- no test for Mirror or shape
