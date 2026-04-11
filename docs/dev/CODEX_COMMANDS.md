MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute BUILD_PR_SAMPLES_INDEX_FIXES_AND_TARGETED_PREVIEW_RETRY with the following exact scope only:

1. Edit `samples/index.html`
   - remove header reference `(xxyy - xxzz)`
   - update phase dropdown labels to exactly `Phase xx - <phase name>`
   - no other layout or metadata/tag changes

2. Fix Sample 1303 (`samples/phase13/1303/*` and only sample-local supporting files if required)
   - asteroid velocity is exploding to extreme values
   - add a reasonable asteroid max-speed cap/clamp locally in the sample
   - preserve normal Asteroids-style feel
   - no engine/core changes
   - do not touch Samples 1316, 1317, 1318

3. Retry preview SVG generation only for this exact list:
   0102,0107,0110,0116,0117,0119,
   0206,0212,0218,0220,0221,0223,
   0305,0306,0307,0308,0311,0318,0320,0322,0324,
   0407,0409,0412,
   0508,
   0601,0603,0605,0607,0608,0612,
   0707,0709,0712,
   0801,0808,
   0904,
   1101,1102,1103,
   1201,1202,1203,1206,1207,
   1301,1302,1303,1305,1306,1307,1308,1309,1311,1313,1314,1315,
   1401,1404,1410,1418,
   1503,1506

   Retry logic:
   - inspect current generated preview SVG for each listed sample
   - regenerate only if the SVG currently contains the literal text `Capture timeout`
   - do not retry any samples outside this list
   - do not use previous failed-detection logic
   - allow runtime to settle before capture with adaptive wait and a minimum of ~3 seconds
   - do not touch 1316, 1317, 1318

4. Validate and package
   - report exact files changed
   - confirm no engine files changed
   - report which listed samples were retried vs skipped
   - confirm no non-listed samples were touched
   - package repo-structured delta ZIP to:
     `<project folder>/tmp/BUILD_PR_SAMPLES_INDEX_FIXES_AND_TARGETED_PREVIEW_RETRY_delta.zip`
