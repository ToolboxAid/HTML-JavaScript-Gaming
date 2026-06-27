Asteroids launch/audio path validation
Date: 2026-04-20

Scope
- games/Asteroids/systems/AsteroidsAudio.js
- games/Asteroids/index.html
- games/metadata/games.index.metadata.json
- games/index.render.js

Validated
- Primary target: /games/Asteroids/index.html
- Debug target: /games/Asteroids/index.html?debug=1
- Runtime audio assets now resolve under /games/Asteroids/assets/audio/*.wav
- No asteroids_new references remain in scoped files

Commands
- rg -n "asteroids_new" games/Asteroids games/index.render.js games/metadata/games.index.metadata.json
- node --check games/Asteroids/systems/AsteroidsAudio.js

Result
- PASS: all scoped checks passed
