import { MidiSourceMetadataParser } from "../../../../src/engine/audio/MidiSourceMetadataParser.js";

export class MidiSourceInspectionService {
  constructor({ fetchImpl = null, parser = new MidiSourceMetadataParser() } = {}) {
    this.fetchImpl = fetchImpl || globalThis.fetch?.bind(globalThis) || null;
    this.parser = parser;
  }

  async inspect(song) {
    if (!song?.id) {
      return { ok: false, message: "No MIDI song is selected." };
    }
    const sourceMidi = String(song.sourceMidi || "").trim();
    if (!sourceMidi) {
      return {
        ok: false,
        message: `Missing MIDI source for ${song.name}. Add music.songs[].sourceMidi in game.manifest.json.`
      };
    }
    if (typeof this.fetchImpl !== "function") {
      return { ok: false, message: "Fetch API is unavailable for MIDI source inspection." };
    }
    let response;
    try {
      response = await this.fetchImpl(sourceMidi);
    } catch (error) {
      return {
        ok: false,
        message: `MIDI source load failed for ${sourceMidi}: ${error.message}`
      };
    }
    if (!response?.ok) {
      return {
        ok: false,
        message: `MIDI source load failed for ${sourceMidi}: HTTP ${response?.status || "unknown"}.`
      };
    }
    const parsed = this.parser.parse(await response.arrayBuffer());
    if (!parsed.ok) {
      return {
        ok: false,
        message: `MIDI source validation failed for ${sourceMidi}: ${parsed.message}`
      };
    }
    return { ...parsed, path: sourceMidi };
  }

  async inspectFile(file) {
    if (!file) {
      return { ok: false, message: "No MIDI source file selected." };
    }
    const fileName = String(file.name || "").trim();
    if (!/\.(mid|midi)$/i.test(fileName)) {
      return { ok: false, message: `MIDI source import rejected for ${fileName || "selected file"}: choose a .mid or .midi file.` };
    }
    let parsed;
    try {
      parsed = this.parser.parse(await file.arrayBuffer());
    } catch (error) {
      return {
        ok: false,
        message: `MIDI source import failed for ${fileName}: ${error.message || "file could not be read"}`
      };
    }
    if (!parsed.ok) {
      return {
        ok: false,
        message: `MIDI source validation failed for ${fileName}: ${parsed.message}`
      };
    }
    return { ...parsed, fileName, path: fileName, size: file.size };
  }
}
