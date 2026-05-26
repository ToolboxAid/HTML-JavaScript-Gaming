import MediaTrackService from "../../../../src/engine/audio/MediaTrackService.js";

export class MidiPlaybackService {
  constructor({ mediaTracks = new MediaTrackService() } = {}) {
    this.mediaTracks = mediaTracks;
    this.activeTrackId = "";
  }

  async play(song, { loop = false } = {}) {
    const sourceMidi = String(song?.sourceMidi || "").trim();
    if (!song?.id) {
      return { ok: false, message: "No MIDI song is selected." };
    }
    if (!sourceMidi) {
      return {
        ok: false,
        message: `Missing MIDI source for ${song.name}. Add music.songs[].sourceMidi in game.manifest.json.`
      };
    }
    if (!this.mediaTracks.isSupported()) {
      return { ok: false, message: "Media playback is unavailable in this browser." };
    }
    const trackId = `midi-studio-v2:${song.id}`;
    this.mediaTracks.register(trackId, { loop, src: sourceMidi, volume: 1 });
    const played = await this.mediaTracks.play(trackId);
    if (!played) {
      return {
        ok: false,
        message: this.mediaTracks.lastError || `MIDI preview failed for ${sourceMidi}. Browser MIDI playback may be unsupported; use rendered OGG/MP3 for gameplay.`
      };
    }
    this.activeTrackId = trackId;
    return { ok: true, trackId };
  }

  stop() {
    if (!this.activeTrackId) {
      return false;
    }
    const stopped = this.mediaTracks.stop(this.activeTrackId);
    this.activeTrackId = "";
    return stopped;
  }
}
