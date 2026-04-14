
MODEL: GPT-5.4
REASONING: high

UPDATE EXISTING PR:

Add startup behavior:

- On game load (before gameplay)
- If bezel detected AND override file missing:
  create:
  games/<game>/assets/images/bezel.stretch.override.json

- Do NOT overwrite if it already exists
- Ensure this runs once during init
