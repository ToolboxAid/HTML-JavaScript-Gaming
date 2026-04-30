# PR 11.86 Validation Requirements

Run targeted checks only:

```powershell
Select-String -Path .\games\**\game.manifest.json -Pattern '"image\..*\.bezel"|"uniformEdgeStretchPx"|"asset-browser"|"stretchOverride"'
Select-String -Path .\games\**\game.manifest.json -Pattern 'asset-browser.*bezel|"assets".*"bezel"'
```

Expected:
- `uniformEdgeStretchPx` appears under `image.*.bezel` entries only.
- No `asset-browser.assets.bezel.stretchOverride` remains.
- Asteroids launches without bezel/background 404s.
