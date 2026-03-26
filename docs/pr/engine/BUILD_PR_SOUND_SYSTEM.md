Toolbox Aid
David Quesenberry
03/24/2026
BUILD_PR_SOUND_SYSTEM.md

# BUILD_PR — Sound System

## Goal
Add a minimal reusable engine-owned sound system first, then integrate it into Pong in a controlled way.

## Scope
This BUILD_PR authorizes:
1. A reusable engine audio service
2. Safe browser audio unlock handling
3. One-shot sound playback
4. Master mute support
5. Generated Pong sound effects
6. Pong integration for serve, paddle hit, wall hit, and score events
7. Tests or mock-based validation where practical

## Locked Rules
- Follow PLAN_PR → BUILD_PR → APPLY_PR
- Reusable code goes to engine
- Games consume engine services through public contracts
- Keep change surgical
- No unrelated refactors
- No raw browser audio API usage inside Pong logic

## Engine Additions Allowed
Suggested targets:
- engine/audio/AudioService.js
- engine/audio/index.js

Optional docs:
- docs/dev/engine/AUDIO.md

Optional tests:
- tests/audio/AudioService.test.mjs
- tests/games/PongAudioIntegration.test.mjs

## Responsibilities

### Engine Audio Service
The engine audio service should:
- lazily initialize browser audio
- unlock audio safely on first valid user gesture
- expose one-shot playback by sound key
- support mute toggle
- fail safely if audio is unavailable
- keep browser/audio API details out of Pong code

### Pong Integration
Pong should emit semantic sound events only:
- serve
- paddle hit
- wall hit
- score

Playback should happen through the engine contract only.

## Recommended Defaults
Keep the following block as an implementation comment in the audio service or Pong sound registration file:

Recommended Defaults
- Paddle/Bounce: 400 Hz, 0.10 s, square, volume 0.20
- Wall (optional distinction): 380 Hz, 0.08–0.10 s, square, volume 0.15
- Score (recommended 2-step): 400 Hz for 0.12 s, then 300 Hz for 0.25 s, square, volume 0.25
- Serve: 500 Hz, 0.08 s, square, volume 0.20

## Sound Design Rules
- Prefer generated tones over external audio files
- Keep sounds short and arcade-clean
- Prioritize classic feel over realism
- Keep volume conservative to avoid clipping
- Unknown sound keys must fail safely without throwing

## Browser Unlock Rules
Modern browsers may require a gesture before audio playback.
The engine service must:
- start in a safe locked/pending state
- unlock on valid user interaction
- fail quietly before unlock instead of throwing console errors

## Mute Policy
- Default sound enabled
- Pong may bind M to mute toggle
- Mute state lives in engine audio service

## Acceptance Criteria
Done means:
- engine has reusable audio service
- safe unlock handling works
- Pong can trigger sound on serve, hit, wall, and score
- mute works
- no console errors
- no raw audio API usage inside Pong scene/game logic
- tests or mock validation cover critical paths

## Non-Goals
- background music
- advanced mixing
- per-channel buses
- persistent audio settings
- global audio rollout across all games

## Build Sequence
1. Add engine audio service
2. Implement unlock, one-shot play, and mute
3. Add generated Pong tones
4. Integrate Pong event hooks
5. Add tests/mock validation
6. Verify browser behavior
7. Commit

## Commit Comment
Add engine audio service and integrate Pong sound effects

## Notes for Codex
- Keep the implementation small
- Keep sound definitions centralized
- Include a comment block with the Recommended Defaults in the implementation
- Do not refactor unrelated input or rendering systems
