
## ADDITIONAL REQUIREMENT UPDATE

When the game loads (pre-gameplay phase):

If a bezel is detected AND the file:
games/<game>/assets/images/bezel.stretch.override.json

DOES NOT exist:
- automatically create this file
- create it BEFORE gameplay begins (startup/init phase)
- include the shared stretch variable with a safe default
- ensure this happens only once (do not overwrite existing file)

Intent:
- developer immediately sees where to tweak stretch
- no manual setup required
