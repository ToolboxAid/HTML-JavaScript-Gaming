# Games Template

This folder is a minimal starting point for a new game scaffold.

## Included Files

- `index.js`: exports the template flow map.
- `flow/attract.js`: placeholder attract flow descriptor.
- `flow/intro.js`: placeholder intro flow descriptor.

## Usage

Import the template flow map and replace placeholders as your game wiring is introduced.

```js
import templateFlow from "./index.js";

// templateFlow.attract
// templateFlow.intro
```

## Import Rules

Use direct project-root relative imports for shared and engine modules:

```js
import { sanitizeText } from "src/shared/utils/stringUtils.js";
import { createEngineLoop } from "src/engine/core/createEngineLoop.js";
```

Do not use relative climbing imports like `../../` inside games code.
