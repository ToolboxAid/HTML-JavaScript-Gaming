/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsAudio.js
*/
import { GaplessLoopPlayer, HtmlAudioMediaBackend, MediaTrackService } from '/src/engine/audio/index.js';

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

  ensureInitialized() {
    if (this.initialized) {
      return;
    }

    this.media.register('fire', { src: '/games/asteroids_new/assets/fire.wav', volume: 0.55 });
    this.media.register('bangLarge', { src: '/games/asteroids_new/assets/bangLarge.wav', volume: 0.65 });
    this.media.register('bangMedium', { src: '/games/asteroids_new/assets/bangMedium.wav', volume: 0.6 });
    this.media.register('bangSmall', { src: '/games/asteroids_new/assets/bangSmall.wav', volume: 0.55 });
    this.media.register('beat1', { src: '/games/asteroids_new/assets/beat1.wav', volume: 0.45 });
    this.media.register('beat2', { src: '/games/asteroids_new/assets/beat2.wav', volume: 0.45 });
    this.loopPlayer.register('extraShip', { src: '/games/asteroids_new/assets/extraShip.wav', volume: 0.6, overlapSeconds: 0.035, fadeSeconds: 0.012 });
    this.loopPlayer.register('thrust', { src: '/games/asteroids_new/assets/thrust.wav', volume: 0.35, overlapSeconds: 0.03, fadeSeconds: 0.01 });
    this.loopPlayer.register('saucerLarge', { src: '/games/asteroids_new/assets/saucerBig.wav', volume: 0.35, overlapSeconds: 0.03, fadeSeconds: 0.01 });
    this.loopPlayer.register('saucerSmall', { src: '/games/asteroids_new/assets/saucerSmall.wav', volume: 0.4, overlapSeconds: 0.03, fadeSeconds: 0.01 });
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
