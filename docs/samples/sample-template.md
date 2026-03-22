# Sample Template Standard

This document defines the current source-of-truth template for samples.

The template is based on these approved working references:

- `samples/sample01-basic-loop/`
- `samples/sample02-keyboard-move/`

These samples establish the baseline for new samples until a later approved template replaces them.

---

## Purpose

Every sample should:

- prove one main concept clearly
- stay small and focused
- keep concerns separated
- be readable in both HTML and canvas
- act as a reference implementation for future samples

Samples are demonstrations, not mini-games.

---

## Source-of-Truth Template Files

Use these as the current references:

- `samples/sample01-basic-loop/index.html`
- `samples/sample01-basic-loop/main.js`
- `samples/sample01-basic-loop/BouncerScene.js`
- `samples/sample02-keyboard-move/index.html`
- `samples/sample02-keyboard-move/main.js`
- `samples/sample02-keyboard-move/KeyboardMoveScene.js`

If a future sample conflicts with this document, the approved sample code in the repo is the source of truth until this document is updated.

---

## Required Sample Folder Shape

Each sample should follow this structure:

```text
samples/sampleXX-sample-name/
├─ index.html
├─ main.js
└─ <SceneName>.js
```

Example:

```text
samples/sample01-basic-loop/
├─ index.html
├─ main.js
└─ BouncerScene.js
```

---

## Naming Standard

### Folder
Use:

```text
sampleXX-short-name
```

Examples:

- `sample01-basic-loop`
- `sample02-keyboard-move`

### HTML Title
Use this pattern:

```text
Engine Sample XX - Short Description
```

Examples:

- `Engine Sample 01 - Basic Loop`
- `Engine Sample 02 - Keyboard Move`

### H1
Use:

```text
Engine SampleXX
```

Examples from the current approved samples:

- `Engine Sample 01`
- `Engine Sample02`

Note: the current approved code is not perfectly normalized between spacing styles. New samples should stay visually consistent with the approved sample code in the repo. If naming normalization is desired, do that in a separate PR.

---

## HTML Page Layout Standard

Each sample HTML page should include:

- full-page document height
- centered layout
- a `main` wrapper
- an `h1`
- one descriptive paragraph
- one canvas
- a module script pointing to `main.js`

### Required structure

```html
<main>
  <h1>Engine SampleXX</h1>
  <p>Sample description...</p>
  <canvas id="game" width="960" height="540"></canvas>
</main>
```

### Required layout behavior

- `html, body` should be full height
- `body` should center content
- `main` should constrain width
- `canvas` should be responsive but preserve internal resolution
- paragraph text should explain the sample clearly

### Current visual baseline

```css
html,
body {
    height: 100%;
}

body {
    margin: 0;
    color: #e2e8f0;
    font-family: Arial, sans-serif;
    display: grid;
    place-items: center;
    min-height: 100vh;
}

main {
    width: min(100%, 1000px);
    padding: 20px;
    box-sizing: border-box;
}

canvas {
    display: block;
    width: 100%;
    max-width: 960px;
    height: auto;
    border: 1px solid #334155;
    background: #111827;
}

p {
    line-height: 1.5;
}
```

The document background is applied in JavaScript through the theme.

---

## HTML Description Standard

Each sample should include a paragraph above the canvas.

That paragraph should explain:

1. what the sample demonstrates
2. how to interact with it, if interaction exists
3. the architecture boundary being proven

### Example: passive sample

```text
This sample proves the new bootstrap boundary: Engine orchestrates, timing classes measure time, Scene owns game behavior, and CanvasSurface owns drawing context setup.
```

### Example: interactive sample

```text
Demonstrates the keyboard input boundary using InputService and KeyboardState. Use the Arrow keys to move the box in four directions. Movement is driven by input state, not DOM event handling inside the scene.
```

---

## main.js Standard

Each sample bootstrap should stay minimal.

`main.js` should:

1. import `Engine`
2. import the sample scene
3. import theme
4. apply document theme
5. resolve the canvas
6. create the engine
7. set the scene
8. start the engine

### Standard shape

```js
import Engine from "../../../engine/core/Engine.js";
import SampleScene from "./SampleScene.js";
import { Theme, ThemeTokens } from "../../../engine/theme/index.js";

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById("game");
const engine = new Engine({
    canvas,
    width: 960,
    height: 540,
    fixedStepMs: 1000 / 60,
});

engine.setScene(new SampleScene());
engine.start();
```

### Rules

- no sample logic in `main.js`
- no rendering in `main.js`
- no direct input logic in `main.js`
- `main.js` is bootstrapping only

---

## Scene Standard

Each sample should have a single scene file responsible for the sample behavior.

The scene should own:

- sample-specific state
- update logic
- render logic
- local helper methods related to that sample

The scene should not own:

