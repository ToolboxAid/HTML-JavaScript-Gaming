# PATCH_SNIPPETS.md

Below are concrete code edits to apply inside `tools/SpriteEditor/main.js`.

---

## 1) Remove ALL Ctrl+W editor handling

### Search for any of these patterns and remove/disable them
- `e.ctrlKey && e.key === 'w'`
- `Ctrl+W`
- `handleCloseSurfaceAction()` calls from keydown logic
- any menu/popup close branch that is specifically bound to Ctrl+W

### Replace with
Do not bind `Ctrl+W` at all. Keep:
- click outside to close menus/popups
- explicit Close buttons

### Example removal pattern
```js
if (e.ctrlKey && (e.key === 'w' || e.key === 'W')) {
  e.preventDefault();
  this.handleCloseSurfaceAction();
  return true;
}
```

Delete that block entirely.

---

## 2) Fix Backspace cancel interaction when NOT typing

### Add helper if missing
```js
function isTypingTarget(target) {
  if (!target) return false;
  const tag = (target.tagName || "").toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    target.isContentEditable === true
  );
}
```

### In the main keydown handler
Add/keep this branch early in the editor-owned key flow:
```js
if (e.key === "Backspace" && !isTypingTarget(e.target)) {
  const cancelled = this.cancelActiveInteraction?.("Backspace");
  if (cancelled) {
    e.preventDefault();
    return true;
  }
}
```

### Important
`cancelActiveInteraction()` must return `true` when it actually cancels something.

---

## 3) Fix selection move clearing content

### Problem shape
Selection move likely clears source pixels too early.

### Safe model
When starting a move:
- capture selected pixels into a move buffer
- keep original pixels intact until commit
- preview movement from buffer
- on commit:
  - clear original selected area once
  - draw moved buffer at destination

### Add/normalize move state
```js
this.selectionMoveState = {
  active: true,
  sourceRect,
  bufferPixels,   // captured pixel data
  offsetX: 0,
  offsetY: 0
};
```

### During preview draw
Do NOT mutate document pixels.
Only render preview from `bufferPixels`.

### On commit
```js
commitSelectionMove() {
  const s = this.selectionMoveState;
  if (!s || !s.active) return false;

  // 1. clear original only once at commit time
  this.clearPixelsInRect(s.sourceRect);

  // 2. stamp moved pixels at destination
  this.drawBufferedPixels(
    s.bufferPixels,
    s.sourceRect.x + s.offsetX,
    s.sourceRect.y + s.offsetY
  );

  // 3. update selection rect to new location
  this.selectionRect = {
    x: s.sourceRect.x + s.offsetX,
    y: s.sourceRect.y + s.offsetY,
    w: s.sourceRect.w,
    h: s.sourceRect.h
  };

  this.selectionMoveState = null;
  this.pushHistory?.("Move Selection");
  return true;
}
```

### On cancel
```js
cancelActiveInteraction(reason = "Cancel") {
  let cancelled = false;

  if (this.selectionMoveState?.active) {
    this.selectionMoveState = null; // do NOT clear pixels
    cancelled = true;
  }

  // existing cancel branches...
  // brush drag, shape preview, pan, etc.

  if (cancelled) {
    this.setStatusMessage?.("Cancelled");
  }
  return cancelled;
}
```

---

## 4) Fix palette scroll to true end of palette

### Problem shape
The data is present, but viewport math still stops early.

### Normalize palette content height
Assuming swatch grid:
```js
const swatchSize = this.paletteSwatchSize;
const swatchGap = this.paletteSwatchGap;
const columns = Math.max(1, this.paletteColumns);

const totalColors = displayPalette.length;
const totalRows = Math.ceil(totalColors / columns);

const contentHeight =
  totalRows * swatchSize +
  Math.max(0, totalRows - 1) * swatchGap;
```

### Scroll max
```js
const viewportHeight = paletteViewport.h;
const maxScroll = Math.max(0, contentHeight - viewportHeight);
this.paletteScrollY = Math.max(0, Math.min(this.paletteScrollY, maxScroll));
```

### Visible draw range
```js
const rowStride = swatchSize + swatchGap;
const firstVisibleRow = Math.max(0, Math.floor(this.paletteScrollY / rowStride));
const lastVisibleRow = Math.min(
  totalRows - 1,
  Math.ceil((this.paletteScrollY + viewportHeight) / rowStride)
);

for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
  for (let col = 0; col < columns; col++) {
    const index = row * columns + col;
    if (index >= totalColors) break;
    // draw swatch index
  }
}
```

### Hit test must use the SAME scroll math
```js
const localY = pointerY - paletteViewport.y + this.paletteScrollY;
const row = Math.floor(localY / rowStride);
const col = Math.floor((pointerX - paletteViewport.x) / (swatchSize + swatchGap));
const index = row * columns + col;
```

### Scroll affordance
If not already present, draw a simple scrollbar/thumb based on:
```js
const thumbRatio = viewportHeight / Math.max(viewportHeight, contentHeight);
const thumbHeight = Math.max(18, viewportHeight * thumbRatio);
const thumbY = paletteViewport.y + (this.paletteScrollY / maxScroll) * (viewportHeight - thumbHeight);
```

---

## 5) Timeline Range: fix or hide

### Preferred fallback for V7.0
If `Range` is still cycling all frames, hide/remove it from the UI for now.

### UI removal
Remove the `Range` button from the visible timeline transport stack.

### Guard stale logic
If range state exists, keep it inert:
```js
this.timelineRangeEnabled = false;
this.timelineRangeStart = null;
this.timelineRangeEnd = null;
```

### Playback loop
Make playback always use the full frame set until range is reintroduced correctly.

---

## 6) Add visible Timeline header

Where timeline chrome is drawn, add:
```js
drawLabel(ctx, "Timeline", timelineHeaderX, timelineHeaderY);
```

Or equivalent using the editor's text helper:
```js
this.drawUiText?.(ctx, "Timeline", x, y, { weight: "bold" });
```

Keep it visually above the timeline transport and frame strip.

---

## 7) Current color line on ONE line

### Replace existing current-color readout rendering
Render exactly this shape on one line:
```js
const hex = this.getCurrentColorHex?.() || "#000000";
const name = this.getCurrentColorName?.() || "Unnamed";
const label = `Current: ${hex}`;
const named = `Named: ${name}`;
```

### Draw order
```js
const y = currentColorLineY;
let x = currentColorLineX;

x = this.drawUiText?.(ctx, label, x, y) ?? x;

// draw small swatch after hex
const sw = 12;
const sh = 12;
const swatchX = x + 8;
const swatchY = y - 10;
ctx.fillStyle = hex;
ctx.fillRect(swatchX, swatchY, sw, sh);
ctx.strokeStyle = "#ffffff";
ctx.strokeRect(swatchX, swatchY, sw, sh);

// named label on same line
const namedX = swatchX + sw + 10;
this.drawUiText?.(ctx, named, namedX, y);
```

### Final visual target
`Current: #AABBCC [■] Named: Sky Blue`

---

## 8) Suggested quick verification sweep after patch
- open editor
- confirm no `Ctrl+W` behavior in menus/popups
- start brush drag → `Backspace` cancels
- move selection → commit → pixels preserved
- choose 150+ color palette → scroll to last swatch
- timeline shows `Timeline` label
- `Range` no longer visible OR behaves correctly
- current color line appears on one line
