# Engine Runtime Theme

`src/engine/theme/` owns engine/runtime first-class tool shell styling and shared runtime header helpers.

## Files

- `main.css` imports the runtime theme CSS modules.
- `toolboxaid-header.html` contains the raw shared runtime header markup.
- `toolboxaid-header.css` imports runtime header/nav styling.
- `toolboxaid-header.js` exports the runtime header HTML and mount helpers.
- `mount-shared-header.js` mounts the runtime header and related runtime page enhancements.
- `Theme.js` and `ThemeTokens.js` provide runtime theme helpers used by tooling.
- `accordionV2/` contains the runtime accordion component CSS and JS.

Static runtime assets currently consumed by this surface:

- `assets/theme/v1/images/toolboxaid-header.png` remains a legacy runtime header image.
- `assets/theme/v2/fonts/fontawesome/` contains the Font Awesome font package imported by `main.css`.

## Import

```js
import { mountToolboxAidHeader } from '/src/engine/theme/toolboxaid-header.js';

window.addEventListener('DOMContentLoaded', () => {
  mountToolboxAidHeader(document.body);
});
```
