# Requirement Checklist

## Object Source
- PASS: Hitboxes loads source Objects through the Local API/service contract.
- PASS: Objects with assigned sprite/vector/asset metadata are preferred.
- PASS: DEV review/test sample Objects are served through the server/API contract when no eligible Objects exist.
- PASS: DEV sample Objects are clearly labeled as DEV review/test data.
- PASS: No browser-local product data is used as source of truth.
- PASS: Authoritative object data is not stored in browser storage.

## Visual Preview
- PASS: Selected Objects show assigned visual metadata when available.
- PASS: DEV-safe placeholders are tied to object records when asset rendering is unavailable.
- PASS: Object bounding boxes are drawn.
- PASS: Object origin markers are drawn.

## Layout
- PASS: Left panel includes Object A selector, Object B selector, hitbox list, Add Rectangle, Delete, and filters.
- PASS: Center panel includes a large visual editor canvas with Object A/Object B visuals, bounding boxes, origins, overlays, and motion path.
- PASS: Right panel includes selected object metadata, hitbox properties, collision controls, and motion/speed controls.
- PASS: Bottom status includes Object A, Object B, selected hitbox, collision result, and save status.

## Hitbox Editing
- PASS: Add Rectangle creates a visible Object A hitbox.
- PASS: Creator can select a hitbox.
- PASS: Creator can drag/move a hitbox.
- PASS: Creator can resize a hitbox.
- PASS: Property fields update from drag/resize.
- PASS: Property field edits update the overlay.
- PASS: Delete hitbox is supported.
- PASS: Enable/disable and visible/hidden toggles are supported.

## Persistence
- PASS: Hitboxes save through the Local API/service contract.
- PASS: Server/API owns persisted hitbox keys.
- PASS: Created hitbox records receive ULID keys.
- PASS: Guest save redirects to `account/sign-in.html`.
- PASS: No silent fallback saves are implemented.
- PASS: Browser storage is not used as product-data source of truth.

## Collision Preview
- PASS: Object A and Object B are visible in the editor.
- PASS: Static states include separated, touching, and overlapping.
- PASS: Static collision classification is implemented in the shared engine collision module.
- PASS: Page JS does not duplicate the shared collision classification.

## Motion/Speed Preview
- PASS: Motion controls include Object A start x/y, velocity x/y, speed, Object B x/y, frame rate, step count, Run Preview, Step Frame, and Reset.
- PASS: Preview shows path, frame positions, impact frame/time, before/after position, and result message.
- PASS: Fast ball/paddle swept collision regression is covered by the shared engine unit test.
- PASS: Page JS calls shared swept AABB logic instead of duplicating collision math.

## Theme/HTML Rules
- PASS: Theme V2 is used.
- PASS: JavaScript is external.
- PASS: CSS is external/existing Theme V2 only.
- PASS: No inline styles, style blocks, script blocks, or inline event handlers were found.

## Scope Guard
- PASS: No unrelated tools were modified.
- PASS: No `start_of_day` folders were modified.
- PASS: No repo-wide refactors were added.

## Validation
- PASS: Targeted Playwright tests were added/updated for toolbox navigation, object source loading, DEV samples, visual preview, rectangle creation, move, resize, save, static collision, swept speed regression, and guest redirect.
- PASS: Unit tests were updated for shared collision logic.
- BLOCKED: Playwright execution is environment-blocked because Chromium is not installed and `npx playwright install chromium` timed out.
