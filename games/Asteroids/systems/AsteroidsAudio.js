/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsAudio.js
*/
import { GaplessLoopPlayer, HtmlAudioMediaBackend, MediaTrackService } from '../../../src/engine/audio/index.js';

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

    this.media.register('fire', { src: '/games/Asteroids/assets/audio/fire.wav', volume: 0.55 });
    this.media.register('bangLarge', { src: '/games/Asteroids/assets/audio/bangLarge.wav', volume: 0.65 });
    this.media.register('bangMedium', { src: '/games/Asteroids/assets/audio/bangMedium.wav', volume: 0.6 });
    this.media.register('bangSmall', { src: '/games/Asteroids/assets/audio/bangSmall.wav', volume: 0.55 });
    this.media.register('beat1', { src: '/games/Asteroids/assets/audio/beat1.wav', volume: 0.45 });
    this.media.register('beat2', { src: '/games/Asteroids/assets/audio/beat2.wav', volume: 0.45 });
    this.loopPlayer.register('extraShip', { src: '/games/Asteroids/assets/audio/extraShip.wav', volume: 0.6, overlapSeconds: 0.035, fadeSeconds: 0.012 });
    this.loopPlayer.register('thrust', { src: '/games/Asteroids/assets/audio/thrust.wav', volume: 0.35, overlapSeconds: 0.03, fadeSeconds: 0.01 });
    this.loopPlayer.register('saucerLarge', { src: '/games/Asteroids/assets/audio/saucerBig.wav', volume: 0.35, overlapSeconds: 0.03, fadeSeconds: 0.01 });
    this.loopPlayer.register('saucerSmall', { src: '/games/Asteroids/assets/audio/saucerSmall.wav', volume: 0.4, overlapSeconds: 0.03, fadeSeconds: 0.01 });
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
