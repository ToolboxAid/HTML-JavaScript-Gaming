import MediaTrackService from "../../../../src/engine/audio/MediaTrackService.js";

export class MidiPlaybackService {
  constructor({ mediaTracks = new MediaTrackService() } = {}) {
    this.mediaTracks = mediaTracks;
    this.activeTrackId = "";
  }

  renderedPreviewSource(song) {
    const rendered = song?.rendered || {};
    const preferredFormat = String(song?.defaultRuntimeFormat || "ogg").trim().toLowerCase();
    const orderedFormats = [
      preferredFormat,
      "ogg",
      "mp3",
      "wav"
    ].filter((format, index, formats) => format && formats.indexOf(format) === index);
    for (const format of orderedFormats) {
      const path = String(rendered[format] || "").trim();
      if (path) {
        return { format, path };
      }
    }
    return null;
  }

  async playRenderedPreview(song, { loop = false } = {}) {
    if (!song?.id) {
      return { ok: false, message: "No MIDI song is selected." };
    }
    const previewSource = this.renderedPreviewSource(song);
    if (!previewSource) {
      return {
        ok: false,
        liveMidiNotImplemented: true,
        message: `No rendered audio target is available for ${song.name}, and no live MIDI engine is available. Add rendered OGG/MP3/WAV targets or implement shared src MIDI parser/synth/instrument capability.`
      };
    }
    if (!this.mediaTracks.isSupported()) {
      return { ok: false, message: "Media playback is unavailable in this browser." };
    }
    const trackId = `midi-studio-v2:${song.id}`;
    this.mediaTracks.register(trackId, { loop, src: previewSource.path, volume: 1 });
    const played = await this.mediaTracks.play(trackId);
    if (!played) {
      return {
        ok: false,
        message: this.mediaTracks.lastError || `Rendered ${previewSource.format.toUpperCase()} preview failed for ${previewSource.path}.`
      };
    }
    this.activeTrackId = trackId;
    return { format: previewSource.format, ok: true, path: previewSource.path, trackId };
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
