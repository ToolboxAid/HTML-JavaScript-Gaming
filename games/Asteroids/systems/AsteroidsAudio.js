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
  fire: "assets.audio.sound.fire",
  bangLarge: "assets.audio.sound.bang-large",
  bangMedium: "assets.audio.sound.bang-medium",
  bangSmall: "assets.audio.sound.bang-small",
  beat1: "assets.audio.music.beat-1",
  beat2: "assets.audio.music.beat-2",
  extraShip: "assets.audio.sound.extra-ship",
  thrust: "assets.audio.sound.thrust",
  saucerLarge: "assets.audio.sound.saucer-large",
  saucerSmall: "assets.audio.sound.saucer-small"
});

export default class AsteroidsAudio {
  constructor({
    media = new MediaTrackService({ backend: new HtmlAudioMediaBackend() }),
    loopPlayer = new GaplessLoopPlayer(),
    logger = console
  } = {}) {
    this.media = media;
    this.loopPlayer = loopPlayer;
    this.logger = logger;
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

    this.registerMediaTrack("fire", ASTEROIDS_AUDIO_ASSET_IDS.fire, { volume: 0.55 });
    this.registerMediaTrack("bangLarge", ASTEROIDS_AUDIO_ASSET_IDS.bangLarge, { volume: 0.65 });
    this.registerMediaTrack("bangMedium", ASTEROIDS_AUDIO_ASSET_IDS.bangMedium, { volume: 0.6 });
    this.registerMediaTrack("bangSmall", ASTEROIDS_AUDIO_ASSET_IDS.bangSmall, { volume: 0.55 });
    this.registerMediaTrack("beat1", ASTEROIDS_AUDIO_ASSET_IDS.beat1, { volume: 0.45 });
    this.registerMediaTrack("beat2", ASTEROIDS_AUDIO_ASSET_IDS.beat2, { volume: 0.45 });
    this.registerLoopTrack("extraShip", ASTEROIDS_AUDIO_ASSET_IDS.extraShip, { volume: 0.6, overlapSeconds: 0.035, fadeSeconds: 0.012 });
    this.registerLoopTrack("thrust", ASTEROIDS_AUDIO_ASSET_IDS.thrust, { volume: 0.35, overlapSeconds: 0.03, fadeSeconds: 0.01 });
    this.registerLoopTrack("saucerLarge", ASTEROIDS_AUDIO_ASSET_IDS.saucerLarge, { volume: 0.35, overlapSeconds: 0.03, fadeSeconds: 0.01 });
    this.registerLoopTrack("saucerSmall", ASTEROIDS_AUDIO_ASSET_IDS.saucerSmall, { volume: 0.4, overlapSeconds: 0.03, fadeSeconds: 0.01 });
    this.initialized = true;
  }

  registerMediaTrack(trackId, assetId, options = {}) {
    const src = this.resolveAudioPath(assetId);
    if (!src) {
      this.warnAudio(`Asteroids audio asset ${assetId} did not resolve for media track ${trackId}. Check game.manifest.json asset-manager-v2 audio entries.`);
      return;
    }
    this.media.register(trackId, { src, ...options });
    if (this.media.lastError) {
      this.warnAudio(`Asteroids audio media track ${trackId} failed to register from ${src}: ${this.media.lastError}`);
    }
  }

  registerLoopTrack(trackId, assetId, options = {}) {
    const src = this.resolveAudioPath(assetId);
    if (!src) {
      this.warnAudio(`Asteroids audio asset ${assetId} did not resolve for loop track ${trackId}. Check game.manifest.json asset-manager-v2 audio entries.`);
      return;
    }
    this.loopPlayer.register(trackId, { src, ...options });
  }

  play(id) {
    this.ensureInitialized();
    if (id === 'extraShip') {
      return this.playExtraShipLoops(10);
    }
    this.media.stop(id);
    return this.playMediaTrack(id);
  }

  async playMediaTrack(id) {
    const played = await this.media.play(id);
    if (!played) {
      this.warnAudio(`Asteroids audio playback failed for media track ${id}: ${this.media.lastError || "unknown media error"}`);
    }
    return played;
  }

  playExtraShipLoops(loopCount = 1) {
    this.ensureInitialized();
    return this.playLoopTrack('extraShip', { loopCount: Math.max(1, loopCount) });
  }

  async playLoopTrack(id, options = {}) {
    const played = await this.loopPlayer.play(id, options);
    if (!played) {
      this.warnAudio(`Asteroids audio playback failed for loop track ${id}: ${this.loopPlayer.lastError || "unknown loop error"}`);
    }
    return played;
  }

  updateThrust(active) {
    this.ensureInitialized();
    if (active && !this.thrustActive) {
      void this.playLoopTrack('thrust');
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
      void this.playLoopTrack(this.activeUfoTrack);
    }
  }

  stopAll() {
    this.loopPlayer.stopAll();
    this.thrustActive = false;
    this.activeUfoTrack = null;
  }

  warnAudio(message) {
    this.logger?.warn?.(`WARN ${message}`);
  }
}
