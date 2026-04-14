MODEL: GPT-5.4
REASONING: high

COMMAND:
- create missing data/ folders under:
  games/Asteroids/assets/{sprites,tilemaps,parallax,vectors}/data
- ensure structure exists even if empty (.gitkeep allowed)
- do not delete or move runtime assets
- do not modify engine code
- commit format:
  description first line
  PR name last line
- update roadmap status only
