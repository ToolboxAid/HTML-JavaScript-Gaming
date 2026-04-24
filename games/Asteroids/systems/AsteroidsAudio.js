/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsAudio.js
*/
import { GaplessLoopPlayer, HtmlAudioMediaBackend, MediaTrackService } from '../../../src/engine/audio/index.js';
import { resolveWorkspaceGameAssetPath } from '../../shared/workspaceGameAssetCatalog.js';

const ASTEROIDS_GAME_ID = "Asteroids";
const ASTEROIDS_AUDIO_ASSET_IDS = Object.freeze({
  fire: "audio.asteroids.fire",
  bangLarge: "audio.asteroids.bang-large",
  bangMedium: "audio.asteroids.bang-medium",
  bangSmall: "audio.asteroids.bang-small",
  beat1: "audio.asteroids.beat-1",
  beat2: "audio.asteroids.beat-2",
  extraShip: "audio.asteroids.extra-ship",
  thrust: "audio.asteroids.thrust",
  saucerLarge: "audio.asteroids.saucer-large",
  saucerSmall: "audio.asteroids.saucer-small"
});

export default class AsteroidsAudio {
  constructor() {
    this.media = new MediaTrackService({
      backend: new HtmlAudioMediaBackend(),
    });
    this.loopPlayer = new GaplessLoopPlayer();
    this.initialized = false;
    this.thrustActive = false;
    this.activeUfoTrack = null;
  }

  resolveAudioPath(assetId) {
    return resolveWorkspaceGameAssetPath(ASTEROIDS_GAME_ID, assetId);
  }

  ensureInitialized() {
    if (this.initialized) {
      return;
    }

    const firePath = this.resolveAudioPath(ASTEROIDS_AUDIO_ASSET_IDS.fire);
    const bangLargePath = this.resolveAudioPath(ASTEROIDS_AUDIO_ASSET_IDS.bangLarge);
    const bangMediumPath = this.resolveAudioPath(ASTEROIDS_AUDIO_ASSET_IDS.bangMedium);
    const bangSmallPath = this.resolveAudioPath(ASTEROIDS_AUDIO_ASSET_IDS.bangSmall);
    const beat1Path = this.resolveAudioPath(ASTEROIDS_AUDIO_ASSET_IDS.beat1);
    const beat2Path = this.resolveAudioPath(ASTEROIDS_AUDIO_ASSET_IDS.beat2);
    const extraShipPath = this.resolveAudioPath(ASTEROIDS_AUDIO_ASSET_IDS.extraShip);
    const thrustPath = this.resolveAudioPath(ASTEROIDS_AUDIO_ASSET_IDS.thrust);
    const saucerLargePath = this.resolveAudioPath(ASTEROIDS_AUDIO_ASSET_IDS.saucerLarge);
    const saucerSmallPath = this.resolveAudioPath(ASTEROIDS_AUDIO_ASSET_IDS.saucerSmall);

    if (firePath) this.media.register('fire', { src: firePath, volume: 0.55 });
    if (bangLargePath) this.media.register('bangLarge', { src: bangLargePath, volume: 0.65 });
    if (bangMediumPath) this.media.register('bangMedium', { src: bangMediumPath, volume: 0.6 });
    if (bangSmallPath) this.media.register('bangSmall', { src: bangSmallPath, volume: 0.55 });
    if (beat1Path) this.media.register('beat1', { src: beat1Path, volume: 0.45 });
    if (beat2Path) this.media.register('beat2', { src: beat2Path, volume: 0.45 });
    if (extraShipPath) this.loopPlayer.register('extraShip', { src: extraShipPath, volume: 0.6, overlapSeconds: 0.035, fadeSeconds: 0.012 });
    if (thrustPath) this.loopPlayer.register('thrust', { src: thrustPath, volume: 0.35, overlapSeconds: 0.03, fadeSeconds: 0.01 });
    if (saucerLargePath) this.loopPlayer.register('saucerLarge', { src: saucerLargePath, volume: 0.35, overlapSeconds: 0.03, fadeSeconds: 0.01 });
    if (saucerSmallPath) this.loopPlayer.register('saucerSmall', { src: saucerSmallPath, volume: 0.4, overlapSeconds: 0.03, fadeSeconds: 0.01 });
    this.initialized = true;
  }

  play(id) {
    this.ensureInitialized();
    if (id === 'extraShip') {
      this.playExtraShipLoops(10);
      return;
    }
    this.media.stop(id);
    this.media.play(id);
  }

  playExtraShipLoops(loopCount = 1) {
    this.ensureInitialized();
    this.loopPlayer.play('extraShip', { loopCount: Math.max(1, loopCount) });
  }

  updateThrust(active) {
    this.ensureInitialized();
    if (active && !this.thrustActive) {
      this.loopPlayer.play('thrust');
    } else if (!active && this.thrustActive) {
      this.loopPlayer.stop('thrust');
    }
    this.thrustActive = active;
  }

  updateUfo(type) {
    this.ensureInitialized();
    const nextTrack = type === 'small'
      ? 'saucerSmall'
      : type === 'large'
        ? 'saucerLarge'
        : null;

    if (this.activeUfoTrack === nextTrack) {
      return;
    }

    if (this.activeUfoTrack) {
      this.loopPlayer.stop(this.activeUfoTrack);
    }

    this.activeUfoTrack = nextTrack;
    if (this.activeUfoTrack) {
      this.loopPlayer.play(this.activeUfoTrack);
    }
  }

  stopAll() {
    this.loopPlayer.stopAll();
    this.thrustActive = false;
    this.activeUfoTrack = null;
  }
}
