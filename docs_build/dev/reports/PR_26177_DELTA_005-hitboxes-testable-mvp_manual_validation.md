# Manual Validation Notes

## Creator MVP Flow
1. Open `/toolbox/index.html` and choose Hitboxes.
2. Confirm `/toolbox/hitboxes/index.html` loads the Hitboxes tool.
3. If no real Objects have assigned visual metadata, confirm the Object A/Object B selectors show `DEV Review Ball` and `DEV Review Paddle` labeled as DEV review/test data.
4. Confirm the center canvas shows Object A and Object B placeholders, bounding boxes, and origin markers.
5. Click `Add Rectangle`.
6. Select the new hitbox in the left list.
7. Drag the rectangle on the canvas and confirm x/y fields update.
8. Drag the bottom-right handle and confirm width/height fields update.
9. Edit x/y/width/height fields and confirm the overlay updates.
10. Toggle enabled and visible and confirm the list/status updates.
11. Sign in as a creator, click `Save Hitboxes`, and confirm save status becomes `saved`.
12. As a guest or with `?guest=1`, click `Save Hitboxes` and confirm redirect to `/account/sign-in.html`.

## Static Collision Preview
1. Select Object A and Object B.
2. Set Object A x/y to `0,0`.
3. Set Object B x/y to `0,10` with a 10x10 Object A hitbox.
4. Click `Test Static` and confirm `touching`.
5. Set Object B y to `5`.
6. Click `Test Static` and confirm `overlapping`.
7. Set Object B y to `50`.
8. Click `Test Static` and confirm `separated`.

## Swept Speed Regression
1. Use the DEV Review Ball as Object A and DEV Review Paddle as Object B.
2. Ensure Object A hitbox size is 10x10.
3. Click `Reset` in Motion Preview.
4. Confirm Object A start is `0,0`, velocity is `0,1`, speed is `100`, Object B is `0,50`, and step count is `1`.
5. Click `Run Preview`.
6. Confirm the result says `Collision detected before the next frame`.
7. Confirm impact time, impact point, impact normal, before position, and after position are shown.
