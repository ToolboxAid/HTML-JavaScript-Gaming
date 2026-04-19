# Shared Toolbox Aid Header

This folder now contains the raw shared header source plus the importable module.

## Files
- `toolboxaid-header.html` → raw shared header markup
- `toolboxaid-header.css` → shared styling
- `toolboxaid-header.js` → importable module that exports the HTML and mount helpers
- `index.js` → re-export entry

## Import
```js
import { mountToolboxAidHeader } from '/src/engine/theme/index.js';

window.addEventListener('DOMContentLoaded', () => {
  mountToolboxAidHeader(document.body);
});
```
