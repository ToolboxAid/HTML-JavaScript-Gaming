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
    const events = this.readTrackEvents(view, tracks.tracks);
    if (!events.ok) {
      return events;
    }
    const durationSeconds = this.estimateDurationSeconds({
      maxTick: events.maxTick,
      tempoEvents: events.tempoEvents,
      ticksPerQuarterNote: division
    });
    const measureTiming = this.createMeasureTiming({
      maxTick: events.maxTick,
      ticksPerQuarterNote: division,
      timeSignatureEvents: events.timeSignatureEvents
    });
    return {
      channelSummary: this.formatChannelSummary(events.channels),
      channels: events.channels,
      durationSeconds,
      format,
      eventCounts: events.eventCounts,
      instrumentSummary: this.formatInstrumentSummary(events.programChanges),
      loopSafeDurationSeconds: durationSeconds,
      measureTiming,
      measureTimingSummary: this.formatMeasureTimingSummary(measureTiming),
      normalizedNotes: events.normalizedNotes,
      normalizedNoteCount: events.normalizedNotes.length,
      ok: true,
      programChanges: events.programChanges,
      ticksPerQuarterNote: division,
      trackCount,
      tempoEvents: events.tempoEvents,
      tempoSummary: this.formatTempoSummary(events.tempoEvents),
      timeSignatureEvents: events.timeSignatureEvents,
      timeSignatureSummary: this.formatTimeSignatureSummary(events.timeSignatureEvents),
      trackActivity: events.trackActivity,
      trackActivitySummary: this.formatTrackActivitySummary(events.trackActivity),
      tracks: tracks.tracks,
      validationStatus: `Valid Standard MIDI File header with ${tracks.tracks.length} declared track chunk${tracks.tracks.length === 1 ? "" : "s"}.`,
      warningSummary: this.formatWarnings(events.warnings),
      warnings: events.warnings
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

  readTrackEvents(view, tracks) {
    const eventCounts = {
      meta: 0,
      midi: 0,
      noteOff: 0,
      noteOn: 0,
      system: 0
    };
    const channelMap = new Map();
    const openNotes = new Map();
    const normalizedNotes = [];
    const programChanges = [];
    const tempoEvents = [];
    const trackActivity = tracks.map((track, index) => ({
      eventCount: 0,
      index: index + 1,
      length: track.length,
      metaEvents: 0,
      noteEvents: 0,
      notes: 0,
      programChanges: 0,
      systemEvents: 0
    }));
    const timeSignatureEvents = [];
    const warnings = [];
    let maxTick = 0;
    for (let trackIndex = 0; trackIndex < tracks.length; trackIndex += 1) {
      const track = tracks[trackIndex];
      const activity = trackActivity[trackIndex];
      let absoluteTick = 0;
      let cursor = track.offset;
      let runningStatus = 0;
      const endOffset = track.offset + track.length;
      while (cursor < endOffset) {
        const delta = this.readVariableLengthQuantity(view, cursor, endOffset);
        if (!delta.ok) {
          return { ok: false, message: `MIDI track ${trackIndex + 1} has invalid delta time: ${delta.message}` };
        }
        cursor = delta.nextOffset;
        absoluteTick += delta.value;
        maxTick = Math.max(maxTick, absoluteTick);
        if (cursor >= endOffset) {
          return { ok: false, message: `MIDI track ${trackIndex + 1} ended after delta time without an event.` };
        }
        let status = view.getUint8(cursor);
        if (status < 0x80) {
          if (!runningStatus) {
            return { ok: false, message: `MIDI track ${trackIndex + 1} uses running status before any channel status byte.` };
          }
          status = runningStatus;
        } else {
          cursor += 1;
          runningStatus = status < 0xf0 ? status : 0;
        }
        if (status === 0xff) {
          const meta = this.readMetaEvent(view, cursor, endOffset, absoluteTick, trackIndex);
          if (!meta.ok) {
            return meta;
          }
          cursor = meta.nextOffset;
          eventCounts.meta += 1;
          activity.eventCount += 1;
          activity.metaEvents += 1;
          if (meta.tempoEvent) {
            tempoEvents.push(meta.tempoEvent);
          }
          if (meta.timeSignatureEvent) {
            timeSignatureEvents.push(meta.timeSignatureEvent);
          }
          continue;
        }
        if (status === 0xf0 || status === 0xf7) {
          const systemEvent = this.readSystemEvent(view, cursor, endOffset, trackIndex);
          if (!systemEvent.ok) {
            return systemEvent;
          }
          cursor = systemEvent.nextOffset;
          eventCounts.system += 1;
          activity.eventCount += 1;
          activity.systemEvents += 1;
          warnings.push(`Track ${trackIndex + 1} contains unsupported system/SysEx event 0x${status.toString(16)} at tick ${absoluteTick}; event was skipped for normalized timeline output.`);
          continue;
        }
        const channelEvent = this.readChannelEvent(view, cursor, endOffset, status, trackIndex);
        if (!channelEvent.ok) {
          return channelEvent;
        }
        cursor = channelEvent.nextOffset;
        eventCounts.midi += 1;
        activity.eventCount += 1;
        this.updateChannelSummary(channelMap, channelEvent);
        if (channelEvent.programChange) {
          activity.programChanges += 1;
          programChanges.push({
            channel: channelEvent.channel,
            program: channelEvent.data1,
            tick: absoluteTick,
            track: trackIndex + 1
          });
        }
        if (channelEvent.noteOn) {
          eventCounts.noteOn += 1;
          activity.noteEvents += 1;
          this.openNote(openNotes, channelEvent, absoluteTick, trackIndex);
        }
        if (channelEvent.noteOff) {
          eventCounts.noteOff += 1;
          activity.noteEvents += 1;
          const note = this.closeNote(openNotes, channelEvent, absoluteTick, trackIndex);
          if (note) {
            activity.notes += 1;
            normalizedNotes.push(note);
          } else {
            warnings.push(`Track ${trackIndex + 1} has note-off without matching note-on for channel ${channelEvent.channel}, note ${channelEvent.noteNumber} at tick ${absoluteTick}.`);
          }
        }
      }
    }
    openNotes.forEach((entries) => {
      entries.forEach((entry) => {
        warnings.push(`Track ${entry.track} has note-on without matching note-off for channel ${entry.channel}, note ${entry.noteNumber} at tick ${entry.startTick}.`);
      });
    });
    trackActivity.forEach((activity) => {
      if (!activity.noteEvents && !activity.programChanges && !activity.systemEvents && activity.metaEvents <= 1) {
        warnings.push(`Track ${activity.index} has no note, program, tempo, or time signature activity.`);
      }
    });
    const channels = Array.from(channelMap.values()).sort((left, right) => left.channel - right.channel);
    normalizedNotes.sort((left, right) => left.startTick - right.startTick || left.channel - right.channel || left.noteNumber - right.noteNumber);
    programChanges.sort((left, right) => left.tick - right.tick || left.channel - right.channel);
    tempoEvents.sort((left, right) => left.tick - right.tick);
    timeSignatureEvents.sort((left, right) => left.tick - right.tick);
    return {
      channels,
      eventCounts,
      maxTick,
      normalizedNotes,
      ok: true,
      programChanges,
      tempoEvents,
      timeSignatureEvents,
      trackActivity,
      warnings
    };
  }

  readMetaEvent(view, offset, endOffset, tick, trackIndex) {
    if (offset >= endOffset) {
      return { ok: false, message: `MIDI track ${trackIndex + 1} has a truncated meta event type.` };
    }
    const type = view.getUint8(offset);
    const length = this.readVariableLengthQuantity(view, offset + 1, endOffset);
    if (!length.ok) {
      return { ok: false, message: `MIDI track ${trackIndex + 1} has invalid meta event length: ${length.message}` };
    }
    const dataOffset = length.nextOffset;
    const nextOffset = dataOffset + length.value;
    if (nextOffset > endOffset) {
      return { ok: false, message: `MIDI track ${trackIndex + 1} meta event length exceeds track bytes.` };
    }
    if (type === 0x51) {
      if (length.value !== 3) {
        return { ok: false, message: `MIDI track ${trackIndex + 1} tempo event length ${length.value} is invalid; expected 3 bytes.` };
      }
      const microsecondsPerQuarterNote = (view.getUint8(dataOffset) << 16) | (view.getUint8(dataOffset + 1) << 8) | view.getUint8(dataOffset + 2);
      return {
        nextOffset,
        ok: true,
        tempoEvent: {
          bpm: this.roundBpm(60000000 / microsecondsPerQuarterNote),
          microsecondsPerQuarterNote,
          tick
        }
      };
    }
    if (type === 0x58) {
      if (length.value < 4) {
        return { ok: false, message: `MIDI track ${trackIndex + 1} time signature event is truncated.` };
      }
      const numerator = view.getUint8(dataOffset);
      const denominator = 2 ** view.getUint8(dataOffset + 1);
      return {
        nextOffset,
        ok: true,
        timeSignatureEvent: {
          denominator,
          numerator,
          tick
        }
      };
    }
    return { nextOffset, ok: true };
  }

  readSystemEvent(view, offset, endOffset, trackIndex) {
    const length = this.readVariableLengthQuantity(view, offset, endOffset);
    if (!length.ok) {
      return { ok: false, message: `MIDI track ${trackIndex + 1} has invalid system event length: ${length.message}` };
    }
    const nextOffset = length.nextOffset + length.value;
    if (nextOffset > endOffset) {
      return { ok: false, message: `MIDI track ${trackIndex + 1} system event length exceeds track bytes.` };
    }
    return { nextOffset, ok: true };
  }

  readChannelEvent(view, offset, endOffset, status, trackIndex) {
    const command = status & 0xf0;
    const channel = (status & 0x0f) + 1;
    const dataLength = command === 0xc0 || command === 0xd0 ? 1 : 2;
    if (status < 0x80 || status > 0xef) {
      return { ok: false, message: `MIDI track ${trackIndex + 1} has unsupported event status 0x${status.toString(16)}.` };
    }
    if (offset + dataLength > endOffset) {
      return { ok: false, message: `MIDI track ${trackIndex + 1} channel event is truncated.` };
    }
    const data1 = view.getUint8(offset);
    const data2 = dataLength === 2 ? view.getUint8(offset + 1) : 0;
    return {
      channel,
      command,
      data1,
      data2,
      nextOffset: offset + dataLength,
      noteNumber: data1,
      noteOff: command === 0x80 || (command === 0x90 && data2 === 0),
      noteOn: command === 0x90 && data2 > 0,
      ok: true,
      programChange: command === 0xc0
    };
  }

  updateChannelSummary(channelMap, event) {
    if (!channelMap.has(event.channel)) {
      channelMap.set(event.channel, {
        channel: event.channel,
        eventCount: 0,
        noteCount: 0,
        programs: []
      });
    }
    const channel = channelMap.get(event.channel);
    channel.eventCount += 1;
    if (event.noteOn) {
      channel.noteCount += 1;
    }
    if (event.programChange && !channel.programs.includes(event.data1)) {
      channel.programs.push(event.data1);
      channel.programs.sort((left, right) => left - right);
    }
  }

  openNote(openNotes, event, absoluteTick, trackIndex) {
    const key = `${event.channel}:${event.noteNumber}`;
    const entries = openNotes.get(key) || [];
    entries.push({
      channel: event.channel,
      noteNumber: event.noteNumber,
      startTick: absoluteTick,
      track: trackIndex + 1,
      velocity: event.data2
    });
    openNotes.set(key, entries);
  }

  closeNote(openNotes, event, absoluteTick, trackIndex) {
    const key = `${event.channel}:${event.noteNumber}`;
    const entries = openNotes.get(key) || [];
    const started = entries.shift();
    if (!entries.length) {
      openNotes.delete(key);
    } else {
      openNotes.set(key, entries);
    }
    if (!started) {
      return null;
    }
    return {
      channel: event.channel,
      durationTicks: Math.max(0, absoluteTick - started.startTick),
      endTick: absoluteTick,
      noteNumber: event.noteNumber,
      startTick: started.startTick,
      track: trackIndex + 1,
      velocity: started.velocity
    };
  }

  readVariableLengthQuantity(view, offset, endOffset) {
    let value = 0;
    for (let count = 0; count < 4; count += 1) {
      if (offset + count >= endOffset) {
        return { ok: false, message: "variable-length quantity is truncated." };
      }
      const byte = view.getUint8(offset + count);
      value = (value << 7) | (byte & 0x7f);
      if ((byte & 0x80) === 0) {
        return { nextOffset: offset + count + 1, ok: true, value };
      }
    }
    return { ok: false, message: "variable-length quantity exceeds 4 bytes." };
  }

  estimateDurationSeconds({ maxTick, tempoEvents, ticksPerQuarterNote }) {
    let seconds = 0;
    let tick = 0;
    let microsecondsPerQuarterNote = 500000;
    tempoEvents.forEach((event) => {
      if (event.tick > tick) {
        seconds += ((event.tick - tick) / ticksPerQuarterNote) * (microsecondsPerQuarterNote / 1000000);
        tick = event.tick;
      }
      microsecondsPerQuarterNote = event.microsecondsPerQuarterNote;
    });
    if (maxTick > tick) {
      seconds += ((maxTick - tick) / ticksPerQuarterNote) * (microsecondsPerQuarterNote / 1000000);
    }
    return Number(seconds.toFixed(3));
  }

  createMeasureTiming({ maxTick, ticksPerQuarterNote, timeSignatureEvents }) {
    const signature = timeSignatureEvents[0] || { denominator: 4, numerator: 4, tick: 0 };
    const ticksPerBar = ticksPerQuarterNote * signature.numerator * (4 / signature.denominator);
    return {
      estimatedBars: ticksPerBar ? Number((maxTick / ticksPerBar).toFixed(2)) : 0,
      maxTick,
      ticksPerBar,
      timeSignature: `${signature.numerator}/${signature.denominator}`
    };
  }

  formatTempoSummary(tempoEvents) {
    if (!tempoEvents.length) {
      return "Default 120 BPM";
    }
    return tempoEvents.map((event) => `${event.bpm} BPM at tick ${event.tick}`).join("; ");
  }

  formatTimeSignatureSummary(timeSignatureEvents) {
    if (!timeSignatureEvents.length) {
      return "not declared";
    }
    return timeSignatureEvents.map((event) => `${event.numerator}/${event.denominator} at tick ${event.tick}`).join("; ");
  }

  formatChannelSummary(channels) {
    if (!channels.length) {
      return "No channel events";
    }
    return channels.map((channel) => `Ch ${channel.channel}: ${channel.noteCount} notes, ${channel.eventCount} events`).join("; ");
  }

  formatInstrumentSummary(programChanges) {
    if (!programChanges.length) {
      return "No program changes";
    }
    return programChanges.map((event) => `Ch ${event.channel} program ${event.program} at tick ${event.tick}`).join("; ");
  }

  formatMeasureTimingSummary(measureTiming) {
    return `${measureTiming.estimatedBars} bars at ${measureTiming.timeSignature}`;
  }

  formatTrackActivitySummary(trackActivity) {
    if (!trackActivity.length) {
      return "No tracks";
    }
    return trackActivity.map((track) => `Track ${track.index}: ${track.notes} notes, ${track.eventCount} events`).join("; ");
  }

  formatWarnings(warnings) {
    return warnings.length ? warnings.join("; ") : "none";
  }

  roundBpm(value) {
    return Number(value.toFixed(2)).toString();
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
