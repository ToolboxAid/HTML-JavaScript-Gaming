# PR_26171_029 Text To Speech Tool Shell

Replaced the placeholder at `toolbox/text-to-speech/index.html` with the rebuilt Theme V2 page shell and wired its module from `toolbox/text-to-speech/text2speech.js`.

The active toolbox registration already points to `text-to-speech/index.html`, so registration was preserved. The incorrect root `tools/text2speech/` path was removed. No inline styles, style blocks, inline event handlers, page-local CSS, or tool-local CSS were added.
