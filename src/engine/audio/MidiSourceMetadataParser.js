export class MidiSourceMetadataParser {
  parse(arrayBuffer) {
    if (!(arrayBuffer instanceof ArrayBuffer)) {
      return { ok: false, message: "MIDI source bytes are unavailable." };
    }
    const view = new DataView(arrayBuffer);
    if (view.byteLength < 14) {
      return { ok: false, message: "MIDI source is too small to contain a Standard MIDI File header." };
    }
    if (this.readAscii(view, 0, 4) !== "MThd") {
      return { ok: false, message: "MIDI source is missing the MThd header chunk." };
    }
    const headerLength = view.getUint32(4);
    if (headerLength < 6) {
      return { ok: false, message: `MIDI header length ${headerLength} is invalid; expected at least 6 bytes.` };
    }
    const trackOffset = 8 + headerLength;
    if (trackOffset > view.byteLength) {
      return { ok: false, message: "MIDI header extends beyond the available source bytes." };
    }
    const format = view.getUint16(8);
    const trackCount = view.getUint16(10);
    const division = view.getUint16(12);
    if ((division & 0x8000) !== 0) {
      return { ok: false, message: "MIDI source uses SMPTE time division; ticks-per-quarter-note metadata is unavailable." };
    }
    const tracks = this.readTracks(view, trackOffset, trackCount);
    if (!tracks.ok) {
      return tracks;
    }
    return {
      format,
      ok: true,
      ticksPerQuarterNote: division,
      trackCount,
      tracks: tracks.tracks,
      validationStatus: `Valid Standard MIDI File header with ${tracks.tracks.length} declared track chunk${tracks.tracks.length === 1 ? "" : "s"}.`
    };
  }

  readTracks(view, offset, trackCount) {
    const tracks = [];
    let cursor = offset;
    while (cursor < view.byteLength && tracks.length < trackCount) {
      if (cursor + 8 > view.byteLength) {
        return { ok: false, message: "MIDI track chunk header is truncated." };
      }
      const chunkType = this.readAscii(view, cursor, 4);
      const length = view.getUint32(cursor + 4);
      const dataOffset = cursor + 8;
      const nextCursor = dataOffset + length;
      if (nextCursor > view.byteLength) {
        return { ok: false, message: `MIDI track chunk ${tracks.length + 1} length exceeds source bytes.` };
      }
      if (chunkType !== "MTrk") {
        return { ok: false, message: `MIDI chunk ${tracks.length + 1} is ${chunkType || "unknown"}; expected MTrk.` };
      }
      tracks.push({ length, offset: dataOffset });
      cursor = nextCursor;
    }
    if (tracks.length !== trackCount) {
      return { ok: false, message: `MIDI header declares ${trackCount} tracks but ${tracks.length} track chunks were found.` };
    }
    return { ok: true, tracks };
  }

  readAscii(view, offset, length) {
    if (offset + length > view.byteLength) {
      return "";
    }
    let value = "";
    for (let index = 0; index < length; index += 1) {
      value += String.fromCharCode(view.getUint8(offset + index));
    }
    return value;
  }
}
