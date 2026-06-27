# PR_26177_DELTA_004 Hitboxes Real Object Source Manual Validation Notes

- Open `toolbox/objects/index.html`.
- Add or use an Object with render type `Sprite` so the Objects service assigns visual asset metadata.
- Open `toolbox/hitboxes/index.html?objectKey=<object-key>&sourceTool=objects`.
- Confirm the left panel lists only Objects with assigned visual metadata.
- Select an Object and confirm Object A preview, bounding box, origin, and metadata update.
- If the assigned asset image cannot render, confirm the fallback says metadata exists and rendering is pending.
- Confirm no hitbox drawing/editing controls are present in this PR.
