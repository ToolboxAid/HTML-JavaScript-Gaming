# PR_26126_100 Asset Manager V2 Color Usage ID Notes

## Usage Field
- Color assets now expose a required `Usage` textbox directly under `Role`.
- `Usage` is hidden and disabled for non-Color asset types.
- The typed Usage value remains editable as entered; normalization is applied only when generating the asset ID segment.

## Color ID Shape
- Color IDs now use `assets.<type>.<role>.<usage>.<colorName>`.
- Example: Usage `Primary HUD` plus swatch `Sky Blue` becomes `assets.color.hud.primary-hud.sky-blue`.
- The original palette swatch name is not altered in color metadata.
- Color path generation is unchanged; swatch `Sky Blue` still resolves to `palette://workspace/sky-blue`.

## Validation
- Selecting a Color swatch without Usage leaves the generated ID empty and keeps `Add Asset` disabled.
- Missing Usage validation is routed to Status only: `Selected color validation failed: Color usage is required for color assets.`
- Schema validation rejects Color asset IDs that do not include both Usage and color name segments.
