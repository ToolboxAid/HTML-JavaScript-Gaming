/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsAudio.js
*/
import { HtmlAudioMediaBackend, MediaTrackService } from '../../../engine/audio/index.js';

export default class AsteroidsAudio {
  constructor() {
    this.media = new MediaTrackService({
      backend: new HtmlAudioMediaBackend(),
    });
    this.initialized = false;
    this.thrustActive = false;
    this.activeUfoTrack = null;
    this.extraShipPlaybackToken = 0;
    this.extraShipStopTimer = null;
    this.extraShipMetadataHandler = null;
  }

  ensureInitialized() {
    if (this.initialized) {
      return;
    }

    this.media.register('fire', { src: '/games/Asteroids/assets/fire.wav', volume: 0.55 });
    this.media.register('bangLarge', { src: '/games/Asteroids/assets/bangLarge.wav', volume: 0.65 });
    this.media.register('bangMedium', { src: '/games/Asteroids/assets/bangMedium.wav', volume: 0.6 });
    this.media.register('bangSmall', { src: '/games/Asteroids/assets/bangSmall.wav', volume: 0.55 });
    this.media.register('beat1', { src: '/games/Asteroids/assets/beat1.wav', volume: 0.45 });
    this.media.register('beat2', { src: '/games/Asteroids/assets/beat2.wav', volume: 0.45 });
    this.media.register('extraShip', { src: '/games/Asteroids/assets/extraShip.wav', loop: true, volume: 0.6 });
    this.media.register('thrust', { src: '/games/Asteroids/assets/thrust.wav', loop: true, volume: 0.35 });
    this.media.register('saucerLarge', { src: '/games/Asteroids/assets/saucerBig.wav', loop: true, volume: 0.35 });
    this.media.register('saucerSmall', { src: '/games/Asteroids/assets/saucerSmall.wav', loop: true, volume: 0.4 });
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
    const track = this.media.tracks.get('extraShip');
    if (!track) {
      return;
    }

    this.extraShipPlaybackToken += 1;
    const token = this.extraShipPlaybackToken;
    track.pause?.();
    track.currentTime = 0;
    track.loop = true;
    this.clearExtraShipStopTimer();
    track.play?.();

    const scheduleStop = () => {
      if (token !== this.extraShipPlaybackToken) {
        return;
      }

      const duration = Number.isFinite(track.duration) ? track.duration : 0;
      if (duration <= 0) {
        return;
      }

      this.clearExtraShipStopTimer();
      this.extraShipStopTimer = globalThis.setTimeout?.(() => {
        if (token !== this.extraShipPlaybackToken) {
          return;
        }

        track.pause?.();
        track.currentTime = 0;
        track.loop = true;
        this.extraShipStopTimer = null;
      }, duration * Math.max(1, loopCount) * 1000);
    };

    if (Number.isFinite(track.duration) && track.duration > 0) {
      scheduleStop();
      return;
    }

    if (this.extraShipMetadataHandler) {
      track.removeEventListener?.('loadedmetadata', this.extraShipMetadataHandler);
    }

    this.extraShipMetadataHandler = () => {
      track.removeEventListener?.('loadedmetadata', this.extraShipMetadataHandler);
      this.extraShipMetadataHandler = null;
      scheduleStop();
    };
    track.addEventListener?.('loadedmetadata', this.extraShipMetadataHandler);
  }

  updateThrust(active) {
    this.ensureInitialized();
    if (active && !this.thrustActive) {
      this.media.play('thrust');
    } else if (!active && this.thrustActive) {
      this.media.pause('thrust');
      this.media.seek('thrust', 0);
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
      this.media.pause(this.activeUfoTrack);
      this.media.seek(this.activeUfoTrack, 0);
    }

    this.activeUfoTrack = nextTrack;
    if (this.activeUfoTrack) {
      this.media.play(this.activeUfoTrack);
    }
  }

  stopAll() {
    this.extraShipPlaybackToken += 1;
    this.clearExtraShipStopTimer();
    this.media.stop('thrust');
    this.media.stop('extraShip');
    this.media.stop('saucerLarge');
    this.media.stop('saucerSmall');
    this.thrustActive = false;
    this.activeUfoTrack = null;
  }

  clearExtraShipStopTimer() {
    if (this.extraShipStopTimer !== null) {
      globalThis.clearTimeout?.(this.extraShipStopTimer);
      this.extraShipStopTimer = null;
    }

    const track = this.media.tracks.get('extraShip');
    if (track && this.extraShipMetadataHandler) {
      track.removeEventListener?.('loadedmetadata', this.extraShipMetadataHandler);
      this.extraShipMetadataHandler = null;
    }
  }
}
