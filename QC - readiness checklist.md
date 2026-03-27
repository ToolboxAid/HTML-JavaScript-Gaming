# Sprite Editor Validation Checklist

## 0. Startup / First Look
[x] Editor opens without console errors  
[x] Canvas is visible and centered  
[x] Top menus visible: File / Edit / Frame / Layer  
[-] Screen is not cluttered or clipped  

---

## 1. Menu Sanity

### File
[x] File menu opens  
[x] Menu items visible  
[x] Outside click closes menu  
[-] Esc closes menu  (also exits full screen)
[?]Save Local does nothing (what is expected)
[?]Load Local does nothing (what is expected)
[?]Export does nothing (what is expected)

### Edit
[x] Edit menu opens  
[x] Menu items visible  
[?] Switching to File closes Edit  
[?] looks like something should be under SELECTION
[-] Esc closes menu  (also exits full screen)


### Frame
[x] Frame menu opens  
[x] Menu items visible  
[x] Outside click closes  
[?] what does clear selected range do?
[?] how to use set playback range
[?] how to use clear payback
[-] Esc closes menu  (also exits full screen)

### Layer
[x] Layer menu opens  
[x] Menu items visible  
[-] Esc closes menu  (also exits full screen)

---

## 2. Basic Drawing
[x] Brush draws pixels  
[x] Fast strokes are continuous (no gaps)  
[x] Erase works  
[x] Fill works correctly  

---

## 3. Brush Engine
[x] Brush size 1 works  
[x] Brush size 3 works  
[x] Brush size 5 works  
[x] Square vs Circle shapes visible  
[x] Strokes remain pixel-aligned  

---

## 4. Shape Tools
[x] Line preview appears during drag  
[x] Line commits on release  
[x] Undo/Redo works for line  
[x] Rectangle preview appears  
[x] Rectangle commits correctly  
[?] Fill Rectangle works  (what is expect, how diff from Fill?)

---
#? Eye
[?] what does this do?


## 5. Selection Workflow
[x] Selection box visible  
[x] Drag move works  
[-] Esc cancels drag  (closes full screen) and does not close
[x] Arrow key nudge works  
[x] Shift+Arrow larger nudge works  
[x] Undo/Redo works  

---

## 6. Frames (Why is this and all the submenu say Layer instead of Frame)
[?] Add frame works  (too much overlay to tell)
[?] Duplicate frame works    (too much overlay to tell)
[x] Delete frame works  
[x] Frame navigation updates correctly  

---

## 7. Timeline (don't see this, overlayed?)
[?] Click selects frame  
[?] Drag scrubbing updates frame  
[?] Hover preview appears  
[?] Hover clears when pointer leaves  

---

## 8. Frame Range + Batch Ops(don't see this, overlayed?)
[?] Shift+click creates range  
[?] Range is visually highlighted  
[?] Duplicate range works  
[?] Shift left works  
[?] Shift right works  
[?] Clear range works  
[?] Undo/Redo restores range + state  

---

## 9. Playback(don't see this, overlayed?)
[?] Play works  
[?] Pause works  
[?] Stop resets correctly  
[?] Loop toggle works  
[?] FPS adjustment works  

---

## 10. Playback Range
[ ] Set playback range from selection  
[ ] Playback stays within range  
[ ] Loop range works  
[ ] Clear range restores full playback  

---

## 11. Onion Skin
[ ] Previous frame onion visible  
[ ] Next frame onion visible  
[ ] Updates when frame changes  

---

## 12. Layers
[ ] Add layer works  
[ ] Drawing affects active layer only  
[ ] Visibility toggle works  
[ ] Solo works  
[ ] Lock blocks edits  

---

## 13. Layer Reorder / Rename
[ ] Rename layer works  
[ ] Move up/down works  
[ ] Undo/Redo works  

---

## 14. Layer Opacity / Blend
[ ] Opacity changes visible  
[ ] Reset opacity works  
[ ] Blend preview toggles correctly  

---

## 15. Merge / Flatten Safety
[ ] Merge Down works  
[ ] Undo/Redo works  
[ ] Flatten shows confirm  
[ ] Cancel does nothing  
[ ] Confirm flattens correctly  
[ ] Undo restores  

---

## 16. Palette Workflow
[ ] Swatch selection works  
[ ] Prev/Next color works  
[ ] Set source color works  
[ ] Set destination color works  
[ ] Replace (active layer) works  
[ ] Replace (frame) works  
[ ] Replace (range) works  
[ ] Undo restores  

---

## 17. Palette Edge Cases
[ ] Same src/dst is safe no-op  
[ ] Missing color replace is safe  
[ ] No unnecessary history entries  

---

## 18. Save / Load / Export
[ ] Save clears dirty state  
[ ] Load shows guard if dirty  
[ ] Cancel load keeps state  
[ ] Confirm load works  
[ ] Export paths available  
[ ] Export does not mutate state  
[ ] Invalid export fails safely  

---

## 19. Command Palette
[ ] Opens with Ctrl+K  
[ ] Search returns results  
[ ] Commands execute correctly  
[ ] Aliases work  
[ ] Favorites persist  
[ ] Ranking feels correct  

---

## 20. Menus + Transient State
[ ] Command palette closes menus  
[ ] Menus close when others open  
[ ] Rename overlay blocks menus correctly  
[ ] Confirm dialogs behave correctly  
[ ] Esc closes correct surface  
[ ] Outside click closes surfaces  

---

## 21. Undo / Redo Stress
[ ] Mixed operations undo correctly  
[ ] Redo restores correctly  
[ ] Active frame/layer stays valid  
[ ] No corruption  

---

## 22. Real Use Pass (10 min)
[ ] Create multi-frame animation  
[ ] Use onion skin  
[ ] Use layers  
[ ] Playback works smoothly  
[ ] Use palette replace  
[ ] Export works  
[ ] No blockers encountered  

---

## Final Status
[ ] No hard failures  
[ ] No major UX confusion  
[ ] No console errors  
[ ] Ready for v6.1 fix pass OR release