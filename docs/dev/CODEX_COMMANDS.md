MODEL: GPT-5.4
REASONING: high

COMMAND:
- add initial real tool-editable JSON bootstrap objects under:
  - games/Asteroids/assets/sprites/data/
  - games/Asteroids/assets/tilemaps/data/
  - games/Asteroids/assets/parallax/data/
  - games/Asteroids/assets/vectors/data/
- keep runtime assets untouched
- use minimal but real JSON objects, not placeholders only
- align names with current Asteroids asset intent where practical
- do not modify engine code
- commit format:
  description first line
  PR name last line
- update roadmap status only