- DOM event listener setup
- engine bootstrapping
- document styling
- theme token definitions

### Required import

Samples should import the same `Scene` base used by `SceneManager`.

Example:

```js
import Scene from "../../../engine/scenes/Scene.js";
```

Do not import a duplicate or alternate `Scene` class.

---

## Canvas Layout Standard

Current approved samples follow this canvas pattern:

- full canvas clear every frame
- themed background fill
- a visible bounded play area
- the sample actor inside that play area
- explanatory text at top-left
- consistent text spacing

### Current text baseline

- start X: `40`
- start Y: `48` to `50`
- line height: `24`
- font: `16px monospace`

### Current text token

Canvas text currently uses:

```js
theme.getColor("textCanvs")
```

Keep that token name as-is until it is intentionally renamed in a separate PR.

---

## Canvas Text Standard

All samples should draw descriptive text inside the canvas.

Use a 4–5 line format:

```text
Engine SampleXX
Demonstrates <main concept>
Use <interaction> or explain passive behavior
Observe <expected result>
This sample <architecture boundary note>
```

### Example: sample01

```text
Engine Sample01
Demonstrates the core engine loop and bounded motion
The ball updates every frame and bounces inside the rectangle
Observe edge response and interpolated motion inside the play area
This sample keeps motion logic inside the scene
```

### Example: sample02

```text
Engine Sample02
Demonstrates the keyboard input boundary
Use Arrow keys to move the box in four directions
Observe movement driven by input state, not DOM events in the scene
This sample reads InputService through a clean scene boundary
```

---

## Theme Usage Standard

Samples should consume theme values, not hardcode primary visual colors.

### Approved theme roles currently in use

- `canvasBackground`
- `actorFill`
- `textCanvs`

### Example

```js
context.fillStyle = theme.getColor("canvasBackground");
context.fillRect(0, 0, width, height);

context.fillStyle = theme.getColor("actorFill");
context.fillRect(...);

context.fillStyle = theme.getColor("textCanvs");
context.fillText(...);
```

### Rules

- sample code may use a simple hardcoded stroke color for demo bounds if needed
- primary background and actor colors should come from theme
- document background should be applied via `theme.applyDocumentTheme()`

---

## Bounds and Play Area Standard

If the sample demonstrates motion, it should visually show the play area.

Use:

- a clearly drawn rectangle
- actor movement constrained inside it
- behavior that is obvious to the viewer

### sample01 behavior

- ball moves continuously
- ball bounces inside rectangle
- motion is frame-based
- render uses interpolated draw position

### sample02 behavior

- box moves from input
- box clamps inside rectangle
- movement is direct and readable

---

## Interaction Standard

If a sample is interactive:

- explain controls in the HTML paragraph
- explain controls again in canvas text
- keep controls simple
- do not hide controls

### Current input sample rule

Keyboard movement must be read through the input boundary, not by DOM event handling in the scene.

---

## Concern Separation Rules

All new samples must respect the boundaries.

### Allowed in sample HTML

- layout
- descriptive heading
- descriptive paragraph
- canvas tag
- module script

### Allowed in `main.js`

- bootstrap only

### Allowed in scene

- sample state
- sample update logic
- sample render logic
- sample-local helper methods

### Not allowed in scene

- `document.addEventListener(...)`
- direct DOM wiring
- document-level styling
- engine construction

### Not allowed in `main.js`

- gameplay logic
- scene behavior
- rendering rules

---

## Writing Style Rules

Text should be:

- plain
- direct
- descriptive
- instructional
- architecture-aware

Avoid:

- vague labels
- one-word descriptions
- unexplained demos
- hidden controls

Every sample should answer:

- What is this?
- What does it prove?
- What do I do?
- What should I observe?
- What boundary does it protect?

---

## New Sample Checklist

Before considering a new sample complete, verify:

- [ ] folder uses `sampleXX-name`
- [ ] `index.html` exists
- [ ] `main.js` exists
- [ ] one scene file exists
- [ ] HTML includes title, heading, paragraph, canvas
- [ ] `main.js` only bootstraps
- [ ] scene extends the correct `Scene`
- [ ] canvas uses theme for main colors
- [ ] canvas text explains the sample clearly
- [ ] interactive controls are documented
- [ ] sample demonstrates one main concept
- [ ] no boundary bleed exists

---

## Do / Do Not

### Do

- keep samples small
- keep samples readable
- use sample01 and sample02 as reference
- explain what the sample proves
- make the demo behavior obvious

### Do Not

- turn samples into games
- mix engine logic into sample scene code
- add DOM event wiring inside scenes
- hardcode major visual identity colors in samples
- skip explanatory text

---

## Future Note

This template reflects the currently approved state of:

- `sample01-basic-loop`
- `sample02-keyboard-move`

If those templates are intentionally improved later, update this document in the same PR or immediately after.
